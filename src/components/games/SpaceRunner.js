import React, { useRef, useEffect, useState, useCallback } from 'react';

const SpaceRunner = () => {
  const canvasRef = useRef(null);
  const gameRef = useRef({});
  const [, setScore] = useState(0);
  const [, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [highScore, setHighScore] = useState(0);

  const resetGame = useCallback(() => {
    const g = gameRef.current;
    g.player = { x: 60, y: 150, vy: 0, width: 20, height: 20, grounded: true };
    g.obstacles = [];
    g.stars = [];
    g.particles = [];
    g.frameCount = 0;
    g.speed = 3;
    g.score = 0;
    g.groundY = 180;
    g.running = true;

    for (let i = 0; i < 30; i++) {
      g.stars.push({ x: Math.random() * 400, y: Math.random() * 140, size: Math.random() * 1.5 + 0.5, twinkle: Math.random() * Math.PI * 2 });
    }
  }, []);

  const startGame = useCallback(() => {
    resetGame();
    setScore(0);
    setGameOver(false);
    setStarted(true);
  }, [resetGame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;

    const handleKey = (e) => {
      if ((e.code === 'Space' || e.code === 'ArrowUp') && started) {
        e.preventDefault();
        const g = gameRef.current;
        if (!g.running) { startGame(); return; }
        if (g.player.grounded) {
          g.player.vy = -8;
          g.player.grounded = false;
          for (let i = 0; i < 5; i++) {
            g.particles.push({
              x: g.player.x + 10, y: g.groundY,
              vx: (Math.random() - 0.5) * 3, vy: -Math.random() * 3,
              life: 20, color: `rgba(100, 200, 255, ${Math.random() * 0.8 + 0.2})`
            });
          }
        }
      }
    };

    const handleClick = () => {
      if (!started) { startGame(); return; }
      const g = gameRef.current;
      if (!g.running) { startGame(); return; }
      if (g.player.grounded) {
        g.player.vy = -8;
        g.player.grounded = false;
      }
    };

    window.addEventListener('keydown', handleKey);
    canvas.addEventListener('click', handleClick);

    const draw = () => {
      const g = gameRef.current;
      ctx.clearRect(0, 0, 400, 200);

      // background gradient
      const grad = ctx.createLinearGradient(0, 0, 0, 200);
      grad.addColorStop(0, '#060a14');
      grad.addColorStop(1, '#0a0e17');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 400, 200);

      if (!started) {
        ctx.fillStyle = '#64c8ff';
        ctx.font = '16px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SPACE RUNNER', 200, 80);
        ctx.fillStyle = '#8892a8';
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillText('Click or press Space to start', 200, 110);
        ctx.fillText('Jump over asteroids!', 200, 130);
        animId = requestAnimationFrame(draw);
        return;
      }

      // stars
      g.stars.forEach(s => {
        s.twinkle += 0.03;
        s.x -= g.speed * 0.3;
        if (s.x < 0) s.x = 400;
        const alpha = 0.3 + Math.sin(s.twinkle) * 0.3;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 220, 255, ${alpha})`;
        ctx.fill();
      });

      // ground line
      ctx.strokeStyle = 'rgba(100, 200, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, g.groundY);
      ctx.lineTo(400, g.groundY);
      ctx.stroke();

      // grid lines on ground
      ctx.strokeStyle = 'rgba(100, 200, 255, 0.05)';
      for (let i = 0; i < 20; i++) {
        const gx = ((i * 30) - (g.frameCount * g.speed) % 30);
        ctx.beginPath();
        ctx.moveTo(gx, g.groundY);
        ctx.lineTo(gx + 10, 200);
        ctx.stroke();
      }

      if (g.running) {
        // physics
        g.player.vy += 0.45;
        g.player.y += g.player.vy;
        if (g.player.y >= g.groundY - g.player.height) {
          g.player.y = g.groundY - g.player.height;
          g.player.vy = 0;
          g.player.grounded = true;
        }

        // spawn obstacles
        g.frameCount++;
        if (g.frameCount % Math.max(45, 90 - Math.floor(g.score / 5)) === 0) {
          const h = 15 + Math.random() * 20;
          g.obstacles.push({ x: 410, y: g.groundY - h, width: 15 + Math.random() * 10, height: h, passed: false });
        }

        // move obstacles
        g.obstacles.forEach(o => {
          o.x -= g.speed;
          if (!o.passed && o.x + o.width < g.player.x) {
            o.passed = true;
            g.score++;
            setScore(g.score);
          }
        });
        g.obstacles = g.obstacles.filter(o => o.x > -30);

        // collision
        const p = g.player;
        for (const o of g.obstacles) {
          if (p.x + p.width - 4 > o.x && p.x + 4 < o.x + o.width &&
              p.y + p.height - 2 > o.y && p.y + 2 < o.y + o.height) {
            g.running = false;
            setGameOver(true);
            setHighScore(prev => Math.max(prev, g.score));
            for (let i = 0; i < 15; i++) {
              g.particles.push({
                x: p.x + 10, y: p.y + 10,
                vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 0.5) * 6,
                life: 30, color: `rgba(100, 200, 255, ${Math.random()})`
              });
            }
            break;
          }
        }

        g.speed = 3 + g.score * 0.08;
      }

      // draw player (spaceship)
      const p = g.player;
      ctx.save();
      ctx.shadowColor = '#64c8ff';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#64c8ff';
      ctx.beginPath();
      ctx.moveTo(p.x + p.width, p.y + p.height / 2);
      ctx.lineTo(p.x, p.y);
      ctx.lineTo(p.x + 5, p.y + p.height / 2);
      ctx.lineTo(p.x, p.y + p.height);
      ctx.closePath();
      ctx.fill();
      // engine glow
      if (g.running && !p.grounded) {
        ctx.fillStyle = `rgba(100, 200, 255, ${0.3 + Math.random() * 0.4})`;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y + 5);
        ctx.lineTo(p.x - 8 - Math.random() * 6, p.y + p.height / 2);
        ctx.lineTo(p.x, p.y + p.height - 5);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // draw obstacles (asteroids)
      g.obstacles.forEach(o => {
        ctx.save();
        ctx.shadowColor = '#ff6b6b';
        ctx.shadowBlur = 5;
        ctx.fillStyle = '#515c72';
        ctx.strokeStyle = 'rgba(255, 107, 107, 0.5)';
        ctx.lineWidth = 1;
        const cx = o.x + o.width / 2;
        const cy = o.y + o.height / 2;
        const rx = o.width / 2;
        const ry = o.height / 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // crater
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.arc(cx - 2, cy - 2, rx * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // particles
      g.particles.forEach(pt => {
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life--;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = pt.color;
        ctx.fill();
      });
      g.particles = g.particles.filter(pt => pt.life > 0);

      // score
      ctx.fillStyle = 'rgba(100, 200, 255, 0.8)';
      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`Score: ${g.score}`, 390, 20);
      if (highScore > 0) {
        ctx.fillStyle = 'rgba(100, 200, 255, 0.4)';
        ctx.fillText(`Best: ${highScore}`, 390, 35);
      }

      if (!g.running) {
        ctx.fillStyle = 'rgba(10, 14, 23, 0.7)';
        ctx.fillRect(0, 0, 400, 200);
        ctx.fillStyle = '#ff6b6b';
        ctx.font = '18px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', 200, 85);
        ctx.fillStyle = '#8892a8';
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillText(`Score: ${g.score}`, 200, 110);
        ctx.fillText('Click or press Space to retry', 200, 135);
      }

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKey);
      canvas.removeEventListener('click', handleClick);
    };
  }, [started, startGame, highScore]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={200}
      style={{ width: '100%', maxWidth: 400, height: 'auto', borderRadius: 8, cursor: 'pointer', display: 'block' }}
    />
  );
};

export default SpaceRunner;
