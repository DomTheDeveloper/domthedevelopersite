import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useActive } from './motion';

/* Synthetic telemetry, but not random numbers.
 *
 * Independent Math.random() draws per metric are what make a fake dashboard
 * look fake: the series has no memory, and CPU sits still while throughput
 * swings. This models one load signal per service and derives everything from
 * it, so the metrics move together the way a real service's do:
 *
 *   demand   slow wave + mean-reverting noise (Ornstein–Uhlenbeck)
 *   util     demand / capacity
 *   p99      queueing curve — blows up as util approaches 1
 *   rps      served traffic, which PLATEAUS once demand exceeds capacity
 *   cpu      tracks utilisation, with lag
 *   err      ~0 until saturation, then climbs fast
 */

const SERVICES = [
  { id: 'api-gateway', name: 'api-gateway', capacity: 24000, p99Base: 26, errFloor: 0.02, phase: 0.0 },
  { id: 'checkout', name: 'checkout', capacity: 6200, p99Base: 54, errFloor: 0.05, phase: 1.7 },
  { id: 'search', name: 'search', capacity: 32000, p99Base: 21, errFloor: 0.01, phase: 3.1 },
  { id: 'auth', name: 'auth', capacity: 14000, p99Base: 15, errFloor: 0.01, phase: 4.6 },
];

const HISTORY = 48;
const TICK = 500;
const NOMINAL = 0.55; // baseline utilisation when nothing is wrong
const REPLICAS = 4;
const RECOVER_TICKS = 14; // one replica rejoins every ~7s

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

// Box–Muller. Uniform noise looks synthetic; real jitter is roughly normal.
const gauss = () => {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

const initOne = (svc) => {
  const rps = svc.capacity * NOMINAL;
  return {
    noise: 0,
    stress: 0,
    replicasDown: 0,
    recoverIn: 0,
    util: NOMINAL,
    rps,
    p99: svc.p99Base / (1 - Math.pow(NOMINAL, 1.8)),
    cpu: NOMINAL * 100,
    err: svc.errFloor,
    capacity: svc.capacity,
    hist: {
      rps: Array(HISTORY).fill(rps),
      p99: Array(HISTORY).fill(svc.p99Base / (1 - Math.pow(NOMINAL, 1.8))),
    },
  };
};

const initState = () => Object.fromEntries(SERVICES.map((s) => [s.id, initOne(s)]));

const step = (svc, s, tSec) => {
  // Mean-reverting noise: today's value depends on yesterday's, which is what
  // gives a real series its texture.
  const noise = s.noise * 0.82 + gauss() * 0.045;

  // A slow cycle plus a faster ripple, so traffic has shape rather than hum.
  const wave = 1
    + 0.17 * Math.sin((tSec / 47) * Math.PI * 2 + svc.phase)
    + 0.06 * Math.sin((tSec / 11) * Math.PI * 2 + svc.phase * 2);

  const stress = s.stress * 0.955;

  // Capacity comes back one replica at a time, not as a smooth curve — so the
  // ceiling steps up and throughput sits flat against it in between.
  let replicasDown = s.replicasDown;
  let recoverIn = s.recoverIn - 1;
  if (replicasDown > 0 && recoverIn <= 0) {
    replicasDown -= 1;
    recoverIn = RECOVER_TICKS;
  }

  const demand = svc.capacity * NOMINAL * wave * (1 + noise) * (1 + stress * 1.25);
  const capacity = svc.capacity * ((REPLICAS - replicasDown) / REPLICAS);
  const util = clamp(demand / capacity, 0.02, 0.995);

  // Queueing delay: fine until it isn't. This hockey stick is the single
  // biggest reason the chart reads as real.
  const p99Target = Math.min(4000, svc.p99Base / (1 - Math.pow(util, 1.8)));

  // Served throughput cannot exceed capacity — during an incident the bars
  // flatten while latency climbs, which is the actual signature of overload.
  const rpsTarget = Math.min(demand, capacity * 0.995);

  const cpuTarget = clamp(util * 96 + 4, 3, 99);
  const errTarget = svc.errFloor + Math.pow(Math.max(0, util - 0.9), 1.5) * 130;

  // Displayed values lag their targets slightly, like a real scrape interval.
  const ema = (cur, target, k) => cur + (target - cur) * k;
  // Hard-clamp after smoothing: when replicas drop, the ceiling falls
  // instantly while the EMA is still catching up, and a dashboard showing
  // more traffic served than capacity exists is the tell that it's fake.
  const rps = Math.min(ema(s.rps, rpsTarget, 0.4), capacity * 0.995);
  const p99 = ema(s.p99, p99Target, 0.45);
  const cpu = ema(s.cpu, cpuTarget, 0.25);
  const err = ema(s.err, errTarget, 0.35);

  return {
    noise,
    stress,
    replicasDown,
    recoverIn,
    capacity,
    util,
    rps,
    p99,
    cpu,
    err,
    hist: {
      rps: [...s.hist.rps.slice(1), rps],
      p99: [...s.hist.p99.slice(1), p99],
    },
  };
};

let alertSeq = 0;

const CloudSyncDemo = () => {
  const active = useActive();
  const [selected, setSelected] = useState('api-gateway');
  const [state, setState] = useState(initState);
  const [alerts, setAlerts] = useState([]);
  const [paused, setPaused] = useState(false);
  const firedRef = useRef({});
  const clockRef = useRef(0);

  const running = active && !paused;

  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => {
      clockRef.current += TICK / 1000;
      const tSec = clockRef.current;
      setState((prev) => {
        const next = {};
        const raised = [];
        SERVICES.forEach((svc) => {
          const s = step(svc, prev[svc.id], tSec);
          next[svc.id] = s;

          const breaching = s.p99 > svc.p99Base * 3 || s.err > 0.9;
          if (breaching && !firedRef.current[svc.id]) {
            firedRef.current[svc.id] = true;
            raised.push({
              id: `a${++alertSeq}`,
              svc: svc.name,
              text: s.err > 0.9
                ? `error rate ${s.err.toFixed(2)}% · utilisation ${(s.util * 100).toFixed(0)}%`
                : `p99 ${Math.round(s.p99)}ms — ${(s.p99 / svc.p99Base).toFixed(1)}× baseline`,
              sev: s.err > 2.5 ? 'critical' : 'warning',
              acked: false,
            });
          }
          if (!breaching && s.p99 < svc.p99Base * 2) firedRef.current[svc.id] = false;
        });
        if (raised.length) setAlerts((a) => [...raised, ...a].slice(0, 4));
        return next;
      });
    }, TICK);
    return () => clearInterval(id);
  }, [running]);

  const injectIncident = useCallback(() => {
    setState((prev) => ({
      ...prev,
      // A traffic surge and a partial capacity loss — the combination is what
      // actually pushes a service over the queueing cliff.
      [selected]: { ...prev[selected], stress: 0.9, replicasDown: 2, recoverIn: RECOVER_TICKS },
    }));
  }, [selected]);

  const svc = SERVICES.find((s) => s.id === selected);
  const d = state[selected];
  const degraded = d.util > 0.88;
  const healthyP99 = svc.p99Base / (1 - Math.pow(NOMINAL, 1.8));

  const maxP99 = Math.max(...d.hist.p99, healthyP99 * 1.6);
  const p99Path = d.hist.p99
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${(i / (HISTORY - 1)) * 100} ${100 - (v / maxP99) * 94}`)
    .join(' ');
  const baselineY = 100 - (healthyP99 / maxP99) * 94;

  return (
    <div className="demo demo--cloudsync">
      <div className="demo__topbar">
        <span className={`demo__dot ${running ? 'demo__dot--live' : ''}`} />
        {running ? 'LIVE' : 'PAUSED'} · us-east-1
        <span className="demo__topbar-right">
          {REPLICAS - d.replicasDown}/{REPLICAS} replicas
        </span>
      </div>

      <div className="demo__tabs" role="group" aria-label="Service">
        {SERVICES.map((s) => {
          const hot = state[s.id].util > 0.88;
          return (
            <button
              key={s.id}
              type="button"
              className={`demo__tab ${selected === s.id ? 'demo__tab--active' : ''} ${hot ? 'demo__tab--alert' : ''}`}
              aria-pressed={selected === s.id}
              onClick={() => setSelected(s.id)}
            >
              {s.name}
              {hot && <span className="demo__tab-badge" aria-label="degraded">!</span>}
            </button>
          );
        })}
      </div>

      <div className="demo__stats">
        <div className="demo__stat">
          <div className="demo__stat-label">req/s</div>
          <div className="demo__stat-value">{Math.round(d.rps).toLocaleString()}</div>
        </div>
        <div className={`demo__stat ${d.p99 > healthyP99 * 2 ? 'demo__stat--bad' : ''}`}>
          <div className="demo__stat-label">p99</div>
          <div className="demo__stat-value">{Math.round(d.p99)}ms</div>
        </div>
        <div className={`demo__stat ${d.err > 0.5 ? 'demo__stat--bad' : ''}`}>
          <div className="demo__stat-label">err%</div>
          <div className="demo__stat-value">{d.err.toFixed(2)}</div>
        </div>
        <div className={`demo__stat ${d.cpu > 88 ? 'demo__stat--bad' : ''}`}>
          <div className="demo__stat-label">cpu</div>
          <div className="demo__stat-value">{Math.round(d.cpu)}%</div>
        </div>
      </div>

      <div className="demo__util">
        <span className="demo__chart-label">utilisation</span>
        <div className="demo__util-track">
          <div
            className={`demo__util-fill ${degraded ? 'demo__util-fill--hot' : ''}`}
            style={{ width: `${d.util * 100}%` }}
          />
          <span className="demo__util-knee" style={{ left: '90%' }} aria-hidden="true" />
        </div>
        <span className="demo__util-value">{(d.util * 100).toFixed(0)}%</span>
      </div>

      <div className="demo__chart">
        <div className="demo__chart-label">
          {svc.name} · served req/s vs capacity
          {d.util > 0.97 && <span className="demo__chart-flag">saturated</span>}
        </div>
        <div className="demo__bars demo__bars--capped">
          <span
            className={`demo__capacity-line ${d.capacity < svc.capacity * 0.98 ? 'demo__capacity-line--degraded' : ''}`}
            style={{ bottom: `${(d.capacity / svc.capacity) * 100}%` }}
          >
            <span className="demo__capacity-tag">
              capacity · {REPLICAS - d.replicasDown}/{REPLICAS}
            </span>
          </span>
          {d.hist.rps.map((b, i) => (
            <div
              key={i}
              className="demo__bar"
              style={{ height: `${Math.min(100, (b / svc.capacity) * 100)}%`, opacity: 0.35 + (i / HISTORY) * 0.65 }}
            />
          ))}
        </div>
      </div>

      <div className="demo__spark">
        <div className="demo__chart-label">
          p99 latency · last {Math.round((HISTORY * TICK) / 1000)}s
          {degraded && <span className="demo__chart-flag">queueing</span>}
        </div>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={`demo__spark-svg ${degraded ? 'demo__spark-svg--bad' : ''}`} aria-hidden="true">
          <line x1="0" y1={baselineY} x2="100" y2={baselineY} stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.35" vectorEffect="non-scaling-stroke" />
          <path d={p99Path} fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>

      <div className="demo__alerts">
        <div className="demo__chart-label">
          alerts
          {alerts.length > 0 && (
            <button type="button" className="demo__mini-btn" onClick={() => setAlerts((a) => a.map((x) => ({ ...x, acked: true })))}>
              ack all
            </button>
          )}
        </div>
        {alerts.length === 0 && <div className="demo__chat-empty">no active alerts — push a service past its capacity below</div>}
        {alerts.map((a) => (
          <div key={a.id} className={`demo__alert demo__alert--${a.sev} ${a.acked ? 'demo__alert--acked' : ''}`}>
            <span className="demo__alert-sev">{a.acked ? 'ackd' : a.sev}</span>
            <span className="demo__alert-svc">{a.svc}</span>
            <span className="demo__alert-text">{a.text}</span>
          </div>
        ))}
      </div>

      <div className="demo__controls">
        <button type="button" className="demo__btn demo__btn--danger" onClick={injectIncident}>
          Overload {svc.name}
        </button>
        <button type="button" className="demo__btn" onClick={() => setPaused((p) => !p)}>
          {paused ? 'Resume' : 'Pause'}
        </button>
        <button
          type="button"
          className="demo__btn"
          onClick={() => { setState(initState()); setAlerts([]); firedRef.current = {}; clockRef.current = 0; }}
        >
          Reset
        </button>
      </div>

      <p className="demo__caption">
        Synthetic traffic, real model. One load signal per service drives everything else, so
        latency follows a queueing curve rather than a random number — hit overload and watch
        throughput flatten against capacity while p99 goes vertical.
      </p>
    </div>
  );
};

export default CloudSyncDemo;
