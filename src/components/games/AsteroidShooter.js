import React, { useRef, useEffect, useState, useCallback } from 'react';

const AsteroidShooter = () => {
  const canvasRef = useRef(null);
  const gameRef = useRef({});
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const W = 400, H = 300;

  const reset = useCallback(() => {
    const g = gameRef.current;
    g.ship = { x: W / 2, y: H - 30, w: 20 };
    g.bullets = [];
    g.asteroids = [];
    g.particles = [];
    g.powerups = [];
    g.score = 0;
    g.hp = 3;
    g.maxHp = 3;
    g.shield = 0;
    g.running = true;
    g.frame = 0;
    g.mouseX = W / 2;
    g.mouseDown = false;
    g.fireCooldown = 0;
    g.invincible = 0;
    g.touchId = null;
    g.stars = Array.from({ length: 50 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      s: 0.3 + Math.random() * 0.8, speed: 0.1 + Math.random() * 0.3,
    }));
  }, []);

  const start = useCallback(() => { reset(); setStarted(true); setGameOver(false); }, [reset]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;

    const getCanvasPos = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (clientX - rect.left) * (W / rect.width),
        y: (clientY - rect.top) * (H / rect.height),
      };
    };

    const shoot = () => {
      const g = gameRef.current;
      if (!g.running || g.fireCooldown > 0) return;
      g.bullets.push({ x: g.ship.x - 4, y: g.ship.y - 12, vy: -7 });
      g.bullets.push({ x: g.ship.x + 4, y: g.ship.y - 12, vy: -7 });
      g.fireCooldown = 8;
    };

    const handleMove = (e) => {
      const pos = getCanvasPos(e.clientX, e.clientY);
      gameRef.current.mouseX = pos.x;
    };

    const handleDown = (e) => {
      const g = gameRef.current;
      if (!started || !g.running) return;
      g.mouseDown = true;
      shoot();
    };

    const handleUp = () => { gameRef.current.mouseDown = false; };

    const handleTouchStart = (e) => {
      e.preventDefault();
      const g = gameRef.current;
      if (!started || !g.running) return;
      const touch = e.touches[0];
      const pos = getCanvasPos(touch.clientX, touch.clientY);
      g.mouseX = pos.x;
      g.touchId = touch.identifier;
      g.mouseDown = true;
      shoot();
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      const g = gameRef.current;
      for (let i = 0; i < e.touches.length; i++) {
        if (e.touches[i].identifier === g.touchId) {
          const pos = getCanvasPos(e.touches[i].clientX, e.touches[i].clientY);
          g.mouseX = pos.x;
        }
      }
    };

    const handleTouchEnd = (e) => {
      e.preventDefault();
      gameRef.current.mouseDown = false;
      gameRef.current.touchId = null;
    };

    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('mousedown', handleDown);
    canvas.addEventListener('mouseup', handleUp);
    canvas.addEventListener('mouseleave', handleUp);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    const spawnExplosion = (x, y, count, color, spread) => {
      const g = gameRef.current;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * spread;
        g.particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 15 + Math.random() * 15,
          startLife: 30,
          color,
          size: 1 + Math.random() * 2,
        });
      }
    };

    const spawnAsteroid = (x, y, r, vy) => {
      const g = gameRef.current;
      const verts = [];
      const numVerts = 7 + Math.floor(Math.random() * 4);
      for (let i = 0; i < numVerts; i++) {
        const angle = (i / numVerts) * Math.PI * 2;
        const dist = r * (0.7 + Math.random() * 0.3);
        verts.push({ angle, dist });
      }
      g.asteroids.push({
        x, y: y !== undefined ? y : -r - 10,
        vx: (Math.random() - 0.5) * 1.5,
        vy: vy !== undefined ? vy : 1 + Math.random() * 2,
        r, rot: 0, rotSpeed: (Math.random() - 0.5) * 0.04,
        verts, tier: r > 18 ? 2 : r > 10 ? 1 : 0,
      });
    };

    const draw = () => {
      const g = gameRef.current;
      ctx.fillStyle = '#060a14';
      ctx.fillRect(0, 0, W, H);

      if (!started) {
        // Ambient stars
        for (let i = 0; i < 40; i++) {
          const sx = (i * 97.3 + 30) % W;
          const sy = (i * 53.7 + 15) % H;
          const alpha = 0.15 + Math.sin(Date.now() * 0.002 + i) * 0.1;
          ctx.beginPath(); ctx.arc(sx, sy, 0.6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(200,220,255,${alpha})`; ctx.fill();
        }
        ctx.fillStyle = '#64c8ff'; ctx.font = 'bold 18px "JetBrains Mono", monospace'; ctx.textAlign = 'center';
        ctx.fillText('ASTEROID SHOOTER', W / 2, H / 2 - 20);
        ctx.fillStyle = '#8892a8'; ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillText('Press Start to play', W / 2, H / 2 + 10);
        animId = requestAnimationFrame(draw); return;
      }

      // Stars
      g.stars.forEach(s => {
        s.y += s.speed;
        if (s.y > H) { s.y = 0; s.x = Math.random() * W; }
        ctx.beginPath(); ctx.arc(s.x, s.y, s.s * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,220,255,0.2)`; ctx.fill();
      });

      if (g.running) {
        g.frame++;
        if (g.fireCooldown > 0) g.fireCooldown--;
        if (g.invincible > 0) g.invincible--;
        if (g.shield > 0) g.shield--;

        // Auto-fire
        if (g.mouseDown && g.fireCooldown <= 0) shoot();

        g.ship.x += (g.mouseX - g.ship.x) * 0.12;
        g.ship.x = Math.max(12, Math.min(W - 12, g.ship.x));

        // Spawn asteroids - mix of sizes
        const spawnRate = Math.max(15, 45 - Math.floor(g.score / 5));
        if (g.frame % spawnRate === 0) {
          const rand = Math.random();
          let r;
          if (rand < 0.25) r = 22 + Math.random() * 10;       // Large
          else if (rand < 0.6) r = 12 + Math.random() * 8;     // Medium
          else r = 6 + Math.random() * 5;                       // Small
          spawnAsteroid(Math.random() * W, undefined, r);
        }

        // Spawn shield powerup occasionally
        if (g.frame % 600 === 0 && g.shield <= 0) {
          g.powerups.push({ x: Math.random() * (W - 40) + 20, y: -15, vy: 1.2, type: 'shield' });
        }

        // Update powerups
        g.powerups.forEach(pw => { pw.y += pw.vy; });
        g.powerups = g.powerups.filter(pw => {
          if (pw.y > H + 20) return false;
          const dx = g.ship.x - pw.x, dy = g.ship.y - pw.y;
          if (Math.sqrt(dx * dx + dy * dy) < 20) {
            if (pw.type === 'shield') { g.shield = 300; spawnExplosion(pw.x, pw.y, 10, '#64c8ff', 3); }
            return false;
          }
          return true;
        });

        // Update bullets
        g.bullets.forEach(b => b.y += b.vy);
        g.bullets = g.bullets.filter(b => b.y > -10);

        // Update asteroids
        g.asteroids.forEach(a => { a.y += a.vy; a.x += a.vx; a.rot += a.rotSpeed; });

        // Collision bullet-asteroid
        g.bullets.forEach(b => {
          g.asteroids.forEach(a => {
            if (a.hit) return;
            const dx = b.x - a.x, dy = b.y - a.y;
            if (Math.sqrt(dx * dx + dy * dy) < a.r) {
              a.hit = true; b.hit = true; g.score++;
              spawnExplosion(a.x, a.y, 6 + a.r, a.tier >= 1 ? '#ff8844' : '#ff6b6b', 3);
              // Break large asteroids into smaller ones
              if (a.tier >= 2) {
                for (let i = 0; i < 3; i++) spawnAsteroid(a.x + (Math.random() - 0.5) * 10, a.y, 8 + Math.random() * 5, a.vy * 0.8 + (Math.random() - 0.5) * 1.5);
              } else if (a.tier >= 1) {
                for (let i = 0; i < 2; i++) spawnAsteroid(a.x + (Math.random() - 0.5) * 8, a.y, 4 + Math.random() * 3, a.vy * 0.7 + (Math.random() - 0.5) * 2);
              }
            }
          });
        });
        g.bullets = g.bullets.filter(b => !b.hit);
        g.asteroids = g.asteroids.filter(a => !a.hit && a.y < H + 40 && a.x > -40 && a.x < W + 40);

        // Collision ship-asteroid
        if (g.invincible <= 0) {
          g.asteroids.forEach(a => {
            const dx = g.ship.x - a.x, dy = g.ship.y - a.y;
            if (Math.sqrt(dx * dx + dy * dy) < a.r + (g.shield > 0 ? 16 : 10)) {
              if (g.shield > 0) {
                a.hit = true;
                spawnExplosion(a.x, a.y, 8, '#64c8ff', 3);
                g.asteroids = g.asteroids.filter(ast => !ast.hit);
              } else {
                g.hp--;
                g.invincible = 60;
                a.hit = true;
                spawnExplosion(g.ship.x, g.ship.y, 12, '#64c8ff', 4);
                g.asteroids = g.asteroids.filter(ast => !ast.hit);
                if (g.hp <= 0) {
                  g.running = false;
                  setGameOver(true);
                  spawnExplosion(g.ship.x, g.ship.y, 30, '#ff6b6b', 6);
                }
              }
            }
          });
        }
      }

      // Draw ship
      if (g.running || g.hp > 0) {
        ctx.save();
        if (g.invincible > 0 && Math.floor(g.invincible / 4) % 2 === 0) {
          ctx.globalAlpha = 0.4;
        }
        // Shield visual
        if (g.shield > 0) {
          ctx.save();
          ctx.strokeStyle = `rgba(100,200,255,${0.3 + Math.sin(Date.now() * 0.01) * 0.15})`;
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(g.ship.x, g.ship.y, 16, 0, Math.PI * 2); ctx.stroke();
          ctx.restore();
        }
        // Ship body
        ctx.save(); ctx.shadowColor = '#64c8ff'; ctx.shadowBlur = 12;
        ctx.fillStyle = '#64c8ff'; ctx.beginPath();
        ctx.moveTo(g.ship.x, g.ship.y - 14);
        ctx.lineTo(g.ship.x - 10, g.ship.y + 8);
        ctx.lineTo(g.ship.x - 4, g.ship.y + 5);
        ctx.lineTo(g.ship.x + 4, g.ship.y + 5);
        ctx.lineTo(g.ship.x + 10, g.ship.y + 8);
        ctx.closePath(); ctx.fill();
        // Cockpit
        ctx.fillStyle = 'rgba(200,240,255,0.7)';
        ctx.beginPath(); ctx.arc(g.ship.x, g.ship.y - 4, 3, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        // Engine glow
        ctx.fillStyle = `rgba(100,200,255,${0.3 + Math.random() * 0.2})`;
        ctx.beginPath(); ctx.arc(g.ship.x, g.ship.y + 8, 3 + Math.random() * 2, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }

      // Bullets
      g.bullets.forEach(b => {
        ctx.save(); ctx.shadowColor = '#64c8ff'; ctx.shadowBlur = 8;
        const bGrad = ctx.createLinearGradient(b.x, b.y, b.x, b.y + 8);
        bGrad.addColorStop(0, '#64c8ff');
        bGrad.addColorStop(1, 'rgba(100,200,255,0.2)');
        ctx.fillStyle = bGrad;
        ctx.fillRect(b.x - 1.5, b.y, 3, 8);
        ctx.restore();
      });

      // Asteroids
      g.asteroids.forEach(a => {
        ctx.save(); ctx.translate(a.x, a.y); ctx.rotate(a.rot);
        const aGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, a.r);
        aGrad.addColorStop(0, '#6a7590');
        aGrad.addColorStop(1, '#3a4258');
        ctx.fillStyle = aGrad;
        ctx.strokeStyle = `rgba(255,${a.tier >= 1 ? '140,60' : '107,107'},0.5)`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        a.verts.forEach((v, i) => {
          const x = Math.cos(v.angle) * v.dist;
          const y = Math.sin(v.angle) * v.dist;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        });
        ctx.closePath(); ctx.fill(); ctx.stroke();
        // Craters
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath(); ctx.arc(-a.r * 0.2, -a.r * 0.15, a.r * 0.2, 0, Math.PI * 2); ctx.fill();
        if (a.r > 12) { ctx.beginPath(); ctx.arc(a.r * 0.25, a.r * 0.2, a.r * 0.15, 0, Math.PI * 2); ctx.fill(); }
        ctx.restore();
      });

      // Powerups
      g.powerups.forEach(pw => {
        ctx.save();
        ctx.shadowColor = '#64c8ff'; ctx.shadowBlur = 10;
        const pulse = 0.7 + Math.sin(Date.now() * 0.005) * 0.3;
        ctx.strokeStyle = `rgba(100,200,255,${pulse})`;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(pw.x, pw.y, 10, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = `rgba(100,200,255,0.2)`;
        ctx.fill();
        ctx.fillStyle = '#64c8ff'; ctx.font = 'bold 10px "JetBrains Mono", monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('S', pw.x, pw.y);
        ctx.restore();
      });

      // Particles
      g.particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vx *= 0.97; p.vy *= 0.97; p.life--;
        const t = p.life / p.startLife;
        ctx.globalAlpha = t;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * t + 0.5, 0, Math.PI * 2);
        ctx.fillStyle = p.color; ctx.fill();
      });
      ctx.globalAlpha = 1;
      g.particles = g.particles.filter(p => p.life > 0);

      // Health bar
      const hbX = 10, hbY = 10, hbW = 50, hbH = 6;
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(hbX, hbY, hbW, hbH);
      const hpRatio = g.hp / g.maxHp;
      const hpColor = hpRatio > 0.6 ? '#28c840' : hpRatio > 0.3 ? '#febc2e' : '#ff6b6b';
      ctx.fillStyle = hpColor;
      ctx.fillRect(hbX, hbY, hbW * hpRatio, hbH);
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(hbX, hbY, hbW, hbH);
      // HP label
      ctx.fillStyle = 'rgba(200,220,240,0.5)'; ctx.font = '8px "JetBrains Mono", monospace'; ctx.textAlign = 'left';
      ctx.fillText('HP', hbX, hbY + hbH + 10);

      // Shield indicator
      if (g.shield > 0) {
        ctx.fillStyle = 'rgba(100,200,255,0.6)'; ctx.font = '8px "JetBrains Mono", monospace'; ctx.textAlign = 'left';
        ctx.fillText('SHIELD', hbX, hbY + hbH + 20);
      }

      // Score
      ctx.fillStyle = 'rgba(100,200,255,0.8)'; ctx.font = '12px "JetBrains Mono", monospace'; ctx.textAlign = 'right';
      ctx.fillText(`Score: ${g.score}`, W - 10, 18);

      if (!g.running && started) {
        ctx.fillStyle = 'rgba(6,10,20,0.75)'; ctx.fillRect(0, 0, W, H);
        ctx.save(); ctx.shadowColor = '#ff6b6b'; ctx.shadowBlur = 15;
        ctx.fillStyle = '#ff6b6b'; ctx.font = 'bold 20px "JetBrains Mono", monospace'; ctx.textAlign = 'center';
        ctx.fillText('DESTROYED', W / 2, H / 2 - 15);
        ctx.restore();
        ctx.fillStyle = '#c8d0e0'; ctx.font = '13px "JetBrains Mono", monospace';
        ctx.fillText(`Score: ${g.score}`, W / 2, H / 2 + 10);
        ctx.fillStyle = '#8892a8'; ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillText('Press Retry to play again', W / 2, H / 2 + 32);
      }

      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('mousemove', handleMove);
      canvas.removeEventListener('mousedown', handleDown);
      canvas.removeEventListener('mouseup', handleUp);
      canvas.removeEventListener('mouseleave', handleUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [started, start]);

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 400 }}>
      <canvas ref={canvasRef} width={W} height={H} style={{ width: '100%', maxWidth: 400, height: 'auto', borderRadius: 8, cursor: 'crosshair', display: 'block', touchAction: 'none' }} />
      {!started && (
        <button onClick={start} className="constellation-clear" style={{ position: 'absolute', left: '50%', bottom: '35%', transform: 'translateX(-50%)' }}>
          Start
        </button>
      )}
      {gameOver && (
        <button onClick={start} className="constellation-clear" style={{ position: 'absolute', left: '50%', bottom: '30%', transform: 'translateX(-50%)' }}>
          Retry
        </button>
      )}
    </div>
  );
};

export default AsteroidShooter;
