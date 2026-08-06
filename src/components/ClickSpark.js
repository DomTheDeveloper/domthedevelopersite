import React, { useEffect, useRef } from 'react';
import useReducedMotion from '../hooks/useReducedMotion';

const ClickSpark = () => {
  const canvasRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return undefined;
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    let sparks = [];
    let animId = null;
    let width = 0;
    let height = 0;

    // The canvas is position:fixed and viewport-sized, so the backing store has
    // to match the viewport too — sizing it to the document height squashed
    // every spark into a sliver at the top of the screen.
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      sparks.forEach(s => {
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.05;
        s.vx *= 0.98;
        s.life--;

        // life can tick past zero before the filter below runs; a negative
        // radius makes arc() throw and kills the animation loop.
        const alpha = Math.max(0, s.life / s.maxLife);
        ctx.beginPath();
        ctx.arc(s.x, s.y - window.scrollY, s.size * alpha, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100, 200, 255, ${alpha * 0.7})`;
        ctx.fill();
      });
      sparks = sparks.filter(s => s.life > 0);

      // Idle instead of spinning a render loop over an empty screen.
      if (!sparks.length) {
        ctx.clearRect(0, 0, width, height);
        animId = null;
        return;
      }
      animId = requestAnimationFrame(animate);
    };

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
      if (animId === null) animId = requestAnimationFrame(animate);
    };

    window.addEventListener('click', handleClick);
    window.addEventListener('resize', resize);

    return () => {
      if (animId !== null) cancelAnimationFrame(animId);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('resize', resize);
    };
  }, [reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
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
