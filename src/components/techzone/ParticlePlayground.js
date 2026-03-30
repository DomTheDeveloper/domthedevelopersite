import React, { useRef, useEffect, useState } from 'react';

const MODES = [
  { id: 'attract', name: 'Attract' },
  { id: 'repel', name: 'Repel' },
  { id: 'vortex', name: 'Vortex' },
  { id: 'explode', name: 'Explode' },
];

const ParticlePlayground = () => {
  const canvasRef = useRef(null);
  const [mode, setMode] = useState('attract');
  const [count, setCount] = useState(0);
  const modeRef = useRef('attract');

  useEffect(() => { modeRef.current = mode; }, [mode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const W = 500, H = 320;
    canvas.width = W;
    canvas.height = H;
    let animId;
    let mouse = { x: W / 2, y: H / 2, down: false };

    const particles = [];
    for (let i = 0; i < 300; i++) {
      particles.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: 0, vy: 0,
        baseX: Math.random() * W, baseY: Math.random() * H,
        size: 1 + Math.random() * 2,
        color: `hsl(${195 + Math.random() * 30}, 80%, ${50 + Math.random() * 30}%)`,
      });
    }
    setCount(particles.length);

    const handleMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - rect.left) * (W / rect.width);
      mouse.y = (e.clientY - rect.top) * (H / rect.height);
    };

    const handleDown = () => { mouse.down = true; };
    const handleUp = () => { mouse.down = false; };

    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('mousedown', handleDown);
    canvas.addEventListener('mouseup', handleUp);
    canvas.addEventListener('mouseleave', handleUp);

    const draw = () => {
      ctx.fillStyle = 'rgba(5, 8, 15, 0.12)';
      ctx.fillRect(0, 0, W, H);

      particles.forEach(p => {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = Math.min(8, 150 / dist);
        const m = modeRef.current;

        if (mouse.down || m === 'attract') {
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
          } else if (m === 'explode' && dist < 100) {
            p.vx -= (dx / dist) * 3;
            p.vy -= (dy / dist) * 3;
          }
        }

        // gentle return to base
        p.vx += (p.baseX - p.x) * 0.001;
        p.vy += (p.baseY - p.y) * 0.001;

        p.vx *= 0.96;
        p.vy *= 0.96;
        p.x += p.vx;
        p.y += p.vy;

        // wrap
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;

        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const alpha = Math.min(1, 0.3 + speed * 0.15);
        const size = p.size + speed * 0.3;

        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace(')', `, ${alpha})`).replace('hsl', 'hsla');
        ctx.fill();
      });

      // mouse glow
      if (mouse.down) {
        const glow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 80);
        glow.addColorStop(0, 'rgba(100, 200, 255, 0.08)');
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
      canvas.removeEventListener('mouseleave', handleUp);
    };
  }, []);

  return (
    <div style={{ width: '100%' }}>
      <div className="city-sim__toolbar" style={{ marginBottom: '0.8rem' }}>
        {MODES.map(m => (
          <button key={m.id} className={`city-sim__btn ${mode === m.id ? 'city-sim__btn--active' : ''}`} onClick={() => setMode(m.id)}>
            {m.name}
          </button>
        ))}
        <span className="city-sim__pop">{count} particles</span>
      </div>
      <canvas ref={canvasRef}
        style={{ width: '100%', maxWidth: 500, height: 'auto', borderRadius: 8, cursor: 'pointer', display: 'block', background: '#050810' }}
      />
      <p style={{ textAlign: 'center', color: '#515c72', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', marginTop: '0.5rem' }}>
        Move mouse & hold click to interact with particles
      </p>
    </div>
  );
};

export default ParticlePlayground;
