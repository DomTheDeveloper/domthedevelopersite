import React, { useEffect, useRef } from 'react';

const ClickSpark = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let sparks = [];
    let animId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = document.documentElement.scrollHeight;
    };
    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(document.body);

    const handleClick = (e) => {
      const x = e.clientX;
      const y = e.clientY + window.scrollY;
      for (let i = 0; i < 12; i++) {
        const angle = (Math.PI * 2 * i) / 12 + Math.random() * 0.3;
        const speed = 2 + Math.random() * 3;
        sparks.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 25 + Math.random() * 15,
          maxLife: 40,
          size: 1 + Math.random() * 2,
        });
      }
    };

    window.addEventListener('click', handleClick);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      sparks.forEach(s => {
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.05;
        s.vx *= 0.98;
        s.life--;

        const alpha = s.life / s.maxLife;
        ctx.beginPath();
        ctx.arc(s.x, s.y - window.scrollY, s.size * alpha, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100, 200, 255, ${alpha * 0.7})`;
        ctx.fill();
      });
      sparks = sparks.filter(s => s.life > 0);

      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('click', handleClick);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    />
  );
};

export default ClickSpark;
