import {
  REEL_W, REEL_H, MONO, SANS, ACCENT, ACCENT_2, HOT, INK,
  clamp, lerp, easeOut, backOut, envelope,
  bg, vignette, scanlines, text, glitchText, roundRect, pill, rnd,
  perspectiveGrid, starfield, layer,
} from './engine';

/* Shared bits ------------------------------------------------------------ */

const typed = (str, p, caret = true) => {
  const n = Math.floor(clamp(p) * str.length + 0.0001);
  const s = str.slice(0, n);
  return caret && (Math.floor(p * 22) % 2 === 0 || n < str.length) ? `${s}_` : s;
};

// Every reel lands on the same lockup, so it reads as a set.
const outro = (ctx, p) => {
  const e = easeOut(clamp(p / 0.35));
  const out = clamp((p - 0.85) / 0.15);
  layer(ctx, () => {
    ctx.globalAlpha = 1 - out;
    const s = lerp(0.8, 1, backOut(clamp(p / 0.45)));
    ctx.translate(REEL_W / 2, REEL_H / 2 - 40);
    ctx.scale(s, s);
    ctx.translate(-REEL_W / 2, -(REEL_H / 2 - 40));

    text(ctx, '<', { x: REEL_W / 2 - 205, y: REEL_H / 2 - 40, size: 132, weight: 400, color: ACCENT, font: MONO, alpha: e });
    text(ctx, 'Dom', { x: REEL_W / 2, y: REEL_H / 2 - 40, size: 132, weight: 800, color: INK, font: MONO, alpha: e });
    text(ctx, '/>', { x: REEL_W / 2 + 225, y: REEL_H / 2 - 40, size: 132, weight: 400, color: ACCENT, font: MONO, alpha: e });

    const lw = 340 * easeOut(clamp((p - 0.2) / 0.3));
    ctx.strokeStyle = ACCENT;
    ctx.globalAlpha = (1 - out) * 0.6;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(REEL_W / 2 - lw / 2, REEL_H / 2 + 70);
    ctx.lineTo(REEL_W / 2 + lw / 2, REEL_H / 2 + 70);
    ctx.stroke();
    ctx.globalAlpha = 1 - out;

    text(ctx, 'domthedeveloper.com', {
      y: REEL_H / 2 + 150, size: 40, weight: 500, color: '#9aa5bb', font: MONO,
      spacing: 6, alpha: easeOut(clamp((p - 0.35) / 0.3)),
    });
  });
};

const kicker = (ctx, label, p, color = ACCENT) => {
  layer(ctx, () => {
    const e = envelope(p, 0.12, 0.12);
    text(ctx, label, {
      y: 250, size: 34, weight: 600, color, font: MONO, spacing: 12, alpha: e * 0.9,
    });
    ctx.globalAlpha = e * 0.35;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(REEL_W / 2 - 90, 292);
    ctx.lineTo(REEL_W / 2 + 90, 292);
    ctx.stroke();
  });
};

/* ======================================================================== *
 * REEL 1 — WHOAMI
 * ======================================================================== */

const STACK = [
  'React', 'TypeScript', 'Node.js', 'Python',
  'Go', 'PostgreSQL', 'Redis', 'Docker',
  'Kubernetes', 'AWS', 'WebGL', 'GraphQL',
];

const COUNTS = [
  { v: 6, label: 'CASE STUDIES', suffix: '' },
  { v: 10, label: 'ARCADE GAMES', suffix: '' },
  { v: 11, label: 'EXPERIMENTS', suffix: '' },
];

const reelWhoami = {
  id: 'whoami',
  title: 'whoami',
  blurb: 'Who is behind this thing.',
  accent: ACCENT,
  scenes: [
    {
      from: 0, to: 30,
      draw: (ctx, { t }) => {
        bg(ctx, '#06090f');
        starfield(ctx, t, 80, 0.75);
        perspectiveGrid(ctx, t, { alpha: 0.1, horizon: REEL_H * 0.55 });
      },
    },
    {
      from: 0, to: 3.6,
      draw: (ctx, { p }) => {
        const line = typed('$ whoami', clamp(p / 0.55));
        text(ctx, line, { y: REEL_H / 2, size: 66, weight: 500, color: ACCENT_2, font: MONO, alpha: envelope(p, 0.06, 0.12) });
      },
    },
    {
      from: 3.6, to: 8,
      draw: (ctx, { p, t }) => {
        const e = envelope(p, 0.1, 0.12);
        const shake = p < 0.28 ? (1 - p / 0.28) : 0;
        layer(ctx, () => {
          ctx.globalAlpha = e;
          ctx.translate((rnd(Math.floor(t * 30), 5) - 0.5) * shake * 22, 0);
          glitchText(ctx, 'DOM', {
            y: REEL_H / 2 - 130, size: 210, weight: 800, color: INK, font: SANS, spacing: 4,
          }, shake, Math.floor(t * 24));
          glitchText(ctx, 'THE DEVELOPER', {
            y: REEL_H / 2 + 30, size: 96, weight: 700, color: ACCENT, font: SANS, spacing: 10,
          }, shake * 0.7, Math.floor(t * 24) + 9);
        });
      },
    },
    {
      from: 8, to: 12.6,
      draw: (ctx, { p }) => {
        const rows = ['SOFTWARE ENGINEER', 'COMPUTER SCIENTIST', 'FULL-STACK, END TO END'];
        kicker(ctx, 'ROLE', p);
        rows.forEach((r, i) => {
          const start = i * 0.16;
          const rp = clamp((p - start) / 0.3);
          const e = easeOut(rp) * (1 - clamp((p - 0.82) / 0.18));
          layer(ctx, () => {
            ctx.globalAlpha = e;
            ctx.translate(lerp(-70, 0, easeOut(rp)), 0);
            text(ctx, r, {
              y: REEL_H / 2 - 120 + i * 150, size: 68, weight: 700,
              color: i === 0 ? INK : '#9aa5bb', font: SANS,
            });
            ctx.globalAlpha = e * 0.5;
            ctx.fillStyle = ACCENT;
            ctx.fillRect(REEL_W / 2 - 240, REEL_H / 2 - 120 + i * 150 + 52, 480 * easeOut(rp), 2);
          });
        });
      },
    },
    {
      from: 12.6, to: 19.4,
      draw: (ctx, { p }) => {
        kicker(ctx, 'THE TOOLKIT', p);
        const cols = 2;
        const outAll = 1 - clamp((p - 0.86) / 0.14);
        STACK.forEach((s, i) => {
          const rp = clamp((p - i * 0.045) / 0.22);
          if (rp <= 0) return;
          const col = i % cols;
          const row = Math.floor(i / cols);
          const x = REEL_W / 2 + (col === 0 ? -245 : 245);
          const y = REEL_H / 2 - 415 + row * 150;
          layer(ctx, () => {
            ctx.globalAlpha = easeOut(rp) * outAll;
            ctx.translate(0, lerp(38, 0, backOut(rp)));
            pill(ctx, s, { x, y, size: 46, color: i % 3 === 0 ? ACCENT_2 : ACCENT, fill: i % 5 === 0 });
          });
        });
      },
    },
    {
      from: 19.4, to: 24.6,
      draw: (ctx, { p }) => {
        kicker(ctx, 'ON THIS SITE', p);
        const outAll = 1 - clamp((p - 0.84) / 0.16);
        COUNTS.forEach((c, i) => {
          const rp = clamp((p - i * 0.13) / 0.42);
          const val = Math.round(easeOut(rp) * c.v);
          const y = REEL_H / 2 - 240 + i * 240;
          layer(ctx, () => {
            ctx.globalAlpha = easeOut(clamp(rp * 3)) * outAll;
            text(ctx, `${val}${c.suffix}`, { y, size: 150, weight: 800, color: ACCENT, font: MONO });
            text(ctx, c.label, { y: y + 96, size: 34, weight: 600, color: '#9aa5bb', font: MONO, spacing: 9 });
          });
        });
      },
    },
    { from: 24.6, to: 30, draw: (ctx, { p }) => outro(ctx, p) },
    {
      from: 0, to: 30,
      draw: (ctx) => { vignette(ctx, 0.5); scanlines(ctx, 0.045); },
    },
  ],
};

/* ======================================================================== *
 * REEL 2 — SHIP
 * ======================================================================== */

const PIPELINE = ['COMMIT', 'BUILD', 'TEST', 'DEPLOY'];
const LOGS = [
  '→ resolving dependencies',
  '✓ 1,284 modules bundled',
  '✓ 214 tests passed',
  '→ pushing ghcr.io/dom/api',
  '✓ 3/3 replicas healthy',
  '✓ live in 47s',
];
const METRICS = [
  { v: '180K', unit: 'RPS', label: 'SUSTAINED THROUGHPUT' },
  { v: '<2', unit: 'MS', label: 'P99 GATEWAY OVERHEAD' },
  { v: '63', unit: '%', label: 'MTTR REDUCTION' },
];

const reelShip = {
  id: 'ship',
  title: 'ship it',
  blurb: 'Idea to production, no ceremony.',
  accent: ACCENT_2,
  scenes: [
    {
      from: 0, to: 30,
      draw: (ctx, { t }) => {
        bg(ctx, '#05080e');
        layer(ctx, () => {
          ctx.globalAlpha = 0.5;
          for (let i = 0; i < 26; i++) {
            const y = ((rnd(i, 21) * REEL_H) + t * (30 + rnd(i, 23) * 90)) % (REEL_H + 200) - 100;
            ctx.fillStyle = i % 4 === 0 ? ACCENT_2 : '#1a2740';
            ctx.globalAlpha = 0.12 + rnd(i, 27) * 0.2;
            ctx.fillRect(rnd(i, 29) * REEL_W, y, 2, 90 + rnd(i, 31) * 160);
          }
        });
      },
    },
    {
      from: 0, to: 4.4,
      draw: (ctx, { p, t }) => {
        const e = envelope(p, 0.14, 0.14);
        layer(ctx, () => {
          ctx.globalAlpha = e * 0.22;
          for (let i = 0; i < 14; i++) {
            const y = REEL_H / 2 - 300 + i * 46;
            const w = 200 + rnd(i, 41) * 520;
            const jitter = Math.sin(t * 6 + i) * 14 * (1 - p);
            ctx.fillStyle = '#33507a';
            ctx.fillRect(REEL_W / 2 - w / 2 + jitter, y, w, 8);
          }
        });
        text(ctx, 'EVERY SERVICE', { y: REEL_H / 2 - 60, size: 82, weight: 800, color: INK, font: SANS, alpha: e });
        text(ctx, 'STARTED THE SAME WAY', { y: REEL_H / 2 + 40, size: 60, weight: 700, color: '#9aa5bb', font: SANS, alpha: e });
        text(ctx, 'a week of plumbing', { y: REEL_H / 2 + 150, size: 40, weight: 500, color: HOT, font: MONO, alpha: e * 0.9 });
      },
    },
    {
      from: 4.4, to: 17,
      draw: (ctx, { p }) => {
        kicker(ctx, 'ONE COMMAND', p, ACCENT_2);
        const outAll = 1 - clamp((p - 0.88) / 0.12);
        const top = REEL_H / 2 - 470;
        const gap = 210;

        // Rail
        const railP = clamp((p - 0.06) / 0.3);
        layer(ctx, () => {
          ctx.globalAlpha = 0.35 * outAll;
          ctx.strokeStyle = ACCENT_2;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(REEL_W / 2 - 250, top);
          ctx.lineTo(REEL_W / 2 - 250, top + gap * 3 * easeOut(railP));
          ctx.stroke();
        });

        PIPELINE.forEach((step, i) => {
          const appear = clamp((p - 0.08 - i * 0.06) / 0.16);
          const done = clamp((p - 0.34 - i * 0.11) / 0.1);
          if (appear <= 0) return;
          const y = top + i * gap;
          layer(ctx, () => {
            ctx.globalAlpha = easeOut(appear) * outAll;
            const r = 34;
            ctx.beginPath();
            ctx.arc(REEL_W / 2 - 250, y, r, 0, Math.PI * 2);
            ctx.fillStyle = done > 0.5 ? ACCENT_2 : '#0b1220';
            ctx.fill();
            ctx.strokeStyle = ACCENT_2;
            ctx.lineWidth = 3;
            ctx.stroke();

            if (done > 0.5) {
              ctx.strokeStyle = '#05080e';
              ctx.lineWidth = 6;
              ctx.lineCap = 'round';
              ctx.beginPath();
              ctx.moveTo(REEL_W / 2 - 264, y);
              ctx.lineTo(REEL_W / 2 - 252, y + 13);
              ctx.lineTo(REEL_W / 2 - 233, y - 13);
              ctx.stroke();
            }

            text(ctx, step, {
              x: REEL_W / 2 - 180, y, size: 62, weight: 700, align: 'left',
              color: done > 0.5 ? INK : '#5f6b83', font: SANS, spacing: 3,
            });
          });
        });

        // Streaming log tail
        LOGS.forEach((l, i) => {
          const lp = clamp((p - 0.4 - i * 0.055) / 0.1);
          if (lp <= 0) return;
          layer(ctx, () => {
            ctx.globalAlpha = easeOut(lp) * 0.85 * outAll;
            text(ctx, l, {
              x: 120, y: top + gap * 3 + 150 + i * 62, size: 36, weight: 400,
              align: 'left', color: l.startsWith('✓') ? ACCENT_2 : '#7d8899', font: MONO,
            });
          });
        });
      },
    },
    {
      from: 17, to: 24,
      draw: (ctx, { p }) => {
        kicker(ctx, 'IN PRODUCTION', p, ACCENT_2);
        const outAll = 1 - clamp((p - 0.86) / 0.14);
        METRICS.forEach((m, i) => {
          const rp = clamp((p - 0.05 - i * 0.14) / 0.26);
          if (rp <= 0) return;
          const y = REEL_H / 2 - 250 + i * 250;
          layer(ctx, () => {
            ctx.globalAlpha = easeOut(rp) * outAll;
            ctx.translate(lerp(90, 0, backOut(rp)), 0);
            const vw = text(ctx, m.v, { x: REEL_W / 2 - 40, y, size: 165, weight: 800, color: INK, font: MONO, align: 'right' });
            text(ctx, m.unit, { x: REEL_W / 2 - 20, y: y + 22, size: 58, weight: 700, color: ACCENT_2, font: MONO, align: 'left' });
            text(ctx, m.label, { y: y + 108, size: 32, weight: 600, color: '#7d8899', font: MONO, spacing: 8 });
            ctx.globalAlpha *= 0.25;
            ctx.fillStyle = ACCENT_2;
            ctx.fillRect(REEL_W / 2 - 40 - vw, y + 92, vw, 2);
          });
        });
      },
    },
    {
      from: 24, to: 26.4,
      draw: (ctx, { p }) => {
        const e = envelope(p, 0.18, 0.25);
        const s = lerp(1.35, 1, easeOut(clamp(p / 0.3)));
        layer(ctx, () => {
          ctx.globalAlpha = e;
          ctx.translate(REEL_W / 2, REEL_H / 2);
          ctx.scale(s, s);
          text(ctx, 'SHIPPED.', { x: 0, y: 0, size: 170, weight: 800, color: ACCENT_2, font: SANS, spacing: 6 });
        });
      },
    },
    { from: 26.4, to: 30, draw: (ctx, { p }) => outro(ctx, p) },
    { from: 0, to: 30, draw: (ctx) => { vignette(ctx, 0.55); scanlines(ctx, 0.04); } },
  ],
};

/* ======================================================================== *
 * REEL 3 — PLAY
 * ======================================================================== */

const GLYPHS = 'ｱｲｳｴｵｶｷｸ01{}[]<>/\\=+*$#@';

// A deterministic walk across the grid: straight most of the time, turning
// occasionally, bouncing off the edges of the play area.
const SNAKE_CELL = 54;
const SNAKE_COLS = Math.floor(REEL_W / SNAKE_CELL);
const SNAKE_ROWS = Math.floor(REEL_H / SNAKE_CELL);
const SNAKE_PATH = (() => {
  const path = [];
  let x = 5;
  let y = 16;
  let dx = 1;
  let dy = 0;
  for (let i = 0; i < 300; i++) {
    path.push([x, y]);
    if (rnd(i, 91) > 0.74) {
      const right = rnd(i, 93) > 0.5;
      const ndx = right ? -dy : dy;
      const ndy = right ? dx : -dx;
      dx = ndx;
      dy = ndy;
    }
    let nx = x + dx;
    let ny = y + dy;
    if (nx < 2 || nx > SNAKE_COLS - 3) { dx = -dx; nx = x + dx; }
    if (ny < 12 || ny > SNAKE_ROWS - 3) { dy = -dy; ny = y + dy; }
    x = nx;
    y = ny;
  }
  return path;
})();

const reelPlay = {
  id: 'play',
  title: 'built for fun',
  blurb: 'The half that is pure play.',
  accent: HOT,
  scenes: [
    { from: 0, to: 30, draw: (ctx) => bg(ctx, '#05070d') },

    // Plasma field
    {
      from: 0, to: 7,
      draw: (ctx, { p, t }) => {
        const e = envelope(p, 0.16, 0.2);
        const step = 24;
        layer(ctx, () => {
          ctx.globalAlpha = e * 0.85;
          for (let y = 0; y < REEL_H; y += step) {
            for (let x = 0; x < REEL_W; x += step) {
              const v = Math.sin(x * 0.006 + t) + Math.cos(y * 0.005 + t * 1.2)
                + Math.sin((x + y) * 0.004 + t * 0.7);
              const n = (v + 3) / 6;
              ctx.fillStyle = `hsl(${162 + n * 52}, 78%, ${9 + n * 40}%)`;
              ctx.fillRect(x, y, step + 1, step + 1);
            }
          }
        });
        layer(ctx, () => {
          ctx.globalAlpha = e;
          ctx.fillStyle = 'rgba(4,7,12,0.78)';
          ctx.fillRect(0, REEL_H / 2 - 160, REEL_W, 300);
          text(ctx, 'SHADERS', { y: REEL_H / 2 - 40, size: 132, weight: 800, color: INK, font: SANS, spacing: 14 });
          text(ctx, 'CANVAS · WEBGL · GLSL', { y: REEL_H / 2 + 70, size: 40, weight: 600, color: ACCENT_2, font: MONO, spacing: 7, alpha: 0.9 });
        });
      },
    },

    // Constellation
    {
      from: 6.6, to: 13.4,
      draw: (ctx, { p, t }) => {
        const e = envelope(p, 0.14, 0.16);
        const N = 46;
        const pts = [];
        for (let i = 0; i < N; i++) {
          const grow = clamp((p - i * 0.008) / 0.2);
          if (grow <= 0) continue;
          const a = i * 2.399 + t * 0.16;
          const r = (140 + rnd(i, 51) * 620) * easeOut(grow);
          pts.push({
            x: REEL_W / 2 + Math.cos(a) * r * 0.62,
            y: REEL_H / 2 + Math.sin(a) * r * 0.72,
            g: grow,
          });
        }
        layer(ctx, () => {
          ctx.globalAlpha = e;
          ctx.lineWidth = 1.6;
          for (let i = 0; i < pts.length; i++) {
            for (let j = i + 1; j < pts.length; j++) {
              const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
              if (d < 250) {
                ctx.strokeStyle = ACCENT;
                ctx.globalAlpha = e * 0.3 * (1 - d / 250);
                ctx.beginPath();
                ctx.moveTo(pts[i].x, pts[i].y);
                ctx.lineTo(pts[j].x, pts[j].y);
                ctx.stroke();
              }
            }
          }
          pts.forEach((pt, i) => {
            ctx.globalAlpha = e * pt.g;
            ctx.fillStyle = i % 7 === 0 ? ACCENT_2 : '#cfe6ff';
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 3 + rnd(i, 53) * 5, 0, Math.PI * 2);
            ctx.fill();
          });
        });
        text(ctx, 'PARTICLE SYSTEMS', { y: 420, size: 62, weight: 800, color: INK, font: SANS, spacing: 6, alpha: e });
        text(ctx, 'that respond to you', { y: 500, size: 38, weight: 500, color: '#9aa5bb', font: MONO, alpha: e * 0.9 });
      },
    },

    // Arcade
    {
      from: 13.2, to: 19.6,
      draw: (ctx, { p, t }) => {
        const e = envelope(p, 0.14, 0.16);
        const cell = 54;
        layer(ctx, () => {
          ctx.globalAlpha = e * 0.5;
          ctx.strokeStyle = '#16233a';
          ctx.lineWidth = 1;
          for (let x = 0; x <= REEL_W; x += cell) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, REEL_H); ctx.stroke(); }
          for (let y = 0; y <= REEL_H; y += cell) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(REEL_W, y); ctx.stroke(); }
        });
        // A snake that actually crawls — each segment is the previous cell of a
        // single contiguous walk, not its own independent formula.
        layer(ctx, () => {
          const len = 24;
          const head = Math.floor(t * 9) % SNAKE_PATH.length;
          for (let i = len - 1; i >= 0; i--) {
            const [gx, gy] = SNAKE_PATH[(head - i + SNAKE_PATH.length) % SNAKE_PATH.length];
            ctx.fillStyle = i === 0 ? ACCENT_2 : ACCENT;
            ctx.globalAlpha = e * (1 - (i / len) * 0.75);
            roundRect(ctx, gx * cell + 5, gy * cell + 5, cell - 10, cell - 10, 9);
            ctx.fill();
          }
          const [fx, fy] = SNAKE_PATH[(head + 46) % SNAKE_PATH.length];
          ctx.globalAlpha = e;
          ctx.fillStyle = HOT;
          ctx.beginPath();
          ctx.arc(fx * cell + cell / 2, fy * cell + cell / 2, cell / 3, 0, Math.PI * 2);
          ctx.fill();
        });
        layer(ctx, () => {
          ctx.globalAlpha = e;
          ctx.fillStyle = 'rgba(5,7,13,0.82)';
          ctx.fillRect(0, 360, REEL_W, 250);
          text(ctx, '10 GAMES', { y: 440, size: 96, weight: 800, color: INK, font: SANS, spacing: 8 });
          text(ctx, 'ALL PLAYABLE, ALL IN THE BROWSER', { y: 530, size: 34, weight: 600, color: HOT, font: MONO, spacing: 5 });
        });
      },
    },

    // Code rain
    {
      from: 19.4, to: 25.2,
      draw: (ctx, { p, t }) => {
        const e = envelope(p, 0.14, 0.2);
        const cols = 22;
        const cw = REEL_W / cols;
        layer(ctx, () => {
          ctx.globalAlpha = e;
          ctx.font = `600 40px ${MONO}`;
          ctx.textAlign = 'center';
          for (let c = 0; c < cols; c++) {
            const speed = 260 + rnd(c, 61) * 460;
            const head = ((t * speed + rnd(c, 67) * REEL_H) % (REEL_H + 700)) - 100;
            for (let i = 0; i < 16; i++) {
              const y = head - i * 46;
              if (y < -40 || y > REEL_H + 40) continue;
              const ch = GLYPHS[Math.floor(rnd(c * 31 + i + Math.floor(t * 8), 71) * GLYPHS.length)];
              ctx.globalAlpha = e * (i === 0 ? 1 : Math.max(0, 0.55 - i * 0.038));
              ctx.fillStyle = i === 0 ? '#dffff4' : ACCENT_2;
              ctx.fillText(ch, c * cw + cw / 2, y);
            }
          }
        });
        layer(ctx, () => {
          ctx.globalAlpha = e;
          ctx.fillStyle = 'rgba(5,7,13,0.8)';
          ctx.fillRect(0, REEL_H / 2 - 170, REEL_W, 340);
          text(ctx, 'I BUILD THINGS', { y: REEL_H / 2 - 60, size: 84, weight: 800, color: INK, font: SANS, spacing: 5 });
          text(ctx, 'NOBODY ASKED FOR', { y: REEL_H / 2 + 40, size: 84, weight: 800, color: HOT, font: SANS, spacing: 5 });
          text(ctx, 'and a few they did', { y: REEL_H / 2 + 130, size: 38, weight: 500, color: '#9aa5bb', font: MONO });
        });
      },
    },

    { from: 25, to: 30, draw: (ctx, { p }) => outro(ctx, p) },
    { from: 0, to: 30, draw: (ctx) => { vignette(ctx, 0.5); scanlines(ctx, 0.05); } },
  ],
};

export const REELS = [reelWhoami, reelShip, reelPlay];

export const drawReel = (reel, ctx, t) => {
  reel.scenes.forEach((s) => {
    if (t < s.from || t > s.to) return;
    const local = t - s.from;
    const p = (t - s.from) / (s.to - s.from);
    ctx.save();
    s.draw(ctx, { t, p, local });
    ctx.restore();
  });
};
