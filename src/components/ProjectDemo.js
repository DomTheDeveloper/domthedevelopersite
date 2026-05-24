import React, { useEffect, useRef, useState } from 'react';

/* ============ CloudSync Dashboard ============ */
const CloudSyncDemo = () => {
  const [bars, setBars] = useState(() => Array.from({ length: 24 }, () => 20 + Math.random() * 60));
  const [metrics, setMetrics] = useState({ rps: 18420, p99: 42, err: 0.12, cpu: 38 });
  const [spark, setSpark] = useState(() => Array.from({ length: 40 }, () => 30 + Math.random() * 40));

  useEffect(() => {
    const id = setInterval(() => {
      setBars(prev => [...prev.slice(1), 20 + Math.random() * 70]);
      setSpark(prev => [...prev.slice(1), 20 + Math.random() * 60]);
      setMetrics(m => ({
        rps: Math.max(1000, Math.round(m.rps + (Math.random() - 0.5) * 1800)),
        p99: Math.max(10, Math.round(m.p99 + (Math.random() - 0.5) * 8)),
        err: Math.max(0, +(m.err + (Math.random() - 0.5) * 0.06).toFixed(2)),
        cpu: Math.min(95, Math.max(5, Math.round(m.cpu + (Math.random() - 0.5) * 10))),
      }));
    }, 700);
    return () => clearInterval(id);
  }, []);

  const sparkPath = spark.map((v, i) => `${i === 0 ? 'M' : 'L'} ${(i / (spark.length - 1)) * 100} ${100 - v}`).join(' ');

  return (
    <div className="demo demo--cloudsync">
      <div className="demo__topbar">
        <span className="demo__dot demo__dot--live" /> LIVE · us-east-1
        <span className="demo__topbar-right">CloudSync v3.2</span>
      </div>
      <div className="demo__stats">
        <div className="demo__stat"><div className="demo__stat-label">req/s</div><div className="demo__stat-value">{metrics.rps.toLocaleString()}</div></div>
        <div className="demo__stat"><div className="demo__stat-label">p99</div><div className="demo__stat-value">{metrics.p99}ms</div></div>
        <div className="demo__stat"><div className="demo__stat-label">err%</div><div className="demo__stat-value">{metrics.err}</div></div>
        <div className="demo__stat"><div className="demo__stat-label">cpu</div><div className="demo__stat-value">{metrics.cpu}%</div></div>
      </div>
      <div className="demo__chart">
        <div className="demo__chart-label">Throughput · last 24s</div>
        <div className="demo__bars">
          {bars.map((b, i) => (
            <div key={i} className="demo__bar" style={{ height: `${b}%`, opacity: 0.4 + (i / bars.length) * 0.6 }} />
          ))}
        </div>
      </div>
      <div className="demo__spark">
        <div className="demo__chart-label">Latency trend</div>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="demo__spark-svg">
          <path d={sparkPath} fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
    </div>
  );
};

/* ============ DevFlow CLI ============ */
const DevFlowDemo = () => {
  const [lines, setLines] = useState([
    { t: 'out', text: 'DevFlow CLI v2.4.0 — try: help, init <name>, deploy, status' },
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current && endRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const run = (raw) => {
    const cmd = raw.trim();
    const append = (...items) => setLines(prev => [...prev, ...items]);
    append({ t: 'cmd', text: cmd });
    if (!cmd) return;
    const [head, ...rest] = cmd.split(/\s+/);
    switch (head) {
      case 'help':
        append({ t: 'out', text: 'commands: init <name>, scaffold <stack>, deploy [target], status, clear' });
        break;
      case 'init': {
        const name = rest[0] || 'my-app';
        append(
          { t: 'out', text: `✓ scaffolded ${name}/` },
          { t: 'out', text: '✓ wrote Dockerfile, .github/workflows/ci.yml' },
          { t: 'out', text: `✓ initialized git repo` },
          { t: 'ok', text: `ready: cd ${name} && devflow deploy` },
        );
        break;
      }
      case 'scaffold': {
        const stack = rest[0] || 'fastapi';
        append({ t: 'out', text: `✓ template "${stack}" applied · 14 files written` });
        break;
      }
      case 'deploy': {
        const tgt = rest[0] || 'fly';
        append(
          { t: 'out', text: `→ building image …` },
          { t: 'out', text: `→ pushing to registry …` },
          { t: 'out', text: `→ rolling out to ${tgt} …` },
          { t: 'ok', text: `✓ live at https://demo.${tgt}.dev (took 47s)` },
        );
        break;
      }
      case 'status':
        append({ t: 'out', text: 'env: prod · region: iad · 3 services · all healthy ✓' });
        break;
      case 'clear':
        setLines([]); return;
      default:
        append({ t: 'err', text: `unknown command: ${head} (try: help)` });
    }
  };

  const onKey = (e) => {
    if (e.key === 'Enter') {
      run(input);
      setInput('');
    }
  };

  return (
    <div className="demo demo--devflow">
      <div className="demo__topbar">
        <span className="demo__dot" style={{ background: '#ff5f57' }} />
        <span className="demo__dot" style={{ background: '#febc2e' }} />
        <span className="demo__dot" style={{ background: '#28c840' }} />
        <span className="demo__topbar-right">devflow · ~/projects</span>
      </div>
      <div className="demo__term">
        {lines.map((l, i) => (
          <div key={i} className={`demo__term-line demo__term-line--${l.t}`}>
            {l.t === 'cmd' ? <><span className="demo__term-prompt">$</span> {l.text}</> : l.text}
          </div>
        ))}
        <div className="demo__term-input-row">
          <span className="demo__term-prompt">$</span>
          <input
            className="demo__term-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder="type a command…"
            autoFocus={false}
          />
        </div>
        <div ref={endRef} />
      </div>
    </div>
  );
};

/* ============ NeuralNet Studio ============ */
const NeuralNetDemo = () => {
  const [layers, setLayers] = useState([3, 5, 5, 2]);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 600);
    return () => clearInterval(id);
  }, []);

  const W = 320, H = 200, padX = 24, padY = 18;
  const layerX = (i) => padX + (i * (W - padX * 2)) / (layers.length - 1);
  const nodeY = (count, i) => {
    if (count === 1) return H / 2;
    const span = H - padY * 2;
    return padY + (i * span) / (count - 1);
  };
  const nodes = layers.flatMap((c, li) =>
    Array.from({ length: c }, (_, i) => ({ x: layerX(li), y: nodeY(c, i), li, i }))
  );
  const edges = [];
  for (let l = 0; l < layers.length - 1; l++) {
    for (let i = 0; i < layers[l]; i++) {
      for (let j = 0; j < layers[l + 1]; j++) {
        edges.push({
          x1: layerX(l), y1: nodeY(layers[l], i),
          x2: layerX(l + 1), y2: nodeY(layers[l + 1], j),
          w: 0.15 + ((i * 13 + j * 7 + l * 5) % 7) / 10,
          live: ((i + j + l + tick) % 5) === 0,
        });
      }
    }
  }

  const updateLayer = (idx, delta) => {
    setLayers(prev => prev.map((c, i) => i === idx ? Math.min(8, Math.max(1, c + delta)) : c));
  };
  const addLayer = () => setLayers(prev => prev.length < 6 ? [...prev.slice(0, -1), 4, prev[prev.length - 1]] : prev);
  const removeLayer = () => setLayers(prev => prev.length > 2 ? [...prev.slice(0, -2), prev[prev.length - 1]] : prev);

  return (
    <div className="demo demo--neural">
      <div className="demo__topbar">
        <span className="demo__dot demo__dot--live" /> training · epoch {tick}
        <span className="demo__topbar-right">loss: {(0.42 / (tick + 1) + 0.04).toFixed(3)}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="demo__net">
        {edges.map((e, i) => (
          <line
            key={i}
            x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
            stroke="currentColor"
            strokeOpacity={e.live ? 0.9 : e.w * 0.35}
            strokeWidth={e.live ? 1.2 : 0.6}
          />
        ))}
        {nodes.map((n, i) => (
          <circle
            key={i}
            cx={n.x} cy={n.y} r="6"
            fill="var(--bg-card)"
            stroke="currentColor"
            strokeWidth="1.4"
          />
        ))}
      </svg>
      <div className="demo__net-controls">
        {layers.map((c, i) => (
          <div key={i} className="demo__net-layer">
            <span className="demo__net-layer-label">L{i}</span>
            <button onClick={() => updateLayer(i, -1)} aria-label="dec">−</button>
            <span className="demo__net-layer-count">{c}</span>
            <button onClick={() => updateLayer(i, +1)} aria-label="inc">+</button>
          </div>
        ))}
        <div className="demo__net-actions">
          <button onClick={addLayer}>+ layer</button>
          <button onClick={removeLayer}>− layer</button>
        </div>
      </div>
    </div>
  );
};

/* ============ QuantumChat ============ */
const QuantumChatDemo = () => {
  const seed = [
    { who: 'them', text: 'Yo, did the keys rotate?', ttl: 7 },
    { who: 'me', text: 'Yep — auto-rotated at 02:00 UTC.', ttl: 5 },
    { who: 'them', text: 'Cipher ok?', ttl: 4 },
  ];
  const [msgs, setMsgs] = useState(seed);
  const [draft, setDraft] = useState('');
  useEffect(() => {
    const id = setInterval(() => {
      setMsgs(prev => prev
        .map(m => ({ ...m, ttl: Math.max(0, m.ttl - 1) }))
        .filter(m => m.ttl > 0)
      );
    }, 1500);
    return () => clearInterval(id);
  }, []);

  const send = () => {
    const t = draft.trim();
    if (!t) return;
    setMsgs(prev => [...prev, { who: 'me', text: t, ttl: 8 }]);
    setDraft('');
    setTimeout(() => {
      setMsgs(prev => [...prev, { who: 'them', text: '🔒 ack — sealed envelope received', ttl: 7 }]);
    }, 900);
  };

  const cipherize = (s) => s.split('').map(() => '▓').join('').slice(0, 16);

  return (
    <div className="demo demo--chat">
      <div className="demo__topbar">
        <span className="demo__dot demo__dot--live" /> e2e secured · 1 peer
        <span className="demo__topbar-right">🔒 sealed</span>
      </div>
      <div className="demo__chat-feed">
        {msgs.map((m, i) => (
          <div key={i} className={`demo__chat-msg demo__chat-msg--${m.who}`}>
            <div className="demo__chat-cipher">{cipherize(m.text)}</div>
            <div className="demo__chat-text">{m.text}</div>
            <div className="demo__chat-ttl">disappears in {m.ttl}s</div>
          </div>
        ))}
        {msgs.length === 0 && <div className="demo__chat-empty">all messages have self-destructed.</div>}
      </div>
      <div className="demo__chat-input-row">
        <input
          className="demo__term-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="encrypted message…"
        />
        <button onClick={send} className="demo__chat-send">send</button>
      </div>
    </div>
  );
};

/* ============ HyperAPI Gateway ============ */
const HYPER_ROUTES = [
  { path: '/v1/users', method: 'GET' },
  { path: '/v1/orders', method: 'POST' },
  { path: '/v1/search', method: 'GET' },
  { path: '/v1/auth/token', method: 'POST' },
  { path: '/v1/metrics', method: 'GET' },
];

const HyperApiDemo = () => {
  const [reqs, setReqs] = useState([]);
  const [stats, setStats] = useState({ ok: 0, cached: 0, throttled: 0 });
  useEffect(() => {
    const id = setInterval(() => {
      const r = HYPER_ROUTES[Math.floor(Math.random() * HYPER_ROUTES.length)];
      const roll = Math.random();
      const status = roll < 0.18 ? 'cached' : roll < 0.26 ? 'throttled' : 'ok';
      const lat = status === 'cached' ? 2 + Math.random() * 5
        : status === 'throttled' ? 1
        : 12 + Math.random() * 40;
      const entry = {
        id: Math.random().toString(36).slice(2, 9),
        ...r,
        status,
        lat: lat.toFixed(0),
        code: status === 'throttled' ? 429 : status === 'cached' ? 200 : 200,
      };
      setReqs(prev => [entry, ...prev].slice(0, 8));
      setStats(s => ({
        ok: s.ok + (status === 'ok' ? 1 : 0),
        cached: s.cached + (status === 'cached' ? 1 : 0),
        throttled: s.throttled + (status === 'throttled' ? 1 : 0),
      }));
    }, 520);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="demo demo--api">
      <div className="demo__topbar">
        <span className="demo__dot demo__dot--live" /> gateway live · 5 routes
        <span className="demo__topbar-right">edge: iad</span>
      </div>
      <div className="demo__stats">
        <div className="demo__stat"><div className="demo__stat-label">ok</div><div className="demo__stat-value">{stats.ok}</div></div>
        <div className="demo__stat"><div className="demo__stat-label">cached</div><div className="demo__stat-value">{stats.cached}</div></div>
        <div className="demo__stat"><div className="demo__stat-label">throttled</div><div className="demo__stat-value">{stats.throttled}</div></div>
      </div>
      <div className="demo__api-feed">
        {reqs.map((r) => (
          <div key={r.id} className={`demo__api-row demo__api-row--${r.status}`}>
            <span className="demo__api-method">{r.method}</span>
            <span className="demo__api-path">{r.path}</span>
            <span className="demo__api-code">{r.code}</span>
            <span className="demo__api-lat">{r.lat}ms</span>
            <span className="demo__api-tag">{r.status}</span>
          </div>
        ))}
        {reqs.length === 0 && <div className="demo__chat-empty">awaiting traffic…</div>}
      </div>
    </div>
  );
};

/* ============ PixelForge ============ */
const PixelForgeDemo = () => {
  const canvasRef = useRef(null);
  const [hue, setHue] = useState(190);
  const [speed, setSpeed] = useState(1);
  const stateRef = useRef({ hue: 190, speed: 1, t: 0, raf: 0 });

  useEffect(() => { stateRef.current.hue = hue; }, [hue]);
  useEffect(() => { stateRef.current.speed = speed; }, [speed]);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    const W = cvs.width = 320;
    const H = cvs.height = 200;
    const draw = () => {
      const s = stateRef.current;
      s.t += 0.02 * s.speed;
      const img = ctx.createImageData(W, H);
      for (let y = 0; y < H; y += 2) {
        for (let x = 0; x < W; x += 2) {
          const v = Math.sin(x * 0.04 + s.t)
            + Math.cos(y * 0.05 + s.t * 1.3)
            + Math.sin((x + y) * 0.02 + s.t * 0.7);
          const n = (v + 3) / 6;
          const h = (s.hue + n * 80) % 360;
          const [r, g, b] = hslToRgb(h / 360, 0.7, 0.15 + n * 0.5);
          for (let dy = 0; dy < 2; dy++) {
            for (let dx = 0; dx < 2; dx++) {
              const idx = ((y + dy) * W + (x + dx)) * 4;
              img.data[idx] = r;
              img.data[idx + 1] = g;
              img.data[idx + 2] = b;
              img.data[idx + 3] = 255;
            }
          }
        }
      }
      ctx.putImageData(img, 0, 0);
      s.raf = requestAnimationFrame(draw);
    };
    draw();
    const s = stateRef.current;
    return () => cancelAnimationFrame(s.raf);
  }, []);

  return (
    <div className="demo demo--pixel">
      <div className="demo__topbar">
        <span className="demo__dot demo__dot--live" /> shader · live
        <span className="demo__topbar-right">pixelforge.glsl</span>
      </div>
      <canvas ref={canvasRef} className="demo__pixel-canvas" />
      <div className="demo__pixel-controls">
        <label>hue
          <input type="range" min="0" max="360" value={hue} onChange={(e) => setHue(+e.target.value)} />
        </label>
        <label>speed
          <input type="range" min="0" max="3" step="0.1" value={speed} onChange={(e) => setSpeed(+e.target.value)} />
        </label>
      </div>
    </div>
  );
};

function hslToRgb(h, s, l) {
  let r, g, b;
  if (s === 0) { r = g = b = l; }
  else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

const demos = {
  'cloudsync-dashboard': CloudSyncDemo,
  'devflow-cli': DevFlowDemo,
  'neuralnet-studio': NeuralNetDemo,
  'quantumchat': QuantumChatDemo,
  'hyperapi-gateway': HyperApiDemo,
  'pixelforge': PixelForgeDemo,
};

const ProjectDemo = ({ slug }) => {
  const Demo = demos[slug];
  if (!Demo) return null;
  return <Demo />;
};

export default ProjectDemo;
