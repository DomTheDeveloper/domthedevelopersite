import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useActive } from './motion';

const SERVICES = [
  { id: 'api-gateway', name: 'api-gateway', base: { rps: 18400, p99: 42, err: 0.12, cpu: 38 } },
  { id: 'checkout', name: 'checkout', base: { rps: 4200, p99: 88, err: 0.31, cpu: 54 } },
  { id: 'search', name: 'search', base: { rps: 26700, p99: 31, err: 0.06, cpu: 61 } },
  { id: 'auth', name: 'auth', base: { rps: 9100, p99: 24, err: 0.02, cpu: 22 } },
];

const HISTORY = 32;

const jitter = (v, pct) => v * (1 + (Math.random() - 0.5) * pct);

const makeSeries = (base) => ({
  rps: Array.from({ length: HISTORY }, () => jitter(base.rps, 0.18)),
  p99: Array.from({ length: HISTORY }, () => jitter(base.p99, 0.3)),
  current: { ...base },
  // 0 = healthy. Climbs when an incident is injected, then decays.
  stress: 0,
});

const initialState = () =>
  Object.fromEntries(SERVICES.map((s) => [s.id, makeSeries(s.base)]));

let alertSeq = 0;

const CloudSyncDemo = () => {
  const active = useActive();
  const [selected, setSelected] = useState('api-gateway');
  const [state, setState] = useState(initialState);
  const [alerts, setAlerts] = useState([]);
  const [paused, setPaused] = useState(false);
  const firedRef = useRef({});

  const running = active && !paused;

  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => {
      setState((prev) => {
        const next = {};
        const raised = [];
        SERVICES.forEach((svc) => {
          const s = prev[svc.id];
          const stress = s.stress * 0.88;
          const mult = 1 + stress;
          const cur = {
            rps: Math.max(200, jitter(svc.base.rps, 0.12) / (1 + stress * 0.5)),
            p99: jitter(svc.base.p99, 0.2) * mult * mult,
            err: Math.max(0, jitter(svc.base.err, 0.5) + stress * 4),
            cpu: Math.min(99, jitter(svc.base.cpu, 0.15) * (1 + stress * 0.6)),
          };
          // Anomaly detection: alert once per excursion, not once per tick.
          const breaching = cur.p99 > svc.base.p99 * 2.2 || cur.err > 1.5;
          if (breaching && !firedRef.current[svc.id]) {
            firedRef.current[svc.id] = true;
            raised.push({
              id: `a${++alertSeq}`,
              svc: svc.name,
              text: cur.err > 1.5 ? `error rate ${cur.err.toFixed(2)}% over threshold` : `p99 ${Math.round(cur.p99)}ms — 2.2× baseline`,
              sev: cur.err > 3 ? 'critical' : 'warning',
              acked: false,
            });
          }
          if (!breaching) firedRef.current[svc.id] = false;

          next[svc.id] = {
            rps: [...s.rps.slice(1), cur.rps],
            p99: [...s.p99.slice(1), cur.p99],
            current: cur,
            stress,
          };
        });
        if (raised.length) setAlerts((a) => [...raised, ...a].slice(0, 4));
        return next;
      });
    }, 700);
    return () => clearInterval(id);
  }, [running]);

  const injectIncident = useCallback(() => {
    setState((prev) => ({
      ...prev,
      [selected]: { ...prev[selected], stress: 1.6 },
    }));
  }, [selected]);

  const ackAll = () => setAlerts((a) => a.map((x) => ({ ...x, acked: true })));

  const svc = SERVICES.find((s) => s.id === selected);
  const data = state[selected];
  const cur = data.current;
  const degraded = data.stress > 0.08;

  const max = Math.max(...data.p99, 1);
  const path = data.p99
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${(i / (HISTORY - 1)) * 100} ${100 - (v / max) * 92}`)
    .join(' ');

  return (
    <div className="demo demo--cloudsync">
      <div className="demo__topbar">
        <span className={`demo__dot ${running ? 'demo__dot--live' : ''}`} />
        {running ? 'LIVE' : 'PAUSED'} · us-east-1
        <span className="demo__topbar-right">CloudSync v3.2</span>
      </div>

      <div className="demo__tabs" role="group" aria-label="Service">
        {SERVICES.map((s) => {
          const hot = state[s.id].stress > 0.08;
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
        <div className="demo__stat"><div className="demo__stat-label">req/s</div><div className="demo__stat-value">{Math.round(cur.rps).toLocaleString()}</div></div>
        <div className={`demo__stat ${degraded ? 'demo__stat--bad' : ''}`}><div className="demo__stat-label">p99</div><div className="demo__stat-value">{Math.round(cur.p99)}ms</div></div>
        <div className={`demo__stat ${cur.err > 1 ? 'demo__stat--bad' : ''}`}><div className="demo__stat-label">err%</div><div className="demo__stat-value">{cur.err.toFixed(2)}</div></div>
        <div className="demo__stat"><div className="demo__stat-label">cpu</div><div className="demo__stat-value">{Math.round(cur.cpu)}%</div></div>
      </div>

      <div className="demo__chart">
        <div className="demo__chart-label">{svc.name} · throughput</div>
        <div className="demo__bars">
          {data.rps.map((b, i) => (
            <div
              key={i}
              className="demo__bar"
              style={{ height: `${Math.min(100, (b / (svc.base.rps * 1.4)) * 100)}%`, opacity: 0.35 + (i / HISTORY) * 0.65 }}
            />
          ))}
        </div>
      </div>

      <div className="demo__spark">
        <div className="demo__chart-label">latency · p99 {degraded && <span className="demo__chart-flag">anomaly</span>}</div>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={`demo__spark-svg ${degraded ? 'demo__spark-svg--bad' : ''}`} aria-hidden="true">
          <path d={path} fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>

      <div className="demo__alerts">
        <div className="demo__chart-label">
          alerts
          {alerts.length > 0 && (
            <button type="button" className="demo__mini-btn" onClick={ackAll}>ack all</button>
          )}
        </div>
        {alerts.length === 0 && <div className="demo__chat-empty">no active alerts — inject an incident below</div>}
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
          Inject incident into {svc.name}
        </button>
        <button type="button" className="demo__btn" onClick={() => setPaused((p) => !p)}>
          {paused ? 'Resume' : 'Pause'}
        </button>
        <button
          type="button"
          className="demo__btn"
          onClick={() => { setState(initialState()); setAlerts([]); firedRef.current = {}; }}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default CloudSyncDemo;
