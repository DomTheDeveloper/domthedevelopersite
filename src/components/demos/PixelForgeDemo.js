import React, { useEffect, useRef, useState } from 'react';
import { useActive } from './motion';

/* Each preset is a real per-pixel field function plus the GLSL it stands in
   for, so the code panel and the picture agree. */
const PRESETS = {
  plasma: {
    label: 'plasma',
    glsl: `float v = sin(uv.x * 8.0 + t)
     + cos(uv.y * 10.0 + t * 1.3)
     + sin((uv.x + uv.y) * 4.0 + t * 0.7);
return v / 3.0;`,
    field: (x, y, t, s) => {
      const v = Math.sin(x * 8 * s + t) + Math.cos(y * 10 * s + t * 1.3) + Math.sin((x + y) * 4 * s + t * 0.7);
      return v / 3;
    },
  },
  ripple: {
    label: 'ripple',
    glsl: `vec2 c = uv - 0.5;
float d = length(c) * 14.0;
return sin(d - t * 3.0) / (1.0 + d * 0.3);`,
    field: (x, y, t, s) => {
      const dx = x - 0.5;
      const dy = y - 0.5;
      const d = Math.hypot(dx, dy) * 14 * s;
      return Math.sin(d - t * 3) / (1 + d * 0.3);
    },
  },
  tunnel: {
    label: 'tunnel',
    glsl: `vec2 c = uv - 0.5;
float a = atan(c.y, c.x);
float r = 0.35 / (length(c) + 0.08);
return sin(r * 6.0 + a * 3.0 - t * 2.0);`,
    field: (x, y, t, s) => {
      const dx = x - 0.5;
      const dy = y - 0.5;
      const a = Math.atan2(dy, dx);
      const r = 0.35 / (Math.hypot(dx, dy) + 0.08);
      return Math.sin(r * 6 * s + a * 3 - t * 2);
    },
  },
  lattice: {
    label: 'lattice',
    glsl: `float gx = sin(uv.x * 24.0 + t);
float gy = sin(uv.y * 24.0 - t * 0.8);
return gx * gy;`,
    field: (x, y, t, s) => Math.sin(x * 24 * s + t) * Math.sin(y * 24 * s - t * 0.8),
  },
  warp: {
    label: 'warp',
    glsl: `vec2 p = uv * 3.0;
p += 0.4 * vec2(sin(p.y * 3.0 + t),
                cos(p.x * 3.0 - t));
return sin(p.x * 2.0) * cos(p.y * 2.0);`,
    field: (x, y, t, s) => {
      const px = x * 3 * s + 0.4 * Math.sin(y * 9 + t);
      const py = y * 3 * s + 0.4 * Math.cos(x * 9 - t);
      return Math.sin(px * 2) * Math.cos(py * 2);
    },
  },
};

function hslToRgb(h, s, l) {
  let r;
  let g;
  let b;
  if (s === 0) {
    r = l; g = l; b = l;
  } else {
    const hue2rgb = (p, q, tt) => {
      let t = tt;
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

const W = 320;
const H = 200;

const PixelForgeDemo = () => {
  const active = useActive();
  const canvasRef = useRef(null);
  const [preset, setPreset] = useState('plasma');
  const [hue, setHue] = useState(190);
  const [speed, setSpeed] = useState(1);
  const [scale, setScale] = useState(1);
  const [pixel, setPixel] = useState(2);
  const [playing, setPlaying] = useState(true);
  const [fps, setFps] = useState(0);

  const cfg = useRef({ preset, hue, speed, scale, pixel, playing, t: 0 });
  useEffect(() => { cfg.current = { ...cfg.current, preset, hue, speed, scale, pixel, playing }; },
    [preset, hue, speed, scale, pixel, playing]);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return undefined;
    const ctx = cvs.getContext('2d');
    if (!ctx) return undefined;
    cvs.width = W;
    cvs.height = H;

    let raf = 0;
    let cancelled = false;
    let frames = 0;
    let last = 0;
    let fpsAccum = 0;

    const draw = (now) => {
      if (cancelled) return;
      const c = cfg.current;
      const running = active && c.playing;
      if (running) c.t += 0.02 * c.speed;

      const step = c.pixel;
      const img = ctx.createImageData(W, H);
      const fn = PRESETS[c.preset].field;
      for (let y = 0; y < H; y += step) {
        for (let x = 0; x < W; x += step) {
          const n = (fn(x / W, y / H, c.t, c.scale) + 1) / 2;
          const h = (c.hue + n * 90) % 360;
          const [r, g, b] = hslToRgb(h / 360, 0.72, 0.12 + n * 0.55);
          for (let dy = 0; dy < step && y + dy < H; dy++) {
            for (let dx = 0; dx < step && x + dx < W; dx++) {
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

      if (last) {
        fpsAccum += 1000 / Math.max(1, now - last);
        frames++;
        if (frames >= 20) { setFps(Math.round(fpsAccum / frames)); frames = 0; fpsAccum = 0; }
      }
      last = now;

      if (running) raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => { cancelled = true; cancelAnimationFrame(raf); };
  }, [active, playing, preset, pixel, scale]);

  const randomize = () => {
    const keys = Object.keys(PRESETS);
    setPreset(keys[Math.floor(Math.random() * keys.length)]);
    setHue(Math.floor(Math.random() * 360));
    setSpeed(+(0.4 + Math.random() * 2).toFixed(1));
    setScale(+(0.6 + Math.random() * 1.6).toFixed(2));
  };

  return (
    <div className="demo demo--pixel">
      <div className="demo__topbar">
        <span className={`demo__dot ${active && playing ? 'demo__dot--live' : ''}`} /> {playing ? 'compiled' : 'paused'} · {fps} fps
        <span className="demo__topbar-right">{preset}.glsl</span>
      </div>

      <div className="demo__tabs" role="group" aria-label="Shader preset">
        {Object.entries(PRESETS).map(([key, p]) => (
          <button
            key={key}
            type="button"
            className={`demo__tab ${preset === key ? 'demo__tab--active' : ''}`}
            aria-pressed={preset === key}
            onClick={() => setPreset(key)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <canvas ref={canvasRef} className="demo__pixel-canvas" aria-label={`Animated ${preset} shader`} />

      <pre className="demo__code" aria-label="Shader source">
        <code>{`// ${preset}.glsl · uv ∈ [0,1]², t = time
float shade(vec2 uv, float t) {
${PRESETS[preset].glsl.split('\n').map((l) => `  ${l}`).join('\n')}
}`}</code>
      </pre>

      <div className="demo__pixel-controls">
        <label className="demo__slider">
          <span>hue</span>
          <input type="range" min="0" max="360" value={hue} onChange={(e) => setHue(+e.target.value)} />
          <output>{hue}°</output>
        </label>
        <label className="demo__slider">
          <span>speed</span>
          <input type="range" min="0" max="3" step="0.1" value={speed} onChange={(e) => setSpeed(+e.target.value)} />
          <output>{speed.toFixed(1)}×</output>
        </label>
        <label className="demo__slider">
          <span>scale</span>
          <input type="range" min="0.4" max="2.4" step="0.05" value={scale} onChange={(e) => setScale(+e.target.value)} />
          <output>{scale.toFixed(2)}</output>
        </label>
        <label className="demo__slider">
          <span>pixel</span>
          <input type="range" min="1" max="8" step="1" value={pixel} onChange={(e) => setPixel(+e.target.value)} />
          <output>{pixel}px</output>
        </label>
      </div>

      <div className="demo__controls">
        <button type="button" className="demo__btn demo__btn--primary" onClick={() => setPlaying((p) => !p)}>
          {playing ? 'Pause' : 'Play'}
        </button>
        <button type="button" className="demo__btn" onClick={randomize}>Randomize</button>
        <button
          type="button"
          className="demo__btn"
          onClick={() => { setHue(190); setSpeed(1); setScale(1); setPixel(2); setPreset('plasma'); }}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default PixelForgeDemo;
