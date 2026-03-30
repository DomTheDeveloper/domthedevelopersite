import React, { useRef, useEffect, useState, useCallback } from 'react';

const COLOR_THEMES = {
  green: { name: 'Classic Green', primary: '#00ff41', head: '#aaffaa', dim: [0, 255, 65] },
  blue: { name: 'Blue', primary: '#64c8ff', head: '#c0e8ff', dim: [100, 200, 255] },
  red: { name: 'Red', primary: '#ff2040', head: '#ff8888', dim: [255, 32, 64] },
  gold: { name: 'Gold', primary: '#ffd700', head: '#ffee88', dim: [255, 215, 0] },
};

const DECODE_PHRASES = [
  'WAKE UP', 'FOLLOW THE WHITE RABBIT', 'THE MATRIX HAS YOU',
  'KNOCK KNOCK', 'THERE IS NO SPOON', 'FREE YOUR MIND',
  'SYSTEM FAILURE', 'THE ONE', 'RED PILL', 'BLUE PILL',
  'DEJA VU', 'WHOA', 'I KNOW KUNG FU', 'DOMTHEDEVELOPER',
];

const KATAKANA = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
const LATIN = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*<>/{}[];=+-~';
const ALL_CHARS = (KATAKANA + LATIN).split('');

const MatrixRain = () => {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    mouse: { x: -9999, y: -9999, active: false },
    bursts: [],
    speed: 1,
    theme: 'green',
    decodeMode: true,
    columns: [],
    decodeEvents: [],
    animId: null,
    lastTime: 0,
  });

  const [speed, setSpeed] = useState(1);
  const [theme, setTheme] = useState('green');
  const [decodeMode, setDecodeMode] = useState(true);

  const initColumns = useCallback((W, H) => {
    const fontSize = 14;
    const cols = Math.floor(W / fontSize);
    const columns = [];
    for (let i = 0; i < cols; i++) {
      const depth = Math.random();
      columns.push({
        x: i * fontSize,
        y: Math.random() * H * -1,
        speed: 0.5 + Math.random() * 1.5,
        chars: [],
        trailLength: 8 + Math.floor(Math.random() * 20),
        depth,
        fontSize: Math.floor(fontSize * (0.7 + depth * 0.5)),
        brightness: 0.25 + depth * 0.75,
        offsetX: 0,
        offsetY: 0,
      });
      // Pre-populate character trail
      for (let j = 0; j < columns[i].trailLength; j++) {
        columns[i].chars.push({
          char: ALL_CHARS[Math.floor(Math.random() * ALL_CHARS.length)],
          flickerTimer: Math.random() * 100,
        });
      }
    }
    return columns;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const W = 600, H = 400;
    canvas.width = W;
    canvas.height = H;

    const s = stateRef.current;
    s.columns = initColumns(W, H);

    // --- Event handlers ---
    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = W / rect.width;
      const scaleY = H / rect.height;
      let cx, cy;
      if (e.touches && e.touches.length > 0) {
        cx = (e.touches[0].clientX - rect.left) * scaleX;
        cy = (e.touches[0].clientY - rect.top) * scaleY;
      } else {
        cx = (e.clientX - rect.left) * scaleX;
        cy = (e.clientY - rect.top) * scaleY;
      }
      return { x: cx, y: cy };
    };

    const handleMove = (e) => {
      e.preventDefault();
      const pos = getPos(e);
      s.mouse = { ...pos, active: true };
    };
    const handleLeave = () => {
      s.mouse = { x: -9999, y: -9999, active: false };
    };
    const handleDown = (e) => {
      e.preventDefault();
      const pos = getPos(e);
      s.bursts.push({
        x: pos.x, y: pos.y,
        radius: 0, maxRadius: 180,
        strength: 8,
        life: 1,
      });
    };

    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('mouseleave', handleLeave);
    canvas.addEventListener('mousedown', handleDown);
    canvas.addEventListener('touchmove', handleMove, { passive: false });
    canvas.addEventListener('touchstart', (e) => {
      handleMove(e);
      handleDown(e);
    }, { passive: false });
    canvas.addEventListener('touchend', handleLeave);

    // --- Decode scheduling ---
    let decodeTimer = null;
    const scheduleNextDecode = () => {
      const delay = 3000 + Math.random() * 6000;
      decodeTimer = setTimeout(() => {
        if (s.decodeMode && s.columns.length > 0) {
          const phrase = DECODE_PHRASES[Math.floor(Math.random() * DECODE_PHRASES.length)];
          const startCol = Math.floor(Math.random() * Math.max(1, s.columns.length - phrase.length));
          s.decodeEvents.push({
            phrase,
            startCol,
            row: Math.floor(Math.random() * (H / 14)),
            life: 1,
            fadeSpeed: 0.008,
          });
        }
        scheduleNextDecode();
      }, delay);
    };
    scheduleNextDecode();

    // --- Main draw loop ---
    const draw = (timestamp) => {
      const dt = Math.min((timestamp - s.lastTime) / 16.67, 3);
      s.lastTime = timestamp;
      const spd = s.speed * dt;
      const themeData = COLOR_THEMES[s.theme];
      const [cr, cg, cb] = themeData.dim;

      // Fade trailing effect
      ctx.fillStyle = 'rgba(5, 8, 15, 0.08)';
      ctx.fillRect(0, 0, W, H);

      // Update bursts
      for (let b = s.bursts.length - 1; b >= 0; b--) {
        const burst = s.bursts[b];
        burst.radius += 4 * spd;
        burst.life -= 0.02 * spd;
        if (burst.life <= 0 || burst.radius > burst.maxRadius) {
          s.bursts.splice(b, 1);
        }
      }

      // Draw and update columns
      for (let i = 0; i < s.columns.length; i++) {
        const col = s.columns[i];

        // Force field from mouse
        col.offsetX = 0;
        col.offsetY = 0;
        if (s.mouse.active) {
          const dx = col.x - s.mouse.x;
          const dy = col.y - s.mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const forceRadius = 100;
          if (dist < forceRadius && dist > 0) {
            const force = (1 - dist / forceRadius) * 40;
            col.offsetX = (dx / dist) * force;
            col.offsetY = (dy / dist) * force * 0.5;
          }
        }

        // Burst forces
        for (let b = 0; b < s.bursts.length; b++) {
          const burst = s.bursts[b];
          const dx = col.x - burst.x;
          const dy = col.y - burst.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const ringDist = Math.abs(dist - burst.radius);
          if (ringDist < 40) {
            const force = (1 - ringDist / 40) * burst.strength * burst.life;
            if (dist > 0) {
              col.offsetX += (dx / dist) * force;
              col.offsetY += (dy / dist) * force * 0.3;
            }
          }
        }

        // Move column downward
        col.y += col.speed * spd * 2.5;

        // Reset column when it scrolls past
        if (col.y - col.trailLength * col.fontSize > H + 50) {
          col.y = -col.trailLength * col.fontSize * Math.random();
          col.speed = 0.5 + Math.random() * 1.5;
          col.depth = Math.random();
          col.brightness = 0.25 + col.depth * 0.75;
          col.fontSize = Math.floor(14 * (0.7 + col.depth * 0.5));
          col.trailLength = 8 + Math.floor(Math.random() * 20);
          col.chars = [];
          for (let j = 0; j < col.trailLength; j++) {
            col.chars.push({
              char: ALL_CHARS[Math.floor(Math.random() * ALL_CHARS.length)],
              flickerTimer: Math.random() * 100,
            });
          }
        }

        // Draw each character in the trail
        const fs = col.fontSize;
        ctx.font = `${fs}px "JetBrains Mono", "Courier New", monospace`;

        for (let j = 0; j < col.chars.length; j++) {
          const charData = col.chars[j];
          const cy = col.y - j * fs;

          if (cy < -fs || cy > H + fs) continue;

          // Randomly flicker characters
          charData.flickerTimer += spd;
          if (charData.flickerTimer > 5 + Math.random() * 30) {
            charData.char = ALL_CHARS[Math.floor(Math.random() * ALL_CHARS.length)];
            charData.flickerTimer = 0;
          }

          const drawX = col.x + col.offsetX;
          const drawY = cy + col.offsetY;

          if (j === 0) {
            // Head character: bright white/colored glow
            ctx.shadowColor = themeData.primary;
            ctx.shadowBlur = 15 * col.brightness;
            ctx.fillStyle = themeData.head;
            ctx.fillText(charData.char, drawX, drawY);
            ctx.shadowBlur = 0;
          } else {
            // Trail characters: fade out with depth
            const trailFade = 1 - (j / col.trailLength);
            const alpha = trailFade * col.brightness;
            if (alpha < 0.03) continue;
            ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${alpha.toFixed(2)})`;
            ctx.fillText(charData.char, drawX, drawY);
          }
        }
      }

      // Draw decode events
      for (let d = s.decodeEvents.length - 1; d >= 0; d--) {
        const ev = s.decodeEvents[d];
        const alpha = Math.min(ev.life, 1);
        const y = ev.row * 14 + 14;

        ctx.save();
        // Glow behind text
        ctx.shadowColor = themeData.primary;
        ctx.shadowBlur = 20;
        ctx.font = 'bold 16px "JetBrains Mono", "Courier New", monospace';
        ctx.fillStyle = `rgba(255, 255, 255, ${(alpha * 0.95).toFixed(2)})`;

        for (let c = 0; c < ev.phrase.length; c++) {
          const colIdx = ev.startCol + c;
          if (colIdx >= 0 && colIdx < s.columns.length) {
            const x = s.columns[colIdx].x;
            ctx.fillText(ev.phrase[c], x, y);
          }
        }
        ctx.restore();

        ev.life -= ev.fadeSpeed * spd;
        if (ev.life <= 0) {
          s.decodeEvents.splice(d, 1);
        }
      }

      // Draw burst ring visuals
      for (let b = 0; b < s.bursts.length; b++) {
        const burst = s.bursts[b];
        ctx.beginPath();
        ctx.arc(burst.x, burst.y, burst.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${(burst.life * 0.3).toFixed(2)})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      s.animId = requestAnimationFrame(draw);
    };

    s.animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(s.animId);
      clearTimeout(decodeTimer);
      canvas.removeEventListener('mousemove', handleMove);
      canvas.removeEventListener('mouseleave', handleLeave);
      canvas.removeEventListener('mousedown', handleDown);
      canvas.removeEventListener('touchmove', handleMove);
      canvas.removeEventListener('touchstart', handleDown);
      canvas.removeEventListener('touchend', handleLeave);
    };
  }, [initColumns]);

  // Sync React state to ref
  useEffect(() => { stateRef.current.speed = speed; }, [speed]);
  useEffect(() => { stateRef.current.theme = theme; }, [theme]);
  useEffect(() => { stateRef.current.decodeMode = decodeMode; }, [decodeMode]);

  const accentColor = '#64c8ff';
  const controlStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    padding: '8px 12px',
    background: 'rgba(5, 8, 15, 0.85)',
    borderRadius: '0 0 8px 8px',
    borderTop: `1px solid rgba(100, 200, 255, 0.15)`,
    fontFamily: '"JetBrains Mono", "Courier New", monospace',
    fontSize: 11,
    color: accentColor,
  };

  const btnBase = {
    background: 'rgba(100, 200, 255, 0.08)',
    border: `1px solid rgba(100, 200, 255, 0.25)`,
    borderRadius: 4,
    color: accentColor,
    padding: '3px 8px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 11,
    transition: 'all 0.2s',
  };

  const btnActive = {
    ...btnBase,
    background: 'rgba(100, 200, 255, 0.2)',
    borderColor: accentColor,
    boxShadow: `0 0 6px rgba(100, 200, 255, 0.3)`,
  };

  return (
    <div style={{ width: '100%', maxWidth: 600 }}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: 'auto',
          borderRadius: '8px 8px 0 0',
          cursor: 'crosshair',
          display: 'block',
          background: '#050810',
          touchAction: 'none',
        }}
      />
      <div style={controlStyle}>
        {/* Speed slider */}
        <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          SPD
          <input
            type="range"
            min="0.15"
            max="4"
            step="0.05"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            style={{ width: 70, accentColor }}
          />
          <span style={{ minWidth: 28, textAlign: 'right' }}>{speed.toFixed(1)}x</span>
        </label>

        {/* Divider */}
        <span style={{ color: 'rgba(100,200,255,0.2)' }}>|</span>

        {/* Color theme buttons */}
        {Object.entries(COLOR_THEMES).map(([key, val]) => (
          <button
            key={key}
            onClick={() => setTheme(key)}
            style={theme === key ? btnActive : btnBase}
            title={val.name}
          >
            <span style={{
              display: 'inline-block',
              width: 8, height: 8,
              borderRadius: '50%',
              background: val.primary,
              marginRight: 4,
              verticalAlign: 'middle',
              boxShadow: theme === key ? `0 0 4px ${val.primary}` : 'none',
            }} />
            {val.name.split(' ').pop()}
          </button>
        ))}

        <span style={{ color: 'rgba(100,200,255,0.2)' }}>|</span>

        {/* Decode toggle */}
        <button
          onClick={() => setDecodeMode(!decodeMode)}
          style={decodeMode ? btnActive : btnBase}
        >
          DECODE {decodeMode ? 'ON' : 'OFF'}
        </button>
      </div>
    </div>
  );
};

export default MatrixRain;
