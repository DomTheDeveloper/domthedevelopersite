import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useActive } from './motion';

// weight = share of auto traffic. Real gateways see a very uneven mix.
const ROUTES = [
  { path: '/v1/users', method: 'GET', cacheable: true, base: 24, weight: 0.34 },
  { path: '/v1/search', method: 'GET', cacheable: true, base: 38, weight: 0.41 },
  { path: '/v1/orders', method: 'POST', cacheable: false, base: 52, weight: 0.16 },
  { path: '/v1/auth/token', method: 'POST', cacheable: false, base: 18, weight: 0.09 },
];

const gauss = () => {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

// Service latency is right-skewed, not uniform: most requests land near the
// median and a few drag out. Uniform noise would make p50 and p99 the same
// number, which is exactly the thing a gateway demo should not do.
const sampleLatency = (base) => {
  const body = base * Math.exp(gauss() * 0.42);
  const tail = Math.random() < 0.05 ? 2.5 + Math.random() * 5 : 1;
  return body * tail;
};

const pick = () => {
  let r = Math.random();
  for (const route of ROUTES) {
    r -= route.weight;
    if (r <= 0) return route;
  }
  return ROUTES[0];
};

const percentile = (sorted, q) => {
  if (!sorted.length) return 0;
  const i = Math.min(sorted.length - 1, Math.floor(q * sorted.length));
  return sorted[i];
};

const BUCKET_CAP = 5;
const REFILL_MS = 1400;

let reqSeq = 0;

const HyperApiDemo = () => {
  const active = useActive();
  const [rateLimit, setRateLimit] = useState(true);
  const [cache, setCache] = useState(true);
  const [autoTraffic, setAutoTraffic] = useState(true);
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState({ ok: 0, cached: 0, throttled: 0 });
  const [pct, setPct] = useState({ p50: 0, p99: 0 });
  const latRef = useRef([]);

  // Real token bucket and real cache — the toggles actually change behaviour.
  const tokens = useRef(BUCKET_CAP);
  const cacheStore = useRef(new Map());
  const settings = useRef({ rateLimit, cache });
  useEffect(() => { settings.current = { rateLimit, cache }; }, [rateLimit, cache]);

  useEffect(() => {
    const id = setInterval(() => {
      tokens.current = Math.min(BUCKET_CAP, tokens.current + 1);
    }, REFILL_MS);
    return () => clearInterval(id);
  }, []);

  // Cached entries expire on their own so the hit rate stays believable.
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      cacheStore.current.forEach((exp, k) => { if (exp < now) cacheStore.current.delete(k); });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const fire = useCallback((route) => {
    const { rateLimit: rl, cache: ch } = settings.current;
    const key = `${route.method} ${route.path}`;
    let status;
    let lat;
    let code;

    if (rl && tokens.current < 1) {
      status = 'throttled';
      code = 429;
      lat = 1;
    } else {
      if (rl) tokens.current -= 1;
      const hit = ch && route.cacheable && cacheStore.current.has(key);
      if (hit) {
        status = 'cached';
        code = 200;
        lat = 2 + Math.random() * 3.5;
      } else {
        status = 'ok';
        code = 200;
        lat = sampleLatency(route.base);
        if (ch && route.cacheable) cacheStore.current.set(key, Date.now() + 4000);
      }
    }

    const entry = {
      id: `r${++reqSeq}`,
      method: route.method,
      path: route.path,
      status,
      code,
      lat: lat.toFixed(0),
    };
    if (status !== 'throttled') {
      latRef.current = [...latRef.current.slice(-199), lat];
      const sorted = [...latRef.current].sort((a, b) => a - b);
      setPct({ p50: percentile(sorted, 0.5), p99: percentile(sorted, 0.99) });
    }
    setRows((prev) => [entry, ...prev].slice(0, 9));
    setStats((s) => ({
      ok: s.ok + (status === 'ok' ? 1 : 0),
      cached: s.cached + (status === 'cached' ? 1 : 0),
      throttled: s.throttled + (status === 'throttled' ? 1 : 0),
    }));
  }, []);

  useEffect(() => {
    if (!active || !autoTraffic) return undefined;
    const id = setInterval(() => {
      fire(pick());
    }, 900);
    return () => clearInterval(id);
  }, [active, autoTraffic, fire]);

  const [bucketView, setBucketView] = useState(BUCKET_CAP);
  useEffect(() => {
    const id = setInterval(() => setBucketView(Math.floor(tokens.current)), 150);
    return () => clearInterval(id);
  }, []);


  return (
    <div className="demo demo--api">
      <div className="demo__topbar">
        <span className={`demo__dot ${active && autoTraffic ? 'demo__dot--live' : ''}`} /> gateway · 4 routes
        <span className="demo__topbar-right">edge: iad</span>
      </div>

      <div className="demo__stats">
        <div className="demo__stat"><div className="demo__stat-label">ok</div><div className="demo__stat-value">{stats.ok}</div></div>
        <div className="demo__stat"><div className="demo__stat-label">cached</div><div className="demo__stat-value">{stats.cached}</div></div>
        <div className="demo__stat"><div className="demo__stat-label">429s</div><div className="demo__stat-value">{stats.throttled}</div></div>
        <div className="demo__stat"><div className="demo__stat-label">p50</div><div className="demo__stat-value">{pct.p50.toFixed(0)}ms</div></div>
        <div className="demo__stat"><div className="demo__stat-label">p99</div><div className="demo__stat-value">{pct.p99.toFixed(0)}ms</div></div>
      </div>

      <div className="demo__bucket">
        <span className="demo__chart-label">token bucket</span>
        <div className="demo__bucket-tokens" aria-label={`${bucketView} of ${BUCKET_CAP} tokens available`}>
          {Array.from({ length: BUCKET_CAP }, (_, i) => (
            <span key={i} className={`demo__token ${i < bucketView ? 'demo__token--full' : ''}`} />
          ))}
        </div>
        <span className="demo__bucket-hint">
          {rateLimit ? `refills 1 / ${REFILL_MS / 1000}s` : 'limiter disabled'}
        </span>
      </div>

      <div className="demo__route-buttons">
        {ROUTES.map((r) => (
          <button key={r.path} type="button" className="demo__route-btn" onClick={() => fire(r)}>
            <span className={`demo__api-method demo__api-method--${r.method.toLowerCase()}`}>{r.method}</span>
            {r.path}
          </button>
        ))}
      </div>

      <div className="demo__api-feed">
        {rows.map((r) => (
          <div key={r.id} className={`demo__api-row demo__api-row--${r.status}`}>
            <span className="demo__api-method">{r.method}</span>
            <span className="demo__api-path">{r.path}</span>
            <span className="demo__api-code">{r.code}</span>
            <span className="demo__api-lat">{r.lat}ms</span>
            <span className="demo__api-tag">{r.status}</span>
          </div>
        ))}
        {rows.length === 0 && <div className="demo__chat-empty">fire a route above, or turn on auto traffic…</div>}
      </div>

      <div className="demo__controls demo__controls--wrap">
        <button type="button" className={`demo__toggle ${rateLimit ? 'demo__toggle--on' : ''}`} aria-pressed={rateLimit} onClick={() => setRateLimit((v) => !v)}>
          Rate limit
        </button>
        <button type="button" className={`demo__toggle ${cache ? 'demo__toggle--on' : ''}`} aria-pressed={cache} onClick={() => setCache((v) => !v)}>
          Edge cache
        </button>
        <button type="button" className={`demo__toggle ${autoTraffic ? 'demo__toggle--on' : ''}`} aria-pressed={autoTraffic} onClick={() => setAutoTraffic((v) => !v)}>
          Auto traffic
        </button>
        <button
          type="button"
          className="demo__btn"
          onClick={() => {
            setRows([]);
            setStats({ ok: 0, cached: 0, throttled: 0 });
            setPct({ p50: 0, p99: 0 });
            latRef.current = [];
            cacheStore.current.clear();
            tokens.current = BUCKET_CAP;
          }}
        >
          Reset
        </button>
      </div>
      <p className="demo__caption">
        The limiter and cache are real, and so is the latency distribution — log-normal with a
        5% slow tail, so p99 sits well above p50 the way it does in production. Spam a route to
        drain the bucket into 429s, or hit the same GET twice to see it served from cache.
      </p>
    </div>
  );
};

export default HyperApiDemo;
