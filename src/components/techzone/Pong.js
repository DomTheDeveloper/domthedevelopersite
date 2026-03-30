import React, { useRef, useEffect, useState, useCallback } from 'react';

const Pong = () => {
  const canvasRef = useRef(null);
  const gameRef = useRef({});
  const [, setPlayerScore] = useState(0);
  const [, setAiScore] = useState(0);
  const [started, setStarted] = useState(false);

  const resetBall = useCallback((g) => {
    g.ball = { x: 200, y: 100, vx: (Math.random() > 0.5 ? 1 : -1) * 3, vy: (Math.random() - 0.5) * 4, size: 5 };
    g.trail = [];
  }, []);

  const startGame = useCallback(() => {
    const g = gameRef.current;
    g.playerPaddle = { x: 15, y: 70, width: 8, height: 60 };
    g.aiPaddle = { x: 377, y: 70, width: 8, height: 60 };
    g.playerScore = 0;
    g.aiScore = 0;
    g.trail = [];
    g.particles = [];
    resetBall(g);
    setPlayerScore(0);
    setAiScore(0);
    setStarted(true);
  }, [resetBall]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;

    const handleMove = (e) => {
      if (!started) return;
      const rect = canvas.getBoundingClientRect();
      const scaleY = 200 / rect.height;
      const y = (e.clientY - rect.top) * scaleY;
      gameRef.current.playerPaddle.y = Math.max(0, Math.min(140, y - 30));
    };

    const handleTouch = (e) => {
      if (!started) return;
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const scaleY = 200 / rect.height;
      const y = (e.touches[0].clientY - rect.top) * scaleY;
      gameRef.current.playerPaddle.y = Math.max(0, Math.min(140, y - 30));
    };

    const handleClick = () => { if (!started) startGame(); };

    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('touchmove', handleTouch, { passive: false });
    canvas.addEventListener('click', handleClick);

    const draw = () => {
      const g = gameRef.current;
      ctx.clearRect(0, 0, 400, 200);

      const grad = ctx.createLinearGradient(0, 0, 0, 200);
      grad.addColorStop(0, '#060a14');
      grad.addColorStop(1, '#0a0e17');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 400, 200);

      if (!started) {
        ctx.fillStyle = '#64c8ff';
        ctx.font = '16px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('NEON PONG', 200, 80);
        ctx.fillStyle = '#8892a8';
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillText('Click to start, move mouse to play', 200, 110);
        animId = requestAnimationFrame(draw);
        return;
      }

      // center line
      ctx.setLineDash([4, 8]);
      ctx.strokeStyle = 'rgba(100, 200, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(200, 0);
      ctx.lineTo(200, 200);
      ctx.stroke();
      ctx.setLineDash([]);

      // ball physics
      const b = g.ball;
      b.x += b.vx;
      b.y += b.vy;

      if (b.y <= b.size || b.y >= 200 - b.size) b.vy *= -1;

      // paddle collision
      const pp = g.playerPaddle;
      const ap = g.aiPaddle;

      if (b.x - b.size <= pp.x + pp.width && b.y >= pp.y && b.y <= pp.y + pp.height && b.vx < 0) {
        b.vx = Math.abs(b.vx) * 1.05;
        b.vy += (b.y - (pp.y + pp.height / 2)) * 0.15;
        for (let i = 0; i < 8; i++) {
          g.particles.push({ x: b.x, y: b.y, vx: Math.random() * 3, vy: (Math.random() - 0.5) * 4, life: 15, color: '#64c8ff' });
        }
      }

      if (b.x + b.size >= ap.x && b.y >= ap.y && b.y <= ap.y + ap.height && b.vx > 0) {
        b.vx = -Math.abs(b.vx) * 1.05;
        b.vy += (b.y - (ap.y + ap.height / 2)) * 0.15;
        for (let i = 0; i < 8; i++) {
          g.particles.push({ x: b.x, y: b.y, vx: -Math.random() * 3, vy: (Math.random() - 0.5) * 4, life: 15, color: '#ff6b6b' });
        }
      }

      // scoring
      if (b.x < 0) {
        g.aiScore++;
        setAiScore(g.aiScore);
        resetBall(g);
      }
      if (b.x > 400) {
        g.playerScore++;
        setPlayerScore(g.playerScore);
        resetBall(g);
      }

      // AI
      const aiTarget = b.y - ap.height / 2;
      const aiSpeed = 2.5;
      if (ap.y < aiTarget - 5) ap.y += aiSpeed;
      else if (ap.y > aiTarget + 5) ap.y -= aiSpeed;
      ap.y = Math.max(0, Math.min(140, ap.y));

      // ball trail
      g.trail.push({ x: b.x, y: b.y });
      if (g.trail.length > 12) g.trail.shift();

      g.trail.forEach((t, i) => {
        const alpha = (i / g.trail.length) * 0.4;
        ctx.beginPath();
        ctx.arc(t.x, t.y, b.size * (i / g.trail.length), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100, 200, 255, ${alpha})`;
        ctx.fill();
      });

      // draw ball
      ctx.save();
      ctx.shadowColor = '#64c8ff';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.restore();

      // draw paddles
      ctx.save();
      ctx.shadowColor = '#64c8ff';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#64c8ff';
      ctx.fillRect(pp.x, pp.y, pp.width, pp.height);
      ctx.restore();

      ctx.save();
      ctx.shadowColor = '#ff6b6b';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#ff6b6b';
      ctx.fillRect(ap.x, ap.y, ap.width, ap.height);
      ctx.restore();

      // particles
      g.particles.forEach(pt => {
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life--;
        const alpha = pt.life / 15;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = pt.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
        ctx.fill();
      });
      g.particles = g.particles.filter(pt => pt.life > 0);

      // scores
      ctx.fillStyle = 'rgba(100, 200, 255, 0.4)';
      ctx.font = '28px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(g.playerScore, 150, 40);
      ctx.fillStyle = 'rgba(255, 107, 107, 0.4)';
      ctx.fillText(g.aiScore, 250, 40);

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('mousemove', handleMove);
      canvas.removeEventListener('touchmove', handleTouch);
      canvas.removeEventListener('click', handleClick);
    };
  }, [started, startGame, resetBall]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={200}
      style={{ width: '100%', maxWidth: 400, height: 'auto', borderRadius: 8, cursor: 'pointer', display: 'block' }}
    />
  );
};

export default Pong;
