import React, { useRef, useEffect, useState, useCallback } from 'react';

const FlappyRocket = () => {
  const canvasRef = useRef(null);
  const gameRef = useRef({});
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const W = 300, H = 400;

  const reset = useCallback(() => {
    const g = gameRef.current;
    g.bird = { y: H / 2, vy: 0 };
    g.pipes = [];
    g.frame = 0;
    g.score = 0;
    g.running = true;
    g.scorePopups = [];
    g.particles = [];
    // Parallax star layers: far, mid, near
    g.starLayers = [
      Array.from({ length: 40 }, () => ({ x: Math.random() * W, y: Math.random() * H, s: 0.4 + Math.random() * 0.4, speed: 0.2 })),
      Array.from({ length: 25 }, () => ({ x: Math.random() * W, y: Math.random() * H, s: 0.6 + Math.random() * 0.5, speed: 0.6 })),
      Array.from({ length: 12 }, () => ({ x: Math.random() * W, y: Math.random() * H, s: 1.0 + Math.random() * 0.6, speed: 1.2 })),
    ];
  }, []);

  const start = useCallback(() => { reset(); setStarted(true); setGameOver(false); }, [reset]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;

    let lastTouchTime = 0;
    const flap = (fromTouch) => {
      if (fromTouch) lastTouchTime = Date.now();
      if (!started) { start(); return; }
      const g = gameRef.current;
      if (!g.running) return;
      g.bird.vy = -5.2;
    };

    const handleKey = (e) => { if (e.code === 'Space') { e.preventDefault(); flap(false); } };
    const handleTouch = (e) => { e.preventDefault(); flap(true); };
    const handleClick = () => { if (Date.now() - lastTouchTime > 300) flap(false); };
    window.addEventListener('keydown', handleKey);
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('touchstart', handleTouch, { passive: false });

    const draw = () => {
      const g = gameRef.current;
      ctx.fillStyle = '#060a14';
      ctx.fillRect(0, 0, W, H);

      if (!started) {
        // Draw ambient stars on start screen
        for (let i = 0; i < 30; i++) {
          const sx = (i * 137.5 + 50) % W;
          const sy = (i * 73.3 + 20) % H;
          const alpha = 0.2 + Math.sin(Date.now() * 0.002 + i) * 0.15;
          ctx.beginPath(); ctx.arc(sx, sy, 0.7, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(200,220,255,${alpha})`; ctx.fill();
        }
        ctx.fillStyle = '#64c8ff'; ctx.font = '18px "JetBrains Mono", monospace'; ctx.textAlign = 'center';
        ctx.fillText('FLAPPY ROCKET', W / 2, H / 2 - 30);
        // Rocket icon
        ctx.save(); ctx.shadowColor = '#64c8ff'; ctx.shadowBlur = 15;
        ctx.fillStyle = '#64c8ff'; ctx.beginPath();
        ctx.moveTo(W / 2 + 15, H / 2 + 10); ctx.lineTo(W / 2 - 10, H / 2 + 2); ctx.lineTo(W / 2 - 10, H / 2 + 18);
        ctx.closePath(); ctx.fill(); ctx.restore();
        ctx.fillStyle = '#8892a8'; ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillText('Tap or press Space to fly', W / 2, H / 2 + 45);
        animId = requestAnimationFrame(draw); return;
      }

      // Parallax star layers
      const layerAlphas = [0.15, 0.3, 0.55];
      g.starLayers.forEach((layer, li) => {
        layer.forEach(s => {
          s.x -= s.speed;
          if (s.x < -2) { s.x = W + 2; s.y = Math.random() * H; }
          ctx.beginPath(); ctx.arc(s.x, s.y, s.s * 0.7, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(200,220,255,${layerAlphas[li]})`; ctx.fill();
        });
      });

      if (g.running) {
        g.frame++;
        // Smooth gravity
        g.bird.vy += 0.26;
        g.bird.vy = Math.max(-6, Math.min(g.bird.vy, 8));
        g.bird.y += g.bird.vy;

        if (g.frame % 90 === 0) {
          const gap = 105;
          const gapY = 65 + Math.random() * (H - 175);
          g.pipes.push({ x: W, gapY, gap, passed: false });
        }

        g.pipes.forEach(p => {
          p.x -= 2;
          if (!p.passed && p.x + 30 < 50) {
            p.passed = true;
            g.score++;
            // Score popup
            g.scorePopups.push({ x: p.x + 15, y: p.gapY + p.gap / 2, text: `+1`, life: 40, startLife: 40 });
          }
        });
        g.pipes = g.pipes.filter(p => p.x > -40);

        // Particle trail behind rocket
        if (g.frame % 2 === 0) {
          const spread = g.bird.vy < 0 ? 3 : 1.5;
          for (let i = 0; i < 3; i++) {
            g.particles.push({
              x: 38 + (Math.random() - 0.5) * 4,
              y: g.bird.y + (Math.random() - 0.5) * 6,
              vx: -1.5 - Math.random() * 1.5,
              vy: (Math.random() - 0.5) * spread,
              life: 18 + Math.random() * 10,
              startLife: 28,
              type: g.bird.vy < 0 ? 'thrust' : 'idle',
            });
          }
        }

        // Collision
        if (g.bird.y < 0 || g.bird.y > H) { g.running = false; setGameOver(true); }
        g.pipes.forEach(p => {
          if (50 + 10 > p.x && 50 - 10 < p.x + 30) {
            if (g.bird.y - 9 < p.gapY || g.bird.y + 9 > p.gapY + p.gap) { g.running = false; setGameOver(true); }
          }
        });
      }

      // Particles
      g.particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.life--;
        const t = p.life / p.startLife;
        const size = t * 2.5;
        if (p.type === 'thrust') {
          const r = 255, gr = Math.floor(100 + t * 120), b = Math.floor(30 + t * 20);
          ctx.fillStyle = `rgba(${r},${gr},${b},${t * 0.7})`;
        } else {
          ctx.fillStyle = `rgba(100,200,255,${t * 0.3})`;
        }
        ctx.beginPath(); ctx.arc(p.x, p.y, size, 0, Math.PI * 2); ctx.fill();
      });
      g.particles = g.particles.filter(p => p.life > 0);

      // Pipes with gradient
      g.pipes.forEach(p => {
        // Top pipe
        const topGrad = ctx.createLinearGradient(p.x, 0, p.x + 30, 0);
        topGrad.addColorStop(0, 'rgba(30,80,120,0.35)');
        topGrad.addColorStop(0.5, 'rgba(60,140,200,0.2)');
        topGrad.addColorStop(1, 'rgba(30,80,120,0.35)');
        ctx.fillStyle = topGrad;
        ctx.fillRect(p.x, 0, 30, p.gapY);
        // Top pipe edge glow
        ctx.strokeStyle = 'rgba(100,200,255,0.4)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(p.x, 0, 30, p.gapY);
        // Top pipe cap
        ctx.fillStyle = 'rgba(100,200,255,0.15)';
        ctx.fillRect(p.x - 3, p.gapY - 6, 36, 6);
        ctx.strokeStyle = 'rgba(100,200,255,0.5)';
        ctx.strokeRect(p.x - 3, p.gapY - 6, 36, 6);

        // Bottom pipe
        const botGrad = ctx.createLinearGradient(p.x, 0, p.x + 30, 0);
        botGrad.addColorStop(0, 'rgba(30,80,120,0.35)');
        botGrad.addColorStop(0.5, 'rgba(60,140,200,0.2)');
        botGrad.addColorStop(1, 'rgba(30,80,120,0.35)');
        ctx.fillStyle = botGrad;
        const botTop = p.gapY + p.gap;
        ctx.fillRect(p.x, botTop, 30, H - botTop);
        ctx.strokeStyle = 'rgba(100,200,255,0.4)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(p.x, botTop, 30, H - botTop);
        // Bottom pipe cap
        ctx.fillStyle = 'rgba(100,200,255,0.15)';
        ctx.fillRect(p.x - 3, botTop, 36, 6);
        ctx.strokeStyle = 'rgba(100,200,255,0.5)';
        ctx.strokeRect(p.x - 3, botTop, 36, 6);

        // Inner glow lines
        ctx.strokeStyle = 'rgba(100,200,255,0.08)';
        ctx.lineWidth = 0.5;
        for (let lx = p.x + 6; lx < p.x + 30; lx += 8) {
          ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx, p.gapY - 6); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(lx, botTop + 6); ctx.lineTo(lx, H); ctx.stroke();
        }
      });

      // Rocket
      ctx.save();
      ctx.shadowColor = '#64c8ff'; ctx.shadowBlur = 14;
      // Body
      ctx.fillStyle = '#64c8ff'; ctx.beginPath();
      ctx.moveTo(62, g.bird.y);
      ctx.lineTo(44, g.bird.y - 9);
      ctx.lineTo(38, g.bird.y - 7);
      ctx.lineTo(38, g.bird.y + 7);
      ctx.lineTo(44, g.bird.y + 9);
      ctx.closePath(); ctx.fill();
      // Window
      ctx.fillStyle = 'rgba(200,240,255,0.8)';
      ctx.beginPath(); ctx.arc(50, g.bird.y, 3, 0, Math.PI * 2); ctx.fill();
      // Fins
      ctx.fillStyle = 'rgba(100,200,255,0.6)';
      ctx.beginPath(); ctx.moveTo(40, g.bird.y - 8); ctx.lineTo(36, g.bird.y - 14); ctx.lineTo(38, g.bird.y - 6); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(40, g.bird.y + 8); ctx.lineTo(36, g.bird.y + 14); ctx.lineTo(38, g.bird.y + 6); ctx.closePath(); ctx.fill();

      // Flame
      if (g.bird.vy < 0) {
        const flameLen = 8 + Math.random() * 8;
        const flameGrad = ctx.createLinearGradient(38, g.bird.y, 38 - flameLen, g.bird.y);
        flameGrad.addColorStop(0, 'rgba(255,200,80,0.9)');
        flameGrad.addColorStop(0.5, 'rgba(255,120,20,0.6)');
        flameGrad.addColorStop(1, 'rgba(255,60,20,0)');
        ctx.fillStyle = flameGrad;
        ctx.beginPath();
        ctx.moveTo(38, g.bird.y - 5);
        ctx.lineTo(38 - flameLen, g.bird.y + (Math.random() - 0.5) * 3);
        ctx.lineTo(38, g.bird.y + 5);
        ctx.closePath(); ctx.fill();
        // Inner bright flame
        ctx.fillStyle = `rgba(255,255,200,${0.4 + Math.random() * 0.3})`;
        ctx.beginPath();
        ctx.moveTo(38, g.bird.y - 2.5);
        ctx.lineTo(38 - flameLen * 0.5, g.bird.y);
        ctx.lineTo(38, g.bird.y + 2.5);
        ctx.closePath(); ctx.fill();
      }
      ctx.restore();

      // Score popups
      g.scorePopups.forEach(sp => {
        sp.life--;
        const t = sp.life / sp.startLife;
        ctx.save();
        ctx.globalAlpha = t;
        ctx.fillStyle = '#64c8ff';
        ctx.font = `bold ${12 + (1 - t) * 6}px "JetBrains Mono", monospace`;
        ctx.textAlign = 'center';
        ctx.fillText(sp.text, sp.x, sp.y - (1 - t) * 25);
        ctx.restore();
      });
      g.scorePopups = g.scorePopups.filter(sp => sp.life > 0);

      // Score display
      ctx.save();
      ctx.shadowColor = '#64c8ff'; ctx.shadowBlur = 8;
      ctx.fillStyle = 'rgba(100,200,255,0.9)'; ctx.font = 'bold 16px "JetBrains Mono", monospace'; ctx.textAlign = 'center';
      ctx.fillText(g.score.toString(), W / 2, 30);
      ctx.restore();

      if (!g.running && started) {
        ctx.fillStyle = 'rgba(6,10,20,0.75)'; ctx.fillRect(0, 0, W, H);
        ctx.save(); ctx.shadowColor = '#ff6b6b'; ctx.shadowBlur = 15;
        ctx.fillStyle = '#ff6b6b'; ctx.font = 'bold 22px "JetBrains Mono", monospace'; ctx.textAlign = 'center';
        ctx.fillText('CRASH', W / 2, H / 2 - 15);
        ctx.restore();
        ctx.fillStyle = '#c8d0e0'; ctx.font = '13px "JetBrains Mono", monospace';
        ctx.fillText(`Score: ${g.score}`, W / 2, H / 2 + 12);
        ctx.fillStyle = '#8892a8'; ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillText('Press Retry to play again', W / 2, H / 2 + 35);
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKey);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('touchstart', handleTouch);
    };
  }, [started, start]);

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 300 }}>
      <canvas ref={canvasRef} width={W} height={H} style={{ width: '100%', maxWidth: 300, height: 'auto', borderRadius: 8, cursor: 'pointer', display: 'block', touchAction: 'none' }} />
      {gameOver && (
        <button onClick={start} className="constellation-clear" style={{ position: 'absolute', left: '50%', bottom: '30%', transform: 'translateX(-50%)' }}>
          Retry
        </button>
      )}
    </div>
  );
};

export default FlappyRocket;
