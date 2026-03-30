import React, { useRef, useEffect, useState, useCallback } from 'react';

const AsteroidShooter = () => {
  const canvasRef = useRef(null);
  const gameRef = useRef({});
  const [started, setStarted] = useState(false);

  const W = 400, H = 300;

  const reset = useCallback(() => {
    const g = gameRef.current;
    g.ship = { x: W / 2, y: H - 30, w: 20 };
    g.bullets = [];
    g.asteroids = [];
    g.particles = [];
    g.score = 0;
    g.running = true;
    g.frame = 0;
    g.mouseX = W / 2;
  }, []);

  const start = useCallback(() => { reset(); setStarted(true); }, [reset]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;

    const handleMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      gameRef.current.mouseX = (e.clientX - rect.left) * (W / rect.width);
    };

    const handleClick = () => {
      if (!started) { start(); return; }
      const g = gameRef.current;
      if (!g.running) { start(); return; }
      g.bullets.push({ x: g.ship.x, y: g.ship.y - 10, vy: -6 });
    };

    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('click', handleClick);

    const draw = () => {
      const g = gameRef.current;
      ctx.fillStyle = '#060a14';
      ctx.fillRect(0, 0, W, H);

      if (!started) {
        ctx.fillStyle = '#64c8ff'; ctx.font = '16px "JetBrains Mono", monospace'; ctx.textAlign = 'center';
        ctx.fillText('ASTEROID SHOOTER', W / 2, H / 2 - 15);
        ctx.fillStyle = '#8892a8'; ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillText('Click to shoot. Move mouse to aim.', W / 2, H / 2 + 15);
        animId = requestAnimationFrame(draw); return;
      }

      if (g.running) {
        g.frame++;
        g.ship.x += (g.mouseX - g.ship.x) * 0.15;

        if (g.frame % Math.max(20, 50 - Math.floor(g.score / 3)) === 0) {
          g.asteroids.push({ x: Math.random() * W, y: -20, vy: 1.5 + Math.random() * 2, r: 8 + Math.random() * 12, rot: 0, rotSpeed: (Math.random() - 0.5) * 0.05 });
        }

        g.bullets.forEach(b => b.y += b.vy);
        g.bullets = g.bullets.filter(b => b.y > -10);

        g.asteroids.forEach(a => { a.y += a.vy; a.rot += a.rotSpeed; });

        // collision bullet-asteroid
        g.bullets.forEach(b => {
          g.asteroids.forEach(a => {
            const dx = b.x - a.x, dy = b.y - a.y;
            if (Math.sqrt(dx * dx + dy * dy) < a.r) {
              a.hit = true; b.hit = true; g.score++;
              for (let i = 0; i < 8; i++) g.particles.push({ x: a.x, y: a.y, vx: (Math.random() - 0.5) * 5, vy: (Math.random() - 0.5) * 5, life: 20, color: '#ff6b6b' });
            }
          });
        });
        g.bullets = g.bullets.filter(b => !b.hit);
        g.asteroids = g.asteroids.filter(a => !a.hit && a.y < H + 30);

        // collision ship-asteroid
        g.asteroids.forEach(a => {
          const dx = g.ship.x - a.x, dy = g.ship.y - a.y;
          if (Math.sqrt(dx * dx + dy * dy) < a.r + 10) {
            g.running = false;
            for (let i = 0; i < 15; i++) g.particles.push({ x: g.ship.x, y: g.ship.y, vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6, life: 25, color: '#64c8ff' });
          }
        });
      }

      // draw ship
      ctx.save(); ctx.shadowColor = '#64c8ff'; ctx.shadowBlur = 10;
      ctx.fillStyle = '#64c8ff'; ctx.beginPath();
      ctx.moveTo(g.ship.x, g.ship.y - 12); ctx.lineTo(g.ship.x - 10, g.ship.y + 8); ctx.lineTo(g.ship.x + 10, g.ship.y + 8);
      ctx.closePath(); ctx.fill(); ctx.restore();

      // bullets
      g.bullets.forEach(b => { ctx.save(); ctx.shadowColor = '#64c8ff'; ctx.shadowBlur = 6; ctx.fillStyle = '#64c8ff'; ctx.fillRect(b.x - 1, b.y, 2, 8); ctx.restore(); });

      // asteroids
      g.asteroids.forEach(a => {
        ctx.save(); ctx.translate(a.x, a.y); ctx.rotate(a.rot);
        ctx.fillStyle = '#515c72'; ctx.strokeStyle = 'rgba(255,107,107,0.4)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(0, 0, a.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.arc(-a.r * 0.2, -a.r * 0.2, a.r * 0.25, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      });

      // particles
      g.particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.life--; ctx.globalAlpha = p.life / 25; ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2); ctx.fillStyle = p.color; ctx.fill(); });
      ctx.globalAlpha = 1;
      g.particles = g.particles.filter(p => p.life > 0);

      ctx.fillStyle = 'rgba(100,200,255,0.6)'; ctx.font = '12px "JetBrains Mono", monospace'; ctx.textAlign = 'right';
      ctx.fillText(`Score: ${g.score}`, W - 10, 18);

      if (!g.running && started) {
        ctx.fillStyle = 'rgba(6,10,20,0.7)'; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#ff6b6b'; ctx.font = '18px "JetBrains Mono", monospace'; ctx.textAlign = 'center';
        ctx.fillText('DESTROYED', W / 2, H / 2 - 10);
        ctx.fillStyle = '#8892a8'; ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillText(`Score: ${g.score} | Click to retry`, W / 2, H / 2 + 15);
      }

      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('mousemove', handleMove); canvas.removeEventListener('click', handleClick); };
  }, [started, start]);

  return <canvas ref={canvasRef} width={W} height={H} style={{ width: '100%', maxWidth: 400, height: 'auto', borderRadius: 8, cursor: 'crosshair', display: 'block' }} />;
};

export default AsteroidShooter;
