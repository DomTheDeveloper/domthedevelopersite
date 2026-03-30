import React, { useRef, useEffect, useState, useCallback } from 'react';

const FlappyRocket = () => {
  const canvasRef = useRef(null);
  const gameRef = useRef({});
  const [started, setStarted] = useState(false);

  const W = 300, H = 400;

  const reset = useCallback(() => {
    const g = gameRef.current;
    g.bird = { y: H / 2, vy: 0 };
    g.pipes = [];
    g.frame = 0;
    g.score = 0;
    g.running = true;
    g.stars = Array.from({ length: 20 }, () => ({ x: Math.random() * W, y: Math.random() * H, s: Math.random() + 0.5 }));
  }, []);

  const start = useCallback(() => { reset(); setStarted(true); }, [reset]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;

    const flap = () => {
      if (!started) { start(); return; }
      const g = gameRef.current;
      if (!g.running) { start(); return; }
      g.bird.vy = -5.5;
    };

    const handleKey = (e) => { if (e.code === 'Space') { e.preventDefault(); flap(); } };
    window.addEventListener('keydown', handleKey);
    canvas.addEventListener('click', flap);

    const draw = () => {
      const g = gameRef.current;
      ctx.fillStyle = '#060a14';
      ctx.fillRect(0, 0, W, H);

      if (!started) {
        ctx.fillStyle = '#64c8ff'; ctx.font = '16px "JetBrains Mono", monospace'; ctx.textAlign = 'center';
        ctx.fillText('FLAPPY ROCKET', W / 2, H / 2 - 20);
        ctx.fillStyle = '#8892a8'; ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillText('Click or Space to fly', W / 2, H / 2 + 10);
        animId = requestAnimationFrame(draw); return;
      }

      // stars
      g.stars.forEach(s => {
        s.x -= 0.5;
        if (s.x < 0) s.x = W;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.s * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,220,255,0.3)`; ctx.fill();
      });

      if (g.running) {
        g.frame++;
        g.bird.vy += 0.28;
        g.bird.y += g.bird.vy;

        if (g.frame % 90 === 0) {
          const gap = 100;
          const gapY = 60 + Math.random() * (H - 160);
          g.pipes.push({ x: W, gapY, gap, passed: false });
        }

        g.pipes.forEach(p => {
          p.x -= 2;
          if (!p.passed && p.x + 30 < 50) { p.passed = true; g.score++; }
        });
        g.pipes = g.pipes.filter(p => p.x > -40);

        // collision
        if (g.bird.y < 0 || g.bird.y > H) g.running = false;
        g.pipes.forEach(p => {
          if (50 + 10 > p.x && 50 - 10 < p.x + 30) {
            if (g.bird.y - 10 < p.gapY || g.bird.y + 10 > p.gapY + p.gap) g.running = false;
          }
        });
      }

      // pipes
      g.pipes.forEach(p => {
        ctx.fillStyle = 'rgba(100,200,255,0.15)';
        ctx.strokeStyle = 'rgba(100,200,255,0.3)';
        ctx.lineWidth = 1;
        ctx.fillRect(p.x, 0, 30, p.gapY);
        ctx.strokeRect(p.x, 0, 30, p.gapY);
        ctx.fillRect(p.x, p.gapY + p.gap, 30, H - p.gapY - p.gap);
        ctx.strokeRect(p.x, p.gapY + p.gap, 30, H - p.gapY - p.gap);
      });

      // rocket
      ctx.save(); ctx.shadowColor = '#64c8ff'; ctx.shadowBlur = 12;
      ctx.fillStyle = '#64c8ff'; ctx.beginPath();
      ctx.moveTo(60, g.bird.y); ctx.lineTo(40, g.bird.y - 8); ctx.lineTo(40, g.bird.y + 8);
      ctx.closePath(); ctx.fill();
      // flame
      if (g.bird.vy < 0) {
        ctx.fillStyle = `rgba(255,180,50,${0.5 + Math.random() * 0.3})`;
        ctx.beginPath(); ctx.moveTo(40, g.bird.y - 4); ctx.lineTo(32 - Math.random() * 5, g.bird.y); ctx.lineTo(40, g.bird.y + 4);
        ctx.closePath(); ctx.fill();
      }
      ctx.restore();

      ctx.fillStyle = 'rgba(100,200,255,0.8)'; ctx.font = '14px "JetBrains Mono", monospace'; ctx.textAlign = 'center';
      ctx.fillText(g.score.toString(), W / 2, 30);

      if (!g.running && started) {
        ctx.fillStyle = 'rgba(6,10,20,0.7)'; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#ff6b6b'; ctx.font = '18px "JetBrains Mono", monospace'; ctx.textAlign = 'center';
        ctx.fillText('CRASH', W / 2, H / 2 - 10);
        ctx.fillStyle = '#8892a8'; ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillText(`Score: ${g.score}`, W / 2, H / 2 + 15);
        ctx.fillText('Click to retry', W / 2, H / 2 + 35);
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('keydown', handleKey); canvas.removeEventListener('click', flap); };
  }, [started, start]);

  return <canvas ref={canvasRef} width={W} height={H} style={{ width: '100%', maxWidth: 300, height: 'auto', borderRadius: 8, cursor: 'pointer', display: 'block' }} />;
};

export default FlappyRocket;
