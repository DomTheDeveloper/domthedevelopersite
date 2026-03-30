import React, { useRef, useEffect, useState } from 'react';

const GravitySim = () => {
  const canvasRef = useRef(null);
  const bodiesRef = useRef([]);
  const [bodyCount, setBodyCount] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const W = 500, H = 320;
    canvas.width = W;
    canvas.height = H;
    let animId;

    // seed a central star
    if (bodiesRef.current.length === 0) {
      bodiesRef.current.push({
        x: W / 2, y: H / 2, vx: 0, vy: 0,
        mass: 800, radius: 12, color: '#febc2e',
        trail: [], isStar: true,
      });
      setBodyCount(1);
    }

    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = W / rect.width;
      const scaleY = H / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      // give orbital velocity relative to center
      const dx = x - W / 2;
      const dy = y - H / 2;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const speed = Math.sqrt(800 / dist) * 0.8;

      bodiesRef.current.push({
        x, y,
        vx: (-dy / dist) * speed + (Math.random() - 0.5) * 0.5,
        vy: (dx / dist) * speed + (Math.random() - 0.5) * 0.5,
        mass: 2 + Math.random() * 5,
        radius: 2 + Math.random() * 3,
        color: ['#64c8ff', '#4facfe', '#00f2fe', '#76e2f8', '#5bc0eb', '#c084fc', '#ff79c6'][Math.floor(Math.random() * 7)],
        trail: [],
        isStar: false,
      });
      setBodyCount(bodiesRef.current.length);
    };

    canvas.addEventListener('click', handleClick);

    const G = 0.5;

    const draw = () => {
      ctx.fillStyle = 'rgba(5, 8, 15, 0.15)';
      ctx.fillRect(0, 0, W, H);

      const bodies = bodiesRef.current;

      // gravity
      for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
          const dx = bodies[j].x - bodies[i].x;
          const dy = bodies[j].y - bodies[i].y;
          const distSq = dx * dx + dy * dy + 100;
          const dist = Math.sqrt(distSq);
          const force = G * bodies[i].mass * bodies[j].mass / distSq;
          const fx = force * dx / dist;
          const fy = force * dy / dist;
          bodies[i].vx += fx / bodies[i].mass;
          bodies[i].vy += fy / bodies[i].mass;
          bodies[j].vx -= fx / bodies[j].mass;
          bodies[j].vy -= fy / bodies[j].mass;
        }
      }

      // update
      bodies.forEach(b => {
        b.x += b.vx;
        b.y += b.vy;

        b.trail.push({ x: b.x, y: b.y });
        if (b.trail.length > (b.isStar ? 5 : 30)) b.trail.shift();
      });

      // draw trails
      bodies.forEach(b => {
        if (b.trail.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(b.trail[0].x, b.trail[0].y);
        for (let i = 1; i < b.trail.length; i++) {
          ctx.lineTo(b.trail[i].x, b.trail[i].y);
        }
        ctx.strokeStyle = b.isStar ? 'rgba(254, 188, 46, 0.1)' : b.color.replace(')', ', 0.2)').replace('rgb', 'rgba').replace('#', '');
        ctx.strokeStyle = `rgba(${parseInt(b.color.slice(1,3),16)},${parseInt(b.color.slice(3,5),16)},${parseInt(b.color.slice(5,7),16)},0.15)`;
        ctx.lineWidth = b.isStar ? 3 : 1;
        ctx.stroke();
      });

      // draw bodies
      bodies.forEach(b => {
        ctx.save();
        ctx.shadowColor = b.color;
        ctx.shadowBlur = b.isStar ? 25 : 8;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.fill();
        ctx.restore();
      });

      // remove escaped bodies
      bodiesRef.current = bodies.filter(b =>
        b.isStar || (b.x > -100 && b.x < W + 100 && b.y > -100 && b.y < H + 100)
      );

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('click', handleClick);
    };
  }, []);

  const reset = () => {
    bodiesRef.current = [{
      x: 250, y: 160, vx: 0, vy: 0,
      mass: 800, radius: 12, color: '#febc2e',
      trail: [], isStar: true,
    }];
    setBodyCount(1);
  };

  return (
    <div>
      <div className="city-sim__toolbar" style={{ marginBottom: '0.8rem' }}>
        <span className="city-sim__pop">Bodies: {bodyCount}</span>
        <button className="constellation-clear" onClick={reset}>Reset</button>
      </div>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', maxWidth: 500, height: 'auto', borderRadius: 8, cursor: 'crosshair', display: 'block', background: '#050810' }}
      />
      <p className="city-sim__hint" style={{ textAlign: 'center', color: '#515c72', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', marginTop: '0.5rem' }}>
        Click to spawn orbiting bodies around the central star
      </p>
    </div>
  );
};

export default GravitySim;
