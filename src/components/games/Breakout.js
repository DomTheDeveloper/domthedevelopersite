import React, { useRef, useEffect, useState, useCallback } from 'react';

const Breakout = () => {
  const canvasRef = useRef(null);
  const gameRef = useRef({});
  const [started, setStarted] = useState(false);

  const W = 400, H = 300;

  const resetGame = useCallback(() => {
    const g = gameRef.current;
    g.paddle = { x: W / 2 - 30, y: H - 20, w: 60, h: 8 };
    g.ball = { x: W / 2, y: H - 35, vx: 3, vy: -3, r: 5 };
    g.bricks = [];
    g.score = 0;
    g.running = true;
    g.particles = [];
    const colors = ['#ff6b6b', '#febc2e', '#28c840', '#64c8ff', '#c084fc'];
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 8; c++) {
        g.bricks.push({ x: 10 + c * 48, y: 30 + r * 18, w: 44, h: 14, color: colors[r], alive: true });
      }
    }
  }, []);

  const start = useCallback(() => { resetGame(); setStarted(true); }, [resetGame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;

    const handleMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const sx = W / rect.width;
      gameRef.current.paddle.x = Math.max(0, Math.min(W - 60, (e.clientX - rect.left) * sx - 30));
    };

    const handleTouch = (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const sx = W / rect.width;
      gameRef.current.paddle.x = Math.max(0, Math.min(W - 60, (e.touches[0].clientX - rect.left) * sx - 30));
    };

    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('touchmove', handleTouch, { passive: false });
    canvas.addEventListener('click', () => { if (!started) start(); });

    const draw = () => {
      const g = gameRef.current;
      ctx.fillStyle = '#060a14';
      ctx.fillRect(0, 0, W, H);

      if (!started) {
        ctx.fillStyle = '#64c8ff';
        ctx.font = '16px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('BREAKOUT', W / 2, H / 2 - 15);
        ctx.fillStyle = '#8892a8';
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillText('Click to start. Move mouse to play.', W / 2, H / 2 + 15);
        animId = requestAnimationFrame(draw);
        return;
      }

      if (g.running) {
        const b = g.ball;
        b.x += b.vx; b.y += b.vy;

        if (b.x <= b.r || b.x >= W - b.r) b.vx *= -1;
        if (b.y <= b.r) b.vy *= -1;
        if (b.y >= H) { g.running = false; }

        const p = g.paddle;
        if (b.y + b.r >= p.y && b.x >= p.x && b.x <= p.x + p.w && b.vy > 0) {
          b.vy = -Math.abs(b.vy);
          b.vx += ((b.x - (p.x + p.w / 2)) / p.w) * 3;
        }

        g.bricks.forEach(br => {
          if (!br.alive) return;
          if (b.x + b.r > br.x && b.x - b.r < br.x + br.w && b.y + b.r > br.y && b.y - b.r < br.y + br.h) {
            br.alive = false;
            b.vy *= -1;
            g.score++;
            for (let i = 0; i < 6; i++) {
              g.particles.push({ x: br.x + br.w / 2, y: br.y + br.h / 2, vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4, life: 20, color: br.color });
            }
          }
        });

        if (g.bricks.every(b => !b.alive)) {
          g.running = false;
        }
      }

      // bricks
      const g2 = gameRef.current;
      g2.bricks.forEach(br => {
        if (!br.alive) return;
        ctx.fillStyle = br.color;
        ctx.fillRect(br.x, br.y, br.w, br.h);
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.strokeRect(br.x, br.y, br.w, br.h);
      });

      // paddle
      ctx.save();
      ctx.shadowColor = '#64c8ff';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#64c8ff';
      ctx.fillRect(g2.paddle.x, g2.paddle.y, g2.paddle.w, g2.paddle.h);
      ctx.restore();

      // ball
      ctx.save();
      ctx.shadowColor = '#fff';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(g2.ball.x, g2.ball.y, g2.ball.r, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.restore();

      // particles
      g2.particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.life--; ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2); ctx.fillStyle = p.color; ctx.globalAlpha = p.life / 20; ctx.fill(); ctx.globalAlpha = 1; });
      g2.particles = g2.particles.filter(p => p.life > 0);

      ctx.fillStyle = 'rgba(100,200,255,0.6)';
      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`Score: ${g2.score}`, W - 10, 18);

      if (!g2.running && started) {
        ctx.fillStyle = 'rgba(6,10,20,0.7)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = g2.bricks.every(b => !b.alive) ? '#28c840' : '#ff6b6b';
        ctx.font = '18px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(g2.bricks.every(b => !b.alive) ? 'YOU WIN!' : 'GAME OVER', W / 2, H / 2 - 10);
        ctx.fillStyle = '#8892a8';
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillText(`Score: ${g2.score}/40`, W / 2, H / 2 + 15);
      }

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => { cancelAnimationFrame(animId); canvas.removeEventListener('mousemove', handleMove); canvas.removeEventListener('touchmove', handleTouch); };
  }, [started, start]);

  return <canvas ref={canvasRef} width={W} height={H} style={{ width: '100%', maxWidth: 400, height: 'auto', borderRadius: 8, cursor: 'pointer', display: 'block' }} />;
};

export default Breakout;
