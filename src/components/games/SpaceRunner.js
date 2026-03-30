import React, { useRef, useEffect, useState, useCallback } from 'react';

const SpaceRunner = () => {
  const canvasRef = useRef(null);
  const gameRef = useRef({});
  const [, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [highScore, setHighScore] = useState(0);

  const W = 400, H = 200;

  const resetGame = useCallback(() => {
    const g = gameRef.current;
    g.player = { x: 60, y: 0, vy: 0, width: 24, height: 18, grounded: true, ducking: false };
    g.obstacles = [];
    g.coins = [];
    g.stars = [];
    g.particles = [];
    g.trailParticles = [];
    g.frameCount = 0;
    g.speed = 3;
    g.score = 0;
    g.groundY = 160;
    g.running = true;
    g.player.y = g.groundY - g.player.height;
    g.distance = 0;
    g.nextObstacle = 60;
    g.nextCoin = 40;

    for (let i = 0; i < 40; i++) {
      g.stars.push({ x: Math.random() * W, y: Math.random() * (g.groundY - 20), size: Math.random() * 1.5 + 0.3, twinkle: Math.random() * Math.PI * 2 });
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

    const jump = () => {
      const g = gameRef.current;
      if (!started || !g.running) return;
      if (g.player.grounded) {
        g.player.vy = -7.5;
        g.player.grounded = false;
        g.player.ducking = false;
        for (let i = 0; i < 6; i++) {
          g.trailParticles.push({
            x: g.player.x + 5, y: g.groundY,
            vx: (Math.random() - 0.5) * 2, vy: -Math.random() * 2.5,
            life: 15, maxLife: 15,
          });
        }
      }
    };

    const handleKey = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.key === 'w') { e.preventDefault(); jump(); }
    };

    // touch
    let touchStartY = 0;
    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchEnd = (e) => {
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (dy < -15) { jump(); } // swipe up = jump
      else { jump(); } // tap = jump
    };

    window.addEventListener('keydown', handleKey);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvas.addEventListener('touchend', handleTouchEnd);
    canvas.addEventListener('click', jump);

    const draw = () => {
      const g = gameRef.current;
      ctx.clearRect(0, 0, W, H);

      // bg
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#030611');
      grad.addColorStop(0.7, '#080e1a');
      grad.addColorStop(1, '#0a1020');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      if (!started) {
        ctx.fillStyle = '#64c8ff';
        ctx.font = 'bold 18px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SPACE RUNNER', W / 2, 75);
        ctx.fillStyle = '#8892a8';
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillText('Press Start to play', W / 2, 105);
        ctx.fillText('Jump over asteroids, collect energy', W / 2, 122);

        // draw idle ship
        ctx.save();
        ctx.shadowColor = '#64c8ff'; ctx.shadowBlur = 12;
        ctx.fillStyle = '#64c8ff';
        ctx.beginPath();
        ctx.moveTo(W / 2 + 15, 150); ctx.lineTo(W / 2 - 10, 142);
        ctx.lineTo(W / 2 - 5, 150); ctx.lineTo(W / 2 - 10, 158);
        ctx.closePath(); ctx.fill();
        ctx.restore();

        animId = requestAnimationFrame(draw);
        return;
      }

      // stars
      g.stars.forEach(s => {
        s.twinkle += 0.02;
        s.x -= g.speed * 0.2;
        if (s.x < -5) s.x = W + 5;
        const alpha = 0.15 + Math.sin(s.twinkle) * 0.15;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 220, 255, ${alpha})`;
        ctx.fill();
      });

      // ground
      ctx.strokeStyle = 'rgba(100, 200, 255, 0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, g.groundY); ctx.lineTo(W, g.groundY); ctx.stroke();

      // ground grid
      ctx.strokeStyle = 'rgba(100, 200, 255, 0.04)';
      for (let i = 0; i < 25; i++) {
        const gx = ((i * 25) - (g.frameCount * g.speed) % 25);
        ctx.beginPath(); ctx.moveTo(gx, g.groundY);
        ctx.lineTo(gx + 15, H); ctx.stroke();
      }
      // horizontal ground lines
      for (let i = 1; i <= 3; i++) {
        ctx.beginPath(); ctx.moveTo(0, g.groundY + i * 10);
        ctx.lineTo(W, g.groundY + i * 10); ctx.stroke();
      }

      if (g.running) {
        // physics
        g.player.vy += 0.4;
        g.player.y += g.player.vy;
        if (g.player.y >= g.groundY - g.player.height) {
          g.player.y = g.groundY - g.player.height;
          g.player.vy = 0;
          g.player.grounded = true;
        }

        g.frameCount++;
        g.distance++;
        g.speed = 3 + Math.floor(g.distance / 300) * 0.4;

        // spawn obstacles (varied)
        g.nextObstacle--;
        if (g.nextObstacle <= 0) {
          const types = ['asteroid', 'spike', 'double'];
          const type = types[Math.floor(Math.random() * types.length)];
          if (type === 'double' && g.distance > 500) {
            const h1 = 12 + Math.random() * 10;
            g.obstacles.push({ x: W + 10, y: g.groundY - h1, w: 14, h: h1, type: 'asteroid' });
            g.obstacles.push({ x: W + 35, y: g.groundY - h1 - 5, w: 12, h: h1 + 5, type: 'asteroid' });
          } else {
            const h = type === 'spike' ? 18 + Math.random() * 10 : 12 + Math.random() * 18;
            const w = type === 'spike' ? 10 : 12 + Math.random() * 10;
            g.obstacles.push({ x: W + 10, y: g.groundY - h, w, h, type });
          }
          g.nextObstacle = Math.max(35, 70 - Math.floor(g.distance / 200) * 3) + Math.floor(Math.random() * 25);
        }

        // spawn coins
        g.nextCoin--;
        if (g.nextCoin <= 0) {
          g.coins.push({ x: W + 10, y: g.groundY - 35 - Math.random() * 40, size: 5, pulse: Math.random() * Math.PI * 2 });
          g.nextCoin = 30 + Math.floor(Math.random() * 40);
        }

        // move obstacles
        g.obstacles.forEach(o => { o.x -= g.speed; });
        g.obstacles = g.obstacles.filter(o => o.x > -30);

        // move coins
        g.coins.forEach(c => { c.x -= g.speed; c.pulse += 0.08; });

        // coin collection
        g.coins = g.coins.filter(c => {
          const dx = (g.player.x + g.player.width / 2) - c.x;
          const dy = (g.player.y + g.player.height / 2) - c.y;
          if (Math.sqrt(dx * dx + dy * dy) < 18) {
            g.score += 5;
            setScore(g.score);
            for (let i = 0; i < 5; i++) {
              g.particles.push({ x: c.x, y: c.y, vx: (Math.random() - 0.5) * 3, vy: (Math.random() - 0.5) * 3, life: 15, maxLife: 15, color: '#febc2e' });
            }
            return false;
          }
          return c.x > -10;
        });

        // collision
        const p = g.player;
        for (const o of g.obstacles) {
          if (p.x + p.width - 3 > o.x && p.x + 3 < o.x + o.w &&
              p.y + p.height - 2 > o.y && p.y + 2 < o.y + o.h) {
            g.running = false;
            setGameOver(true);
            const finalScore = g.score + Math.floor(g.distance / 10);
            setHighScore(prev => Math.max(prev, finalScore));
            for (let i = 0; i < 20; i++) {
              g.particles.push({ x: p.x + 12, y: p.y + 9, vx: (Math.random() - 0.5) * 7, vy: (Math.random() - 0.5) * 7, life: 30, maxLife: 30, color: i % 2 === 0 ? '#64c8ff' : '#ff6b6b' });
            }
            break;
          }
        }

        // score from distance
        if (g.frameCount % 10 === 0) {
          g.score++;
          setScore(g.score);
        }
      }

      // engine trail particles
      if (g.running && !g.player.grounded) {
        g.trailParticles.push({
          x: g.player.x - 2, y: g.player.y + g.player.height / 2 + (Math.random() - 0.5) * 4,
          vx: -1 - Math.random(), vy: (Math.random() - 0.5) * 0.5,
          life: 10, maxLife: 10,
        });
      }

      // draw coins
      g.coins.forEach(c => {
        ctx.save();
        ctx.shadowColor = '#febc2e'; ctx.shadowBlur = 8;
        const s = c.size + Math.sin(c.pulse) * 1.5;
        ctx.fillStyle = '#febc2e';
        ctx.beginPath(); ctx.arc(c.x, c.y, s, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffd666';
        ctx.beginPath(); ctx.arc(c.x - 1, c.y - 1, s * 0.5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      });

      // draw obstacles
      g.obstacles.forEach(o => {
        ctx.save();
        if (o.type === 'spike') {
          ctx.shadowColor = '#ff6b6b'; ctx.shadowBlur = 6;
          ctx.fillStyle = '#3a2535';
          ctx.strokeStyle = 'rgba(255, 107, 107, 0.5)'; ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(o.x + o.w / 2, o.y);
          ctx.lineTo(o.x, o.y + o.h);
          ctx.lineTo(o.x + o.w, o.y + o.h);
          ctx.closePath();
          ctx.fill(); ctx.stroke();
        } else {
          ctx.shadowColor = '#ff6b6b'; ctx.shadowBlur = 5;
          const cx = o.x + o.w / 2, cy = o.y + o.h / 2;
          ctx.fillStyle = '#3a3545';
          ctx.strokeStyle = 'rgba(255, 107, 107, 0.4)'; ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.ellipse(cx, cy, o.w / 2, o.h / 2, 0, 0, Math.PI * 2);
          ctx.fill(); ctx.stroke();
          ctx.fillStyle = 'rgba(0,0,0,0.25)';
          ctx.beginPath(); ctx.arc(cx - o.w * 0.15, cy - o.h * 0.15, Math.min(o.w, o.h) * 0.18, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
      });

      // draw trail particles
      g.trailParticles.forEach(tp => {
        tp.x += tp.vx; tp.y += tp.vy; tp.life--;
        const a = tp.life / tp.maxLife;
        ctx.beginPath(); ctx.arc(tp.x, tp.y, 1.5 * a, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100, 200, 255, ${a * 0.5})`;
        ctx.fill();
      });
      g.trailParticles = g.trailParticles.filter(tp => tp.life > 0);

      // draw player (ship)
      const p = g.player;
      ctx.save();
      ctx.shadowColor = '#64c8ff'; ctx.shadowBlur = 12;
      ctx.fillStyle = '#64c8ff';
      ctx.beginPath();
      ctx.moveTo(p.x + p.width, p.y + p.height / 2);
      ctx.lineTo(p.x + 2, p.y);
      ctx.lineTo(p.x + 7, p.y + p.height / 2);
      ctx.lineTo(p.x + 2, p.y + p.height);
      ctx.closePath();
      ctx.fill();
      // cockpit
      ctx.fillStyle = '#a0e0ff';
      ctx.beginPath(); ctx.arc(p.x + p.width * 0.6, p.y + p.height / 2, 3, 0, Math.PI * 2); ctx.fill();
      // engine
      if (g.running && !p.grounded) {
        ctx.fillStyle = `rgba(100, 200, 255, ${0.3 + Math.random() * 0.4})`;
        ctx.beginPath();
        ctx.moveTo(p.x + 2, p.y + 4); ctx.lineTo(p.x - 6 - Math.random() * 8, p.y + p.height / 2); ctx.lineTo(p.x + 2, p.y + p.height - 4);
        ctx.closePath(); ctx.fill();
      }
      ctx.restore();

      // explosion particles
      g.particles.forEach(pt => {
        pt.x += pt.vx; pt.y += pt.vy; pt.vy += 0.05; pt.life--;
        const a = pt.life / pt.maxLife;
        ctx.beginPath(); ctx.arc(pt.x, pt.y, 2.5 * a, 0, Math.PI * 2);
        ctx.fillStyle = pt.color.includes('rgb') ? pt.color : pt.color;
        ctx.globalAlpha = a;
        ctx.fill();
        ctx.globalAlpha = 1;
      });
      g.particles = g.particles.filter(pt => pt.life > 0);

      // HUD
      ctx.fillStyle = 'rgba(100, 200, 255, 0.7)';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${g.score}`, W - 10, 18);
      if (highScore > 0) {
        ctx.fillStyle = 'rgba(100, 200, 255, 0.3)';
        ctx.fillText(`Best: ${highScore}`, W - 10, 32);
      }
      // speed indicator
      ctx.fillStyle = 'rgba(100, 200, 255, 0.3)';
      ctx.textAlign = 'left';
      ctx.fillText(`${g.speed.toFixed(1)}x`, 10, 18);

      if (!g.running) {
        ctx.fillStyle = 'rgba(5, 8, 15, 0.75)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#ff6b6b';
        ctx.font = 'bold 20px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', W / 2, 80);
        ctx.fillStyle = '#64c8ff';
        ctx.font = '13px "JetBrains Mono", monospace';
        ctx.fillText(`Score: ${g.score}`, W / 2, 108);
        ctx.fillStyle = '#8892a8';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillText('Press Retry to play again', W / 2, 135);
      }

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('keydown', handleKey);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('click', jump);
    };
  }, [started, startGame, highScore]);

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 400 }}>
      <canvas ref={canvasRef} width={W} height={H}
        style={{ width: '100%', maxWidth: 400, height: 'auto', borderRadius: 8, cursor: 'pointer', display: 'block', touchAction: 'none' }}
      />
      {!started && (
        <button onClick={startGame} className="constellation-clear" style={{ position: 'absolute', left: '50%', bottom: '35%', transform: 'translateX(-50%)' }}>
          Start
        </button>
      )}
      {gameOver && (
        <button onClick={startGame} className="constellation-clear" style={{ position: 'absolute', left: '50%', bottom: '25%', transform: 'translateX(-50%)' }}>
          Retry
        </button>
      )}
    </div>
  );
};

export default SpaceRunner;
