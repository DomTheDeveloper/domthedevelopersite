import React, { useRef, useEffect, useState } from 'react';

const Constellations = () => {
  const canvasRef = useRef(null);
  const starsRef = useRef([]);
  const shootingStarsRef = useRef([]);
  const [starCount, setStarCount] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    let bgStars = [];

    const resize = () => {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = 400;
      bgStars = [];
      for (let i = 0; i < 80; i++) {
        bgStars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.2 + 0.3,
          twinkle: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.02 + 0.01,
        });
      }
    };
    resize();
    window.addEventListener('resize', resize);

    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      starsRef.current.push({
        x, y,
        size: 3,
        pulse: 0,
        born: Date.now(),
      });
      setStarCount(starsRef.current.length);

      // chance of shooting star on click
      if (Math.random() > 0.5) {
        shootingStarsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * 50,
          vx: 4 + Math.random() * 4,
          vy: 2 + Math.random() * 2,
          life: 40 + Math.random() * 20,
          maxLife: 60,
          trail: [],
        });
      }
    };

    canvas.addEventListener('click', handleClick);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const grad = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2);
      grad.addColorStop(0, '#0d1220');
      grad.addColorStop(1, '#060a14');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // bg stars
      bgStars.forEach(s => {
        s.twinkle += s.speed;
        const alpha = 0.2 + Math.sin(s.twinkle) * 0.2;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 200, 230, ${alpha})`;
        ctx.fill();
      });

      // nebula glow
      if (starsRef.current.length > 3) {
        const cx = starsRef.current.reduce((s, p) => s + p.x, 0) / starsRef.current.length;
        const cy = starsRef.current.reduce((s, p) => s + p.y, 0) / starsRef.current.length;
        const nebula = ctx.createRadialGradient(cx, cy, 0, cx, cy, 150);
        nebula.addColorStop(0, 'rgba(100, 200, 255, 0.03)');
        nebula.addColorStop(1, 'rgba(100, 200, 255, 0)');
        ctx.fillStyle = nebula;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // constellation lines
      const stars = starsRef.current;
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x;
          const dy = stars[i].y - stars[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            const alpha = (1 - dist / 150) * 0.5;
            ctx.beginPath();
            ctx.moveTo(stars[i].x, stars[i].y);
            ctx.lineTo(stars[j].x, stars[j].y);
            ctx.strokeStyle = `rgba(100, 200, 255, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // user stars
      stars.forEach(s => {
        s.pulse += 0.05;
        const glow = 3 + Math.sin(s.pulse) * 1.5;

        ctx.save();
        ctx.shadowColor = '#64c8ff';
        ctx.shadowBlur = 12;

        ctx.beginPath();
        ctx.arc(s.x, s.y, glow, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100, 200, 255, ${0.15 + Math.sin(s.pulse) * 0.05})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = '#c8e6ff';
        ctx.fill();

        ctx.restore();
      });

      // shooting stars
      shootingStarsRef.current.forEach(ss => {
        ss.trail.push({ x: ss.x, y: ss.y });
        if (ss.trail.length > 20) ss.trail.shift();
        ss.x += ss.vx;
        ss.y += ss.vy;
        ss.life--;

        ss.trail.forEach((t, i) => {
          const alpha = (i / ss.trail.length) * (ss.life / ss.maxLife) * 0.8;
          const w = (i / ss.trail.length) * 2;
          ctx.beginPath();
          ctx.arc(t.x, t.y, w, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(200, 230, 255, ${alpha})`;
          ctx.fill();
        });

        ctx.save();
        ctx.shadowColor = '#fff';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(ss.x, ss.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.restore();
      });
      shootingStarsRef.current = shootingStarsRef.current.filter(ss => ss.life > 0);

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('click', handleClick);
    };
  }, []);

  const clear = () => {
    starsRef.current = [];
    setStarCount(0);
  };

  return (
    <div className="constellation-wrapper">
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: 400, borderRadius: 12, cursor: 'crosshair', display: 'block' }}
      />
      <div className="constellation-info">
        <span>{starCount} star{starCount !== 1 ? 's' : ''} placed</span>
        {starCount > 0 && (
          <button onClick={clear} className="constellation-clear">Clear</button>
        )}
      </div>
    </div>
  );
};

export default Constellations;
