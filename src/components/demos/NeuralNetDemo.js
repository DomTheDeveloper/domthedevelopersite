import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useActive } from './motion';

/* ---------- a small, honest MLP: real forward pass, real backprop ---------- */

const makeNet = (sizes) => {
  const W = [];
  const B = [];
  for (let l = 0; l < sizes.length - 1; l++) {
    const fanIn = sizes[l];
    const fanOut = sizes[l + 1];
    const w = new Float64Array(fanIn * fanOut);
    // Xavier-ish init; too small and tanh units start dead, too big and they saturate.
    const scale = Math.sqrt(2 / (fanIn + fanOut)) * 1.6;
    for (let i = 0; i < w.length; i++) w[i] = (Math.random() * 2 - 1) * scale;
    W.push(w);
    B.push(new Float64Array(fanOut));
  }
  return { sizes, W, B };
};

// tanh hidden units, sigmoid output. Returns every activation for backprop.
const forward = (net, x) => {
  const acts = [x];
  let a = x;
  const last = net.W.length - 1;
  for (let l = 0; l <= last; l++) {
    const fanIn = net.sizes[l];
    const fanOut = net.sizes[l + 1];
    const out = new Float64Array(fanOut);
    const w = net.W[l];
    const b = net.B[l];
    for (let j = 0; j < fanOut; j++) {
      let s = b[j];
      for (let i = 0; i < fanIn; i++) s += w[i * fanOut + j] * a[i];
      out[j] = l === last ? 1 / (1 + Math.exp(-s)) : Math.tanh(s);
    }
    acts.push(out);
    a = out;
  }
  return acts;
};

const predict = (net, x0, x1) => forward(net, Float64Array.from([x0, x1]))[net.W.length][0];

// Full-batch gradient descent on binary cross-entropy.
const trainStep = (net, data, lr) => {
  const L = net.W.length;
  const gW = net.W.map((w) => new Float64Array(w.length));
  const gB = net.B.map((b) => new Float64Array(b.length));
  let loss = 0;

  for (let p = 0; p < data.length; p++) {
    const point = data[p];
    const acts = forward(net, point.x);
    const yhat = acts[L][0];
    const y = point.y;
    const eps = 1e-7;
    loss += -(y * Math.log(yhat + eps) + (1 - y) * Math.log(1 - yhat + eps));

    // dL/dz at the output is just (yhat - y) for sigmoid + BCE.
    let delta = Float64Array.from([yhat - y]);
    for (let l = L - 1; l >= 0; l--) {
      const fanIn = net.sizes[l];
      const fanOut = net.sizes[l + 1];
      const a = acts[l];
      const gw = gW[l];
      const gb = gB[l];
      for (let j = 0; j < fanOut; j++) {
        const d = delta[j];
        gb[j] += d;
        for (let i = 0; i < fanIn; i++) gw[i * fanOut + j] += a[i] * d;
      }
      if (l > 0) {
        const prev = new Float64Array(fanIn);
        const w = net.W[l];
        for (let i = 0; i < fanIn; i++) {
          let s = 0;
          for (let j = 0; j < fanOut; j++) s += w[i * fanOut + j] * delta[j];
          prev[i] = s * (1 - a[i] * a[i]); // tanh'
        }
        delta = prev;
      }
    }
  }

  const n = data.length;
  for (let l = 0; l < L; l++) {
    const w = net.W[l];
    const b = net.B[l];
    for (let i = 0; i < w.length; i++) w[i] -= (lr * gW[l][i]) / n;
    for (let j = 0; j < b.length; j++) b[j] -= (lr * gB[l][j]) / n;
  }
  return loss / n;
};

const accuracy = (net, data) => {
  let ok = 0;
  for (let i = 0; i < data.length; i++) {
    const yhat = forward(net, data[i].x)[net.W.length][0];
    if ((yhat > 0.5 ? 1 : 0) === data[i].y) ok++;
  }
  return ok / data.length;
};

/* ---------------------------- datasets ---------------------------- */

const DATASETS = {
  xor: {
    label: 'XOR',
    gen: (n) => Array.from({ length: n }, () => {
      const x = Math.random() * 2 - 1;
      const y = Math.random() * 2 - 1;
      return { x: Float64Array.from([x, y]), y: (x > 0) !== (y > 0) ? 1 : 0 };
    }),
  },
  circle: {
    label: 'Circle',
    gen: (n) => Array.from({ length: n }, () => {
      const x = Math.random() * 2 - 1;
      const y = Math.random() * 2 - 1;
      return { x: Float64Array.from([x, y]), y: Math.hypot(x, y) < 0.55 ? 1 : 0 };
    }),
  },
  spiral: {
    label: 'Spiral',
    gen: (n) => Array.from({ length: n }, (_, i) => {
      const cls = i % 2;
      const r = (i / n) * 1.0 + 0.08;
      const t = ((i / n) * 3.2) + cls * Math.PI + (Math.random() - 0.5) * 0.25;
      return { x: Float64Array.from([r * Math.sin(t), r * Math.cos(t)]), y: cls };
    }),
  },
};

const POINTS = 140;
const GRID = 34;

const NeuralNetDemo = () => {
  const active = useActive();
  const canvasRef = useRef(null);
  const netRef = useRef(null);
  const dataRef = useRef([]);
  const frameRef = useRef(0);

  const [hidden, setHidden] = useState([6, 5]);
  const [dataset, setDataset] = useState('xor');
  const [lr, setLr] = useState(0.6);
  const [training, setTraining] = useState(true);
  const [epoch, setEpoch] = useState(0);
  const [loss, setLoss] = useState(null);
  const [acc, setAcc] = useState(0);
  const [curve, setCurve] = useState([]);

  const lrRef = useRef(lr);
  useEffect(() => { lrRef.current = lr; }, [lr]);

  const rebuild = useCallback(() => {
    netRef.current = makeNet([2, ...hidden, 1]);
    dataRef.current = DATASETS[dataset].gen(POINTS);
    frameRef.current = 0;
    setEpoch(0);
    setLoss(null);
    setAcc(0);
    setCurve([]);
  }, [hidden, dataset]);

  useEffect(() => { rebuild(); }, [rebuild]);

  const paint = useCallback(() => {
    const cvs = canvasRef.current;
    const net = netRef.current;
    if (!cvs || !net) return;
    const ctx = cvs.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = cvs.clientWidth || 300;
    const h = 220;
    if (cvs.width !== Math.floor(w * dpr)) {
      cvs.width = Math.floor(w * dpr);
      cvs.height = Math.floor(h * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    // Decision surface, sampled on a coarse grid and drawn as blocks.
    const cw = w / GRID;
    const ch = h / GRID;
    for (let gy = 0; gy < GRID; gy++) {
      for (let gx = 0; gx < GRID; gx++) {
        const x = (gx / (GRID - 1)) * 2 - 1;
        const y = 1 - (gy / (GRID - 1)) * 2;
        const p = predict(net, x, y);
        const t = Math.max(0, Math.min(1, p));
        // teal for class 1, deep blue for class 0, washed out near the boundary
        const conf = Math.abs(t - 0.5) * 2;
        const r = Math.round(18 + (1 - t) * 20);
        const g = Math.round(40 + t * 130);
        const b = Math.round(70 + t * 90);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.18 + conf * 0.5})`;
        ctx.fillRect(gx * cw, gy * ch, cw + 1, ch + 1);
      }
    }

    // Training points on top.
    dataRef.current.forEach((p) => {
      const px = ((p.x[0] + 1) / 2) * w;
      const py = ((1 - p.x[1]) / 2) * h;
      ctx.beginPath();
      ctx.arc(px, py, 2.8, 0, Math.PI * 2);
      ctx.fillStyle = p.y === 1 ? '#7dfcd8' : '#0a0e17';
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = p.y === 1 ? 'rgba(10,14,23,0.8)' : 'rgba(125,252,216,0.55)';
      ctx.stroke();
    });
  }, []);

  useEffect(() => { paint(); }, [paint, hidden, dataset]);

  useEffect(() => {
    if (!active || !training) return undefined;
    const id = setInterval(() => {
      const net = netRef.current;
      const data = dataRef.current;
      if (!net || !data.length) return;
      let l = 0;
      for (let i = 0; i < 8; i++) l = trainStep(net, data, lrRef.current);
      frameRef.current += 8;
      setEpoch(frameRef.current);
      setLoss(l);
      if (frameRef.current % 40 === 0) {
        setAcc(accuracy(net, data));
        setCurve((c) => [...c.slice(-59), l]);
      }
      paint();
    }, 45);
    return () => clearInterval(id);
  }, [active, training, paint]);

  const stepOnce = () => {
    const net = netRef.current;
    const data = dataRef.current;
    if (!net) return;
    const l = trainStep(net, data, lrRef.current);
    frameRef.current += 1;
    setEpoch(frameRef.current);
    setLoss(l);
    setAcc(accuracy(net, data));
    setCurve((c) => [...c.slice(-59), l]);
    paint();
  };

  const setNeurons = (idx, delta) =>
    setHidden((prev) => prev.map((c, i) => (i === idx ? Math.min(9, Math.max(1, c + delta)) : c)));
  const addLayer = () => setHidden((prev) => (prev.length < 4 ? [...prev, 4] : prev));
  const removeLayer = () => setHidden((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));

  const maxLoss = Math.max(...curve, 0.75);
  const curvePath = curve
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${(i / Math.max(1, curve.length - 1)) * 100} ${100 - (v / maxLoss) * 92}`)
    .join(' ');

  return (
    <div className="demo demo--neural">
      <div className="demo__topbar">
        <span className={`demo__dot ${active && training ? 'demo__dot--live' : ''}`} />
        {training ? 'training' : 'paused'} · epoch {epoch}
        <span className="demo__topbar-right">
          loss {loss === null ? '—' : loss.toFixed(4)} · acc {(acc * 100).toFixed(0)}%
        </span>
      </div>

      <div className="demo__tabs" role="group" aria-label="Dataset">
        {Object.entries(DATASETS).map(([key, d]) => (
          <button
            key={key}
            type="button"
            className={`demo__tab ${dataset === key ? 'demo__tab--active' : ''}`}
            aria-pressed={dataset === key}
            onClick={() => setDataset(key)}
          >
            {d.label}
          </button>
        ))}
      </div>

      <canvas
        ref={canvasRef}
        className="demo__net-canvas"
        style={{ height: 220 }}
        aria-label={`Decision boundary for the ${DATASETS[dataset].label} dataset, ${(acc * 100).toFixed(0)}% accurate`}
      />

      <div className="demo__spark">
        <div className="demo__chart-label">loss · {[2, ...hidden, 1].join(' → ')}</div>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="demo__spark-svg" aria-hidden="true">
          {curve.length > 1 && (
            <path d={curvePath} fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          )}
        </svg>
      </div>

      <div className="demo__net-controls">
        {hidden.map((c, i) => (
          <div key={i} className="demo__net-layer">
            <span className="demo__net-layer-label">h{i + 1}</span>
            <button type="button" onClick={() => setNeurons(i, -1)} aria-label={`Remove neuron from hidden layer ${i + 1}`}>−</button>
            <span className="demo__net-layer-count">{c}</span>
            <button type="button" onClick={() => setNeurons(i, +1)} aria-label={`Add neuron to hidden layer ${i + 1}`}>+</button>
          </div>
        ))}
        <div className="demo__net-actions">
          <button type="button" onClick={addLayer}>+ layer</button>
          <button type="button" onClick={removeLayer}>− layer</button>
        </div>
      </div>

      <label className="demo__slider">
        <span>learning rate</span>
        <input type="range" min="0.05" max="2" step="0.05" value={lr} onChange={(e) => setLr(+e.target.value)} />
        <output>{lr.toFixed(2)}</output>
      </label>

      <div className="demo__controls">
        <button type="button" className="demo__btn demo__btn--primary" onClick={() => setTraining((t) => !t)}>
          {training ? 'Pause' : 'Train'}
        </button>
        <button type="button" className="demo__btn" onClick={stepOnce} disabled={training}>Step</button>
        <button type="button" className="demo__btn" onClick={rebuild}>Reset</button>
      </div>
      <p className="demo__caption">
        Real backprop, running in your browser — not a canned animation. Add layers or push the
        learning rate past 1.5 and watch it stop converging.
      </p>
    </div>
  );
};

export default NeuralNetDemo;
