import {
  REEL_W, REEL_H, MONO, SANS, ACCENT, ACCENT_2, HOT, INK,
  clamp, lerp, easeOut, envelope,
  bg, vignette, scanlines, text, roundRect, rnd, layer,
  fitSize, flood, shake, camera, chroma, textMask, marquee, punch,
} from './engine';

const BLACK = '#05070d';

/* Cut helpers ------------------------------------------------------------ */

const typed = (str, p) => {
  const n = Math.floor(clamp(p) * str.length + 0.0001);
  return str.slice(0, n) + (Math.floor(p * 26) % 2 ? '_' : '');
};

// Edge-to-edge headline. The whole point is that it does not fit politely.
const huge = (ctx, str, {
  y = REEL_H / 2, color = INK, weight = 800, font = SANS, pad = 70,
  spacing = 0, alpha = 1, max = 470,
} = {}) => {
  const size = fitSize(ctx, str, { targetW: REEL_W - pad, weight, font, spacing, max });
  text(ctx, str, { y, size, weight, color, font, spacing, alpha });
  return size;
};

// A hard colour cut with black type — the punctuation between sections.
const invertCard = (ctx, p, color, lines) => {
  const e = p < 0.06 ? p / 0.06 : p > 0.94 ? (1 - p) / 0.06 : 1;
  layer(ctx, () => {
    ctx.globalAlpha = e;
    flood(ctx, color);
    camera(ctx, lerp(1.12, 1, easeOut(clamp(p / 0.4))));
    shake(ctx, (1 - clamp(p / 0.18)) * 12, Math.floor(p * 90));
    const total = lines.length;
    lines.forEach((l, i) => {
      huge(ctx, l, {
        y: REEL_H / 2 + (i - (total - 1) / 2) * 200,
        color: BLACK,
        max: total > 1 ? 210 : 300,
      });
    });
  });
};

const grain = (ctx) => { vignette(ctx, 0.26); scanlines(ctx, 0.045); };

/* Reusable full-bleed visuals — also reused by reel 3's closing montage. */

const paintPlasma = (ctx, t, alpha = 1) => {
  const step = 26;
  const base = ctx.globalAlpha * alpha;
  layer(ctx, () => {
    ctx.globalAlpha = base;
    for (let y = 0; y < REEL_H; y += step) {
      for (let x = 0; x < REEL_W; x += step) {
        const v = Math.sin(x * 0.006 + t) + Math.cos(y * 0.005 + t * 1.2)
          + Math.sin((x + y) * 0.004 + t * 0.7);
        const n = (v + 3) / 6;
        ctx.fillStyle = `hsl(${162 + n * 52}, 82%, ${10 + n * 44}%)`;
        ctx.fillRect(x, y, step + 1, step + 1);
      }
    }
  });
};

const paintConstellation = (ctx, t, grow = 1, alpha = 1) => {
  const N = 54;
  const pts = [];
  for (let i = 0; i < N; i++) {
    const a = i * 2.399 + t * 0.22;
    const r = (120 + rnd(i, 51) * 700) * grow;
    pts.push({ x: REEL_W / 2 + Math.cos(a) * r * 0.66, y: REEL_H / 2 + Math.sin(a) * r * 0.78 });
  }
  const base = ctx.globalAlpha * alpha;
  layer(ctx, () => {
    ctx.lineWidth = 1.8;
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
        if (d < 260) {
          ctx.strokeStyle = ACCENT;
          ctx.globalAlpha = base * 0.34 * (1 - d / 260);
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.stroke();
        }
      }
    }
    pts.forEach((pt, i) => {
      ctx.globalAlpha = base;
      ctx.fillStyle = i % 6 === 0 ? ACCENT_2 : '#dbeeff';
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4 + rnd(i, 53) * 6, 0, Math.PI * 2);
      ctx.fill();
    });
  });
};

const SNAKE_CELL = 60;
const SNAKE_COLS = Math.floor(REEL_W / SNAKE_CELL);
const SNAKE_ROWS = Math.floor(REEL_H / SNAKE_CELL);
const SNAKE_PATH = (() => {
  const path = [];
  let x = 4;
  let y = 8;
  let dx = 1;
  let dy = 0;
  for (let i = 0; i < 320; i++) {
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
    if (nx < 1 || nx > SNAKE_COLS - 2) { dx = -dx; nx = x + dx; }
    if (ny < 2 || ny > SNAKE_ROWS - 2) { dy = -dy; ny = y + dy; }
    x = nx;
    y = ny;
  }
  return path;
})();

const paintSnake = (ctx, t, alpha = 1) => {
  const base = ctx.globalAlpha * alpha;
  layer(ctx, () => {
    ctx.globalAlpha = base * 0.55;
    ctx.strokeStyle = '#16233a';
    ctx.lineWidth = 1;
    for (let x = 0; x <= REEL_W; x += SNAKE_CELL) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, REEL_H); ctx.stroke(); }
    for (let y = 0; y <= REEL_H; y += SNAKE_CELL) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(REEL_W, y); ctx.stroke(); }

    const len = 30;
    const head = Math.floor(t * 12) % SNAKE_PATH.length;
    for (let i = len - 1; i >= 0; i--) {
      const [gx, gy] = SNAKE_PATH[(head - i + SNAKE_PATH.length) % SNAKE_PATH.length];
      ctx.fillStyle = i === 0 ? ACCENT_2 : ACCENT;
      ctx.globalAlpha = base * (1 - (i / len) * 0.7);
      roundRect(ctx, gx * SNAKE_CELL + 5, gy * SNAKE_CELL + 5, SNAKE_CELL - 10, SNAKE_CELL - 10, 10);
      ctx.fill();
    }
    const [fx, fy] = SNAKE_PATH[(head + 52) % SNAKE_PATH.length];
    ctx.globalAlpha = base;
    ctx.fillStyle = HOT;
    ctx.beginPath();
    ctx.arc(fx * SNAKE_CELL + SNAKE_CELL / 2, fy * SNAKE_CELL + SNAKE_CELL / 2, SNAKE_CELL / 3, 0, Math.PI * 2);
    ctx.fill();
  });
};

const GLYPHS = 'ｱｲｳｴｵｶｷｸ01{}[]<>/\\=+*$#@';
const paintRain = (ctx, t, alpha = 1) => {
  const cols = 20;
  const cw = REEL_W / cols;
  const base = ctx.globalAlpha * alpha;
  layer(ctx, () => {
    ctx.font = `600 44px ${MONO}`;
    ctx.textAlign = 'center';
    for (let c = 0; c < cols; c++) {
      const speed = 340 + rnd(c, 61) * 560;
      const head = ((t * speed + rnd(c, 67) * REEL_H) % (REEL_H + 800)) - 120;
      for (let i = 0; i < 18; i++) {
        const y = head - i * 50;
        if (y < -50 || y > REEL_H + 50) continue;
        const ch = GLYPHS[Math.floor(rnd(c * 31 + i + Math.floor(t * 9), 71) * GLYPHS.length)];
        ctx.globalAlpha = base * (i === 0 ? 1 : Math.max(0, 0.6 - i * 0.036));
        ctx.fillStyle = i === 0 ? '#e6fff7' : ACCENT_2;
        ctx.fillText(ch, c * cw + cw / 2, y);
      }
    }
  });
};

/* The lockup every reel lands on. */
const outro = (ctx, p) => {
  const e = easeOut(clamp(p / 0.28));
  const out = clamp((p - 0.88) / 0.12);
  layer(ctx, () => {
    ctx.globalAlpha = 1 - out;
    flood(ctx, BLACK, clamp(p / 0.1));
    camera(ctx, punch(clamp(p / 0.3)));
    shake(ctx, (1 - clamp(p / 0.12)) * 16, Math.floor(p * 70));

    const size = fitSize(ctx, '<Dom/>', { targetW: REEL_W - 120, weight: 800, font: MONO, max: 300 });
    // Lay the three pieces out from measured widths. Centring the middle piece
    // on the frame centre is half a glyph off and collides the "/" with the "m".
    layer(ctx, () => {
      ctx.globalAlpha = e;
      ctx.font = `800 ${size}px ${MONO}`;
      const parts = [['<', ACCENT], ['Dom', INK], ['/>', ACCENT]];
      const widths = parts.map(([str]) => ctx.measureText(str).width);
      const total = widths.reduce((a, b) => a + b, 0);
      let x = REEL_W / 2 - total / 2;
      parts.forEach(([str, color], i) => {
        text(ctx, str, { x, y: REEL_H / 2 - 60, size, weight: 800, color, font: MONO, align: 'left' });
        x += widths[i];
      });
    });

    const lw = (REEL_W - 200) * easeOut(clamp((p - 0.16) / 0.26));
    ctx.strokeStyle = ACCENT;
    ctx.globalAlpha = (1 - out) * 0.85;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(REEL_W / 2 - lw / 2, REEL_H / 2 + 110);
    ctx.lineTo(REEL_W / 2 + lw / 2, REEL_H / 2 + 110);
    ctx.stroke();

    ctx.globalAlpha = 1 - out;
    huge(ctx, 'DOMTHEDEVELOPER.COM', {
      y: REEL_H / 2 + 215, color: '#9aa5bb', font: MONO, weight: 600,
      max: 58, alpha: easeOut(clamp((p - 0.3) / 0.28)),
    });
  });
};

/* ======================================================================== *
 * 01 — WHOAMI
 * ======================================================================== */

const TOOLS_A = ['REACT', 'TYPESCRIPT', 'NEXT.JS', 'WEBGL'];
const TOOLS_B = ['NODE', 'PYTHON', 'GO', 'GRPC', 'REDIS'];
const TOOLS_C = ['DOCKER', 'K8S', 'AWS', 'POSTGRES'];

const COUNTS = [
  { v: 6, label: 'CASE STUDIES' },
  { v: 10, label: 'ARCADE GAMES' },
  { v: 11, label: 'EXPERIMENTS' },
];

const reelWhoami = {
  id: 'whoami',
  title: 'whoami',
  blurb: 'Thirty seconds, no throat-clearing.',
  accent: ACCENT,
  scenes: [
    { from: 0, to: 30, draw: (ctx) => bg(ctx, BLACK) },

    // Cold open — hard cyan flood
    { from: 0, to: 1.1, draw: (ctx, { p }) => invertCard(ctx, p, ACCENT, ['WHO?']) },

    // Terminal
    {
      from: 1.1, to: 2.5,
      draw: (ctx, { p }) => {
        layer(ctx, () => {
          ctx.globalAlpha = envelope(p, 0.08, 0.1);
          huge(ctx, typed('$ whoami', clamp(p / 0.6)), { color: ACCENT_2, font: MONO, weight: 700, max: 130 });
        });
      },
    },

    // Name — edge to edge, slammed in with chromatic impact
    {
      from: 2.5, to: 5.6,
      draw: (ctx, { p, t }) => {
        const hit = clamp(p / 0.16);
        layer(ctx, () => {
          ctx.globalAlpha = envelope(p, 0.05, 0.08);
          camera(ctx, lerp(1.3, 1.02, easeOut(hit)));
          shake(ctx, (1 - hit) * 26, Math.floor(t * 40));
          chroma(ctx, (c, col) => {
            huge(c, 'DOM', { y: REEL_H / 2 - 150, color: col || INK, max: 470 });
          }, (1 - hit) * 30);
          const rp = clamp((p - 0.16) / 0.2);
          layer(ctx, () => {
            ctx.globalAlpha = easeOut(rp);
            huge(ctx, 'THE DEVELOPER', { y: REEL_H / 2 + 90, color: ACCENT, max: 165 });
          });
        });
      },
    },

    // Three hard colour cuts
    { from: 5.6, to: 6.7, draw: (ctx, { p }) => invertCard(ctx, p, ACCENT_2, ['SOFTWARE', 'ENGINEER']) },
    { from: 6.7, to: 7.8, draw: (ctx, { p }) => invertCard(ctx, p, HOT, ['COMPUTER', 'SCIENTIST']) },
    { from: 7.8, to: 9.0, draw: (ctx, { p }) => invertCard(ctx, p, INK, ['FULL', 'STACK']) },

    // Toolkit — bands ripping in opposite directions
    {
      from: 9.0, to: 15.2,
      draw: (ctx, { p, t }) => {
        const e = envelope(p, 0.07, 0.1);
        layer(ctx, () => {
          ctx.globalAlpha = e;
          // Bands span the whole frame rather than clustering in the middle.
          const BANDS = [
            { items: TOOLS_C, dy: -720, speed: 180, dir: -1 },
            { items: TOOLS_A, dy: -530, speed: 240, dir: 1 },
            { items: TOOLS_B, dy: -340, speed: 200, dir: -1 },
            { items: TOOLS_A, dy: 70, speed: 260, dir: -1, hot: true },
            { items: TOOLS_C, dy: 260, speed: 190, dir: 1 },
            { items: TOOLS_B, dy: 450, speed: 300, dir: -1 },
            { items: TOOLS_A, dy: 640, speed: 220, dir: 1 },
          ];
          BANDS.forEach((b) => marquee(ctx, b.items, {
            y: REEL_H / 2 + b.dy, size: 150, t, speed: b.speed, dir: b.dir,
            color: b.hot ? ACCENT : '#2c4a6d',
          }));
        });
        layer(ctx, () => {
          ctx.globalAlpha = e;
          ctx.fillStyle = ACCENT;
          ctx.fillRect(0, REEL_H / 2 - 195, REEL_W, 130);
          huge(ctx, 'THE TOOLKIT', { y: REEL_H / 2 - 130, color: BLACK, max: 100 });
        });
      },
    },

    // Numbers — each punches full-frame, then the row settles
    {
      from: 15.2, to: 20.4,
      draw: (ctx, { p }) => {
        const e = envelope(p, 0.05, 0.1);
        const idx = Math.min(2, Math.floor(p / 0.26));
        const local = (p - idx * 0.26) / 0.26;
        layer(ctx, () => {
          ctx.globalAlpha = e;
          if (p < 0.78) {
            const c = COUNTS[idx];
            camera(ctx, punch(clamp(local / 0.35)));
            const val = Math.round(easeOut(clamp(local / 0.5)) * c.v);
            huge(ctx, String(val), { y: REEL_H / 2 - 120, color: ACCENT, font: MONO, max: 440 });
            huge(ctx, c.label, { y: REEL_H / 2 + 190, color: INK, max: 96 });
          } else {
            const rp = clamp((p - 0.78) / 0.22);
            COUNTS.forEach((c, i) => {
              layer(ctx, () => {
                ctx.globalAlpha = easeOut(rp);
                huge(ctx, `${c.v}`, { y: REEL_H / 2 - 330 + i * 300, color: ACCENT, font: MONO, max: 200 });
                huge(ctx, c.label, { y: REEL_H / 2 - 205 + i * 300, color: '#7d8899', max: 54 });
              });
            });
          }
        });
      },
    },

    // Claim, over code rain
    {
      from: 20.4, to: 25.2,
      draw: (ctx, { p, t }) => {
        const e = envelope(p, 0.07, 0.1);
        paintRain(ctx, t, e * 0.5);
        layer(ctx, () => {
          ctx.globalAlpha = e;
          camera(ctx, lerp(1.1, 1, easeOut(clamp(p / 0.4))));
          ctx.fillStyle = 'rgba(5,7,13,0.88)';
          ctx.fillRect(0, REEL_H / 2 - 290, REEL_W, 580);
          huge(ctx, 'EVERY PIXEL', { y: REEL_H / 2 - 160, color: INK, max: 200 });
          huge(ctx, 'ON THIS SITE', { y: REEL_H / 2, color: INK, max: 200 });
          huge(ctx, 'HAND-WRITTEN', { y: REEL_H / 2 + 165, color: ACCENT, max: 200 });
        });
      },
    },

    { from: 25.2, to: 30, draw: (ctx, { p }) => outro(ctx, p) },
    { from: 0, to: 30, draw: grain },
  ],
};

/* ======================================================================== *
 * 02 — SHIP IT
 * ======================================================================== */

const PIPELINE = [
  { step: 'COMMIT', note: 'sha-9f2c1ab' },
  { step: 'BUILD', note: '1,284 modules' },
  { step: 'TEST', note: '214 passed' },
  { step: 'DEPLOY', note: '3/3 healthy' },
];

const METRICS = [
  { v: '180K', unit: 'RPS', label: 'SUSTAINED' },
  { v: '<2', unit: 'MS', label: 'P99 OVERHEAD' },
  { v: '63', unit: '%', label: 'FASTER RECOVERY' },
];

const reelShip = {
  id: 'ship',
  title: 'ship it',
  blurb: 'A week of plumbing, deleted.',
  accent: ACCENT_2,
  scenes: [
    { from: 0, to: 30, draw: (ctx) => bg(ctx, BLACK) },

    { from: 0, to: 1.15, draw: (ctx, { p }) => invertCard(ctx, p, HOT, ['A WEEK', 'OF SETUP']) },
    { from: 1.15, to: 2.2, draw: (ctx, { p }) => invertCard(ctx, p, '#ff2e6a', ['EVERY', 'TIME']) },

    // Chaos scattering away
    {
      from: 2.2, to: 3.6,
      draw: (ctx, { p, t }) => {
        const e = envelope(p, 0.1, 0.14);
        layer(ctx, () => {
          ctx.globalAlpha = e * 0.32;
          for (let i = 0; i < 22; i++) {
            const spread = easeOut(clamp(p / 0.7));
            const y = REEL_H / 2 - 420 + i * 40;
            const w = 220 + rnd(i, 41) * 600;
            const dx = (rnd(i, 43) - 0.5) * spread * 1500;
            ctx.fillStyle = '#3a5b8c';
            ctx.fillRect(REEL_W / 2 - w / 2 + dx + Math.sin(t * 8 + i) * 8, y, w, 10);
          }
        });
        layer(ctx, () => {
          ctx.globalAlpha = e;
          huge(ctx, 'NOT', { y: REEL_H / 2 - 90, color: INK, max: 330 });
          huge(ctx, 'ANYMORE', { y: REEL_H / 2 + 130, color: ACCENT_2, max: 250 });
        });
      },
    },

    // The command
    {
      from: 3.6, to: 5.0,
      draw: (ctx, { p }) => {
        layer(ctx, () => {
          ctx.globalAlpha = envelope(p, 0.08, 0.1);
          huge(ctx, typed('$ devflow deploy', clamp(p / 0.62)), { color: ACCENT_2, font: MONO, weight: 700, max: 88 });
        });
      },
    },

    // Pipeline — one stage per beat, full frame
    {
      from: 5.0, to: 11.4,
      draw: (ctx, { p }) => {
        const e = envelope(p, 0.05, 0.08);
        const idx = Math.min(3, Math.floor(p / 0.24));
        const local = (p - idx * 0.24) / 0.24;
        const s = PIPELINE[idx];
        layer(ctx, () => {
          ctx.globalAlpha = e;
          camera(ctx, punch(clamp(local / 0.3)));

          PIPELINE.forEach((q, i) => {
            if (i >= idx) return;
            layer(ctx, () => {
              ctx.globalAlpha = e * 0.5;
              ctx.fillStyle = ACCENT_2;
              ctx.beginPath();
              ctx.arc(90, 330 + i * 90, 22, 0, Math.PI * 2);
              ctx.fill();
              text(ctx, q.step, { x: 140, y: 330 + i * 90, size: 46, weight: 700, color: '#7d8899', align: 'left' });
            });
          });

          huge(ctx, s.step, { y: REEL_H / 2 - 80, color: INK, max: 330 });
          if (local > 0.45) {
            layer(ctx, () => {
              ctx.globalAlpha = e * easeOut(clamp((local - 0.45) / 0.2));
              huge(ctx, `✓ ${s.note}`, { y: REEL_H / 2 + 110, color: ACCENT_2, font: MONO, weight: 600, max: 88 });
            });
          }
        });
      },
    },

    { from: 11.4, to: 13.0, draw: (ctx, { p }) => invertCard(ctx, p, ACCENT_2, ['47', 'SECONDS']) },

    // Metrics — full-frame slams
    {
      from: 13.0, to: 19.6,
      draw: (ctx, { p }) => {
        const e = envelope(p, 0.05, 0.08);
        const idx = Math.min(2, Math.floor(p / 0.32));
        const local = (p - idx * 0.32) / 0.32;
        const m = METRICS[idx];
        layer(ctx, () => {
          ctx.globalAlpha = e;
          camera(ctx, punch(clamp(local / 0.3)));
          shake(ctx, (1 - clamp(local / 0.12)) * 16, idx * 7);
          huge(ctx, m.v, { y: REEL_H / 2 - 170, color: INK, font: MONO, max: 460 });
          huge(ctx, m.unit, { y: REEL_H / 2 + 60, color: ACCENT_2, font: MONO, max: 180 });
          huge(ctx, m.label, { y: REEL_H / 2 + 235, color: '#7d8899', max: 78 });
        });
      },
    },

    // SHIPPED
    {
      from: 19.6, to: 22.4,
      draw: (ctx, { p, t }) => {
        const e = envelope(p, 0.06, 0.1);
        layer(ctx, () => {
          ctx.globalAlpha = e;
          if (p < 0.14) flood(ctx, ACCENT_2, 1 - p / 0.14);
          camera(ctx, punch(clamp(p / 0.22)));
          shake(ctx, (1 - clamp(p / 0.16)) * 22, Math.floor(t * 40));
          huge(ctx, 'SHIPPED.', { y: REEL_H / 2, color: p < 0.14 ? BLACK : ACCENT_2, max: 330 });
        });
      },
    },

    // Marquee band
    {
      from: 22.4, to: 25.4,
      draw: (ctx, { p, t }) => {
        const e = envelope(p, 0.1, 0.14);
        layer(ctx, () => {
          ctx.globalAlpha = e;
          marquee(ctx, ['SHIP IT', '·', 'SHIP IT', '·'], { y: REEL_H / 2 - 210, size: 170, t, speed: 380, dir: -1, color: '#16283f' });
          ctx.fillStyle = ACCENT_2;
          ctx.fillRect(0, REEL_H / 2 - 75, REEL_W, 150);
          huge(ctx, 'THEN SHIP AGAIN', { y: REEL_H / 2, color: BLACK, max: 108 });
          marquee(ctx, ['SHIP IT', '·', 'SHIP IT', '·'], { y: REEL_H / 2 + 220, size: 170, t, speed: 300, dir: 1, color: '#16283f' });
        });
      },
    },

    { from: 25.4, to: 30, draw: (ctx, { p }) => outro(ctx, p) },
    { from: 0, to: 30, draw: grain },
  ],
};

/* ======================================================================== *
 * 03 — BUILT FOR FUN
 * ======================================================================== */

const reelPlay = {
  id: 'play',
  title: 'built for fun',
  blurb: 'The half nobody asked for.',
  accent: HOT,
  scenes: [
    { from: 0, to: 30, draw: (ctx) => bg(ctx, BLACK) },

    // Plasma showing through the letters
    {
      from: 0, to: 5.2,
      draw: (ctx, { p, t }) => {
        const e = envelope(p, 0.08, 0.12);
        layer(ctx, () => {
          ctx.globalAlpha = e;
          paintPlasma(ctx, t, 0.3);
          flood(ctx, BLACK, 0.55);
        });
        layer(ctx, () => {
          ctx.globalAlpha = e;
          camera(ctx, lerp(1.16, 1, easeOut(clamp(p / 0.6))));
          const size = fitSize(ctx, 'PLAY', { targetW: REEL_W - 50, weight: 800, font: SANS, max: 470 });
          textMask(ctx, 'PLAY', { y: REEL_H / 2 - 120, size, weight: 800, font: SANS }, (b) => paintPlasma(b, t));
          huge(ctx, 'CANVAS · WEBGL · GLSL', { y: REEL_H / 2 + 140, color: ACCENT_2, font: MONO, weight: 600, max: 62 });
        });
      },
    },

    // Constellation blowing outward
    {
      from: 5.2, to: 9.4,
      draw: (ctx, { p, t }) => {
        const e = envelope(p, 0.08, 0.12);
        paintConstellation(ctx, t, easeOut(clamp(p / 0.55)), e);
        layer(ctx, () => {
          ctx.globalAlpha = e;
          ctx.fillStyle = 'rgba(5,7,13,0.82)';
          ctx.fillRect(0, REEL_H / 2 - 155, REEL_W, 310);
          huge(ctx, 'PARTICLES', { y: REEL_H / 2 - 50, color: INK, max: 250 });
          huge(ctx, 'THAT CHASE YOUR CURSOR', { y: REEL_H / 2 + 95, color: ACCENT, max: 74 });
        });
      },
    },

    // Snake
    {
      from: 9.4, to: 13.6,
      draw: (ctx, { p, t }) => {
        const e = envelope(p, 0.08, 0.12);
        paintSnake(ctx, t, e);
        layer(ctx, () => {
          ctx.globalAlpha = e;
          ctx.fillStyle = HOT;
          ctx.fillRect(0, REEL_H / 2 - 125, REEL_W, 250);
          huge(ctx, '10 GAMES', { y: REEL_H / 2 - 45, color: BLACK, max: 220 });
          huge(ctx, 'NO DOWNLOADS. NO LOADING.', { y: REEL_H / 2 + 80, color: BLACK, font: MONO, weight: 600, max: 56 });
        });
      },
    },

    { from: 13.6, to: 14.9, draw: (ctx, { p }) => invertCard(ctx, p, ACCENT, ['11 MORE', 'EXPERIMENTS']) },

    // Code rain + the line
    {
      from: 14.9, to: 20.2,
      draw: (ctx, { p, t }) => {
        const e = envelope(p, 0.08, 0.12);
        paintRain(ctx, t, e * 0.8);
        layer(ctx, () => {
          ctx.globalAlpha = e;
          camera(ctx, lerp(1.12, 1, easeOut(clamp(p / 0.5))));
          ctx.fillStyle = 'rgba(5,7,13,0.9)';
          ctx.fillRect(0, REEL_H / 2 - 300, REEL_W, 600);
          huge(ctx, 'I BUILD THINGS', { y: REEL_H / 2 - 155, color: INK, max: 220 });
          huge(ctx, 'NOBODY', { y: REEL_H / 2 + 10, color: HOT, max: 330 });
          huge(ctx, 'ASKED FOR', { y: REEL_H / 2 + 195, color: HOT, max: 280 });
        });
      },
    },

    // Rapid montage — quarter-second cuts through everything
    {
      from: 20.2, to: 24.6,
      draw: (ctx, { p, t }) => {
        const e = envelope(p, 0.06, 0.12);
        const beatIdx = Math.floor(p * 18);
        const which = beatIdx % 4;
        layer(ctx, () => {
          ctx.globalAlpha = e;
          if (which === 0) paintPlasma(ctx, t, 0.95);
          else if (which === 1) paintConstellation(ctx, t, 1, 0.95);
          else if (which === 2) paintSnake(ctx, t, 0.95);
          else paintRain(ctx, t, 0.95);
          if (beatIdx % 6 === 0) flood(ctx, INK, 0.16);
        });
        layer(ctx, () => {
          ctx.globalAlpha = e;
          ctx.fillStyle = BLACK;
          ctx.fillRect(0, REEL_H / 2 - 100, REEL_W, 200);
          huge(ctx, 'GO POKE AT IT', { y: REEL_H / 2, color: INK, max: 190 });
        });
      },
    },

    { from: 24.6, to: 30, draw: (ctx, { p }) => outro(ctx, p) },
    { from: 0, to: 30, draw: grain },
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
