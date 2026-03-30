import React, { useRef, useEffect, useState } from 'react';

const MODES = [
  { id: 'attract', name: 'Attract' },
  { id: 'repel', name: 'Repel' },
  { id: 'vortex', name: 'Vortex' },
  { id: 'gravity', name: 'Gravity' },
  { id: 'orbit', name: 'Orbit' },
  { id: 'explode', name: 'Explode' },
];

const COLOR_MODES = [
  { id: 'blue', name: 'Blue' },
  { id: 'rainbow', name: 'Rainbow' },
  { id: 'fire', name: 'Fire' },
  { id: 'ice', name: 'Ice' },
];

const getParticleColor = (colorMode, i, speed) => {
  switch (colorMode) {
    case 'rainbow':
      return `hsl(${(i * 3.7 + Date.now() * 0.02) % 360}, 80%, ${50 + speed * 5}%)`;
    case 'fire':
      return `hsl(${Math.max(0, 30 - speed * 8)}, 100%, ${45 + speed * 6}%)`;
    case 'ice':
      return `hsl(${190 + Math.sin(i * 0.5) * 20}, ${70 + speed * 5}%, ${55 + speed * 5}%)`;
    case 'blue':
    default:
      return `hsl(${195 + Math.sin(i * 0.3) * 15}, 80%, ${50 + speed * 5}%)`;
  }
};

const ParticlePlayground = () => {
  const canvasRef = useRef(null);
  const trailCanvasRef = useRef(null);
  const [mode, setMode] = useState('attract');
  const [colorMode, setColorMode] = useState('blue');
  const [count, setCount] = useState(0);
  const modeRef = useRef('attract');
  const colorModeRef = useRef('blue');

  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { colorModeRef.current = colorMode; }, [colorMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const W = 500, H = 320;
    canvas.width = W;
    canvas.height = H;

    // Create offscreen trail canvas
    const trailCanvas = document.createElement('canvas');
    trailCanvas.width = W;
    trailCanvas.height = H;
    const trailCtx = trailCanvas.getContext('2d');
    trailCanvasRef.current = trailCanvas;

    let animId;
    let mouse = { x: W / 2, y: H / 2, down: false, active: false };

    const particles = [];
    for (let i = 0; i < 350; i++) {
      particles.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: 0, vy: 0,
        baseX: Math.random() * W, baseY: Math.random() * H,
        size: 1 + Math.random() * 2,
        id: i,
        orbitAngle: Math.random() * Math.PI * 2,
        orbitDist: 30 + Math.random() * 80,
      });
    }
    setCount(particles.length);

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) * (W / rect.width),
        y: (e.clientY - rect.top) * (H / rect.height),
      };
    };

    const handleMove = (e) => {
      const pos = getPos(e);
      mouse.x = pos.x; mouse.y = pos.y;
      mouse.active = true;
    };
    const handleDown = () => { mouse.down = true; mouse.active = true; };
    const handleUp = () => { mouse.down = false; };
    const handleLeave = () => { mouse.down = false; mouse.active = false; };

    const handleTouchStart = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      mouse.x = (touch.clientX - rect.left) * (W / rect.width);
      mouse.y = (touch.clientY - rect.top) * (H / rect.height);
      mouse.down = true; mouse.active = true;
    };
    const handleTouchMove = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      mouse.x = (touch.clientX - rect.left) * (W / rect.width);
      mouse.y = (touch.clientY - rect.top) * (H / rect.height);
    };
    const handleTouchEnd = (e) => { e.preventDefault(); mouse.down = false; };

    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('mousedown', handleDown);
    canvas.addEventListener('mouseup', handleUp);
    canvas.addEventListener('mouseleave', handleLeave);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    const draw = () => {
      // Fade trail canvas
      trailCtx.fillStyle = 'rgba(5, 8, 15, 0.08)';
      trailCtx.fillRect(0, 0, W, H);

      // Clear main canvas
      ctx.fillStyle = '#050810';
      ctx.fillRect(0, 0, W, H);

      const m = modeRef.current;
      const cm = colorModeRef.current;
      const interactionRadius = 120;

      particles.forEach((p, idx) => {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = Math.min(8, 150 / dist);

        if (mouse.down || m === 'attract' || m === 'gravity' || m === 'orbit') {
          if (m === 'attract') {
            p.vx += (dx / dist) * force * 0.03;
            p.vy += (dy / dist) * force * 0.03;
          } else if (m === 'repel') {
            p.vx -= (dx / dist) * force * 0.08;
            p.vy -= (dy / dist) * force * 0.08;
          } else if (m === 'vortex') {
            p.vx += (-dy / dist) * force * 0.04;
            p.vy += (dx / dist) * force * 0.04;
            p.vx += (dx / dist) * force * 0.005;
            p.vy += (dy / dist) * force * 0.005;
          } else if (m === 'gravity') {
            // Gravity pulls particles down, mouse pushes them around
            p.vy += 0.08;
            if (mouse.down && dist < interactionRadius) {
              p.vx += (dx / dist) * force * 0.04;
              p.vy += (dy / dist) * force * 0.04;
            }
            // Floor bounce
            if (p.y > H - 5) { p.y = H - 5; p.vy *= -0.5; p.vx *= 0.9; }
            if (p.x < 5) { p.x = 5; p.vx *= -0.6; }
            if (p.x > W - 5) { p.x = W - 5; p.vx *= -0.6; }
          } else if (m === 'orbit') {
            // Orbit around cursor
            p.orbitAngle += 0.02 + (idx % 5) * 0.004;
            const targetX = mouse.x + Math.cos(p.orbitAngle) * p.orbitDist;
            const targetY = mouse.y + Math.sin(p.orbitAngle) * p.orbitDist;
            p.vx += (targetX - p.x) * 0.02;
            p.vy += (targetY - p.y) * 0.02;
          } else if (m === 'explode' && dist < interactionRadius) {
            p.vx -= (dx / dist) * 3;
            p.vy -= (dy / dist) * 3;
          }
        }

        // Gentle return to base (except gravity/orbit)
        if (m !== 'gravity' && m !== 'orbit') {
          p.vx += (p.baseX - p.x) * 0.001;
          p.vy += (p.baseY - p.y) * 0.001;
        }

        p.vx *= 0.96;
        p.vy *= (m === 'gravity' ? 0.99 : 0.96);
        p.x += p.vx;
        p.y += p.vy;

        // Wrap (except gravity which bounces)
        if (m !== 'gravity') {
          if (p.x < 0) p.x = W;
          if (p.x > W) p.x = 0;
          if (p.y < 0) p.y = H;
          if (p.y > H) p.y = 0;
        }

        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const alpha = Math.min(1, 0.3 + speed * 0.15);
        const size = p.size + speed * 0.3;
        const color = getParticleColor(cm, p.id, speed);

        // Draw trail on trail canvas
        trailCtx.beginPath();
        trailCtx.arc(p.x, p.y, size * 0.8, 0, Math.PI * 2);
        trailCtx.fillStyle = color.includes('hsl') ?
          color.replace(')', `, ${alpha * 0.5})`).replace('hsl', 'hsla') :
          color;
        trailCtx.fill();

        // Draw particle on main canvas
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = color.includes('hsl') ?
          color.replace(')', `, ${alpha})`).replace('hsl', 'hsla') :
          color;
        ctx.fill();
      });

      // Composite trail canvas under particles
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = 0.6;
      ctx.drawImage(trailCanvas, 0, 0);
      ctx.restore();

      // Interaction radius circle around cursor
      if (mouse.active) {
        ctx.save();
        ctx.strokeStyle = `rgba(100,200,255,${mouse.down ? 0.15 : 0.06})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, interactionRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        // Center dot
        ctx.fillStyle = `rgba(100,200,255,${mouse.down ? 0.3 : 0.1})`;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Mouse glow when held
      if (mouse.down) {
        const glow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 90);
        glow.addColorStop(0, 'rgba(100, 200, 255, 0.06)');
        glow.addColorStop(1, 'rgba(100, 200, 255, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, W, H);
      }

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('mousemove', handleMove);
      canvas.removeEventListener('mousedown', handleDown);
      canvas.removeEventListener('mouseup', handleUp);
      canvas.removeEventListener('mouseleave', handleLeave);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return (
    <div style={{ width: '100%' }}>
      <div className="city-sim__toolbar" style={{ marginBottom: '0.5rem' }}>
        {MODES.map(m => (
          <button key={m.id} className={`city-sim__btn ${mode === m.id ? 'city-sim__btn--active' : ''}`} onClick={() => setMode(m.id)}>
            {m.name}
          </button>
        ))}
      </div>
      <div className="city-sim__toolbar" style={{ marginBottom: '0.8rem' }}>
        {COLOR_MODES.map(cm => (
          <button key={cm.id} className={`city-sim__btn ${colorMode === cm.id ? 'city-sim__btn--active' : ''}`} onClick={() => setColorMode(cm.id)}>
            {cm.name}
          </button>
        ))}
        <span className="city-sim__pop">{count} particles</span>
      </div>
      <canvas ref={canvasRef}
        style={{ width: '100%', maxWidth: 500, height: 'auto', borderRadius: 8, cursor: 'pointer', display: 'block', background: '#050810', touchAction: 'none' }}
      />
      <p style={{ textAlign: 'center', color: '#515c72', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', marginTop: '0.5rem' }}>
        Touch or move mouse & hold to interact with particles
      </p>
    </div>
  );
};

export default ParticlePlayground;
