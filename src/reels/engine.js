/* Drawing toolkit for the reels.
 *
 * Every reel is authored in a virtual 1080×1920 space — real Instagram Reel
 * dimensions — and the renderer scales that to whatever the element is. So
 * sizes below are in "reel pixels" and look identical at any display size.
 */

export const REEL_W = 1080;
export const REEL_H = 1920;
export const REEL_SECONDS = 30;

export const MONO = "'JetBrains Mono', 'Fira Code', ui-monospace, monospace";
export const SANS = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

export const ACCENT = '#64c8ff';
export const ACCENT_2 = '#7dfcd8';
export const HOT = '#ff9f3a';
export const INK = '#e4eaf5';

/* ---------------- timing ---------------- */

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;

export const easeOut = (t) => 1 - Math.pow(1 - clamp(t), 3);
export const easeIn = (t) => Math.pow(clamp(t), 3);
export const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const backOut = (t) => {
  const c = 1.70158;
  const x = clamp(t) - 1;
  return 1 + (c + 1) * x * x * x + c * x * x;
};

// Fades in over `inDur`, holds, fades out over `outDur`.
export const envelope = (p, inDur = 0.15, outDur = 0.15) => {
  if (p < inDur) return easeOut(p / inDur);
  if (p > 1 - outDur) return easeOut((1 - p) / outDur);
  return 1;
};

/* ---------------- primitives ---------------- */

export const bg = (ctx, tint = '#0a0e17') => {
  ctx.fillStyle = tint;
  ctx.fillRect(0, 0, REEL_W, REEL_H);
};

export const vignette = (ctx, strength = 0.55) => {
  const g = ctx.createRadialGradient(REEL_W / 2, REEL_H / 2, REEL_H * 0.2, REEL_W / 2, REEL_H / 2, REEL_H * 0.72);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, `rgba(0,0,0,${strength})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, REEL_W, REEL_H);
};

export const scanlines = (ctx, alpha = 0.05, gap = 4) => {
  ctx.fillStyle = `rgba(0,0,0,${alpha})`;
  for (let y = 0; y < REEL_H; y += gap * 2) ctx.fillRect(0, y, REEL_W, gap);
};

export const glow = (ctx, x, y, r, color, alpha = 0.5) => {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color.replace(')', `, ${alpha})`).replace('rgb', 'rgba'));
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
};

export const text = (ctx, str, opts = {}) => {
  const {
    x = REEL_W / 2, y = 0, size = 64, weight = 700, color = INK,
    font = SANS, align = 'center', baseline = 'middle',
    spacing = 0, alpha = 1, maxWidth,
  } = opts;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.font = `${weight} ${size}px ${font}`;
  ctx.textAlign = spacing ? 'left' : align;
  ctx.textBaseline = baseline;
  ctx.fillStyle = color;

  if (!spacing) {
    ctx.fillText(str, x, y, maxWidth);
    ctx.restore();
    return ctx.measureText(str).width;
  }

  const chars = [...str];
  const total = chars.reduce((w, c) => w + ctx.measureText(c).width + spacing, -spacing);
  let cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
  chars.forEach((c) => {
    ctx.fillText(c, cx, y);
    cx += ctx.measureText(c).width + spacing;
  });
  ctx.restore();
  return total;
};

// RGB-split glitch. `amount` 0..1 drives both offset and slice chaos.
export const glitchText = (ctx, str, opts = {}, amount = 0, seed = 0) => {
  const off = amount * 26;
  if (off > 0.4) {
    text(ctx, str, { ...opts, color: '#ff2e6a', x: (opts.x ?? REEL_W / 2) - off, alpha: 0.75 });
    text(ctx, str, { ...opts, color: ACCENT_2, x: (opts.x ?? REEL_W / 2) + off, alpha: 0.75 });
  }
  text(ctx, str, opts);

  if (amount > 0.25) {
    const slices = 5;
    for (let i = 0; i < slices; i++) {
      const n = Math.sin((i * 12.9898 + seed * 78.233) * 43758.5453);
      const frac = n - Math.floor(n);
      if (frac > 0.55) {
        const h = 8 + frac * 26;
        const sy = (opts.y ?? 0) - (opts.size ?? 64) / 2 + frac * (opts.size ?? 64);
        const dx = (frac - 0.5) * off * 3;
        ctx.drawImage(ctx.canvas, 0, sy, REEL_W, h, dx, sy, REEL_W, h);
      }
    }
  }
};

export const roundRect = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

export const pill = (ctx, label, opts = {}) => {
  const { x, y, size = 34, padX = 26, padY = 16, color = ACCENT, alpha = 1, fill = false } = opts;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.font = `500 ${size}px ${MONO}`;
  const w = ctx.measureText(label).width + padX * 2;
  const h = size + padY * 2;
  roundRect(ctx, x - w / 2, y - h / 2, w, h, h / 2);
  if (fill) {
    ctx.fillStyle = color;
    ctx.fill();
    ctx.fillStyle = '#06090f';
  } else {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.globalAlpha *= 0.55;
    ctx.stroke();
    ctx.globalAlpha /= 0.55;
    ctx.fillStyle = color;
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x, y + 1);
  ctx.restore();
  return w;
};

// Deterministic pseudo-random so every playthrough looks the same.
export const rnd = (i, salt = 1) => {
  const n = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return n - Math.floor(n);
};

export const perspectiveGrid = (ctx, t, { alpha = 0.18, color = ACCENT, horizon = REEL_H * 0.42, speed = 0.35 } = {}) => {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  for (let i = -12; i <= 12; i++) {
    ctx.beginPath();
    ctx.moveTo(REEL_W / 2 + i * 46, horizon);
    ctx.lineTo(REEL_W / 2 + i * 520, REEL_H + 100);
    ctx.stroke();
  }
  for (let i = 0; i < 22; i++) {
    const p = ((i / 22) + (t * speed) % (1 / 22)) % 1;
    const y = horizon + Math.pow(p, 2.4) * (REEL_H - horizon + 200);
    ctx.globalAlpha = alpha * (1 - p * 0.55);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(REEL_W, y);
    ctx.stroke();
  }
  ctx.restore();
};

export const starfield = (ctx, t, count = 90, alpha = 1) => {
  ctx.save();
  for (let i = 0; i < count; i++) {
    const x = rnd(i, 3) * REEL_W;
    const drift = (rnd(i, 7) * 40 + 8) * t;
    const y = (rnd(i, 11) * REEL_H + drift) % REEL_H;
    const r = 1.5 + rnd(i, 13) * 3.5;
    const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * (0.8 + rnd(i, 17)) + i));
    ctx.globalAlpha = alpha * tw * 0.75;
    ctx.fillStyle = rnd(i, 19) > 0.85 ? ACCENT : '#cfe6ff';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
};

// Wraps a block so scenes can't leak transform/alpha state into each other.
export const layer = (ctx, fn) => {
  ctx.save();
  fn();
  ctx.restore();
};
