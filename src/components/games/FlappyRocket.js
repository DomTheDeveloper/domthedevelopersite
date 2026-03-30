import React, { useRef, useEffect, useState } from 'react';

const W = 300, H = 400;

const FlappyRocket = () => {
  const canvasRef = useRef(null);
  const stateRef = useRef({ phase: 'idle', game: null });
  const animRef = useRef(null);
  const [, setTick] = useState(0);

  const initGame = () => {
    stateRef.current.game = {
      bird: { y: H / 2, vy: 0 },
      pipes: [], frame: 0, score: 0,
      particles: [],
      stars: Array.from({ length: 50 }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        s: 0.3 + Math.random() * 0.8, speed: 0.2 + Math.random() * 1.0,
      })),
    };
    stateRef.current.phase = 'playing';
    setTick(k => k + 1);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const doFlap = () => {
      const s = stateRef.current;
      if (s.phase === 'playing' && s.game) {
        s.game.bird.vy = -5;
      }
    };

    const onKey = (e) => { if (e.code === 'Space') { e.preventDefault(); doFlap(); } };
    const onTouch = (e) => { e.preventDefault(); doFlap(); };
    const onClick = () => { doFlap(); };

    window.addEventListener('keydown', onKey);
    canvas.addEventListener('touchstart', onTouch, { passive: false });
    canvas.addEventListener('click', onClick);

    const draw = () => {
      try {
        const s = stateRef.current;
        const g = s.game;
        ctx.fillStyle = '#060a14';
        ctx.fillRect(0, 0, W, H);

        // Idle screen
        if (s.phase === 'idle' || !g) {
          ctx.fillStyle = '#64c8ff';
          ctx.font = '18px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText('FLAPPY ROCKET', W / 2, H / 2 - 20);
          ctx.fillStyle = '#8892a8';
          ctx.font = '11px "JetBrains Mono", monospace';
          ctx.fillText('Press Start to play', W / 2, H / 2 + 15);
          animRef.current = requestAnimationFrame(draw);
          return;
        }

        // Background stars
        for (let i = 0; i < g.stars.length; i++) {
          const st = g.stars[i];
          st.x -= st.speed;
          if (st.x < 0) { st.x = W; st.y = Math.random() * H; }
          ctx.beginPath();
          ctx.arc(st.x, st.y, Math.max(0.3, st.s * 0.5), 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(200,220,255,0.3)';
          ctx.fill();
        }

        // Physics
        if (s.phase === 'playing') {
          g.frame++;
          g.bird.vy += 0.25;
          if (g.bird.vy > 7) g.bird.vy = 7;
          if (g.bird.vy < -5) g.bird.vy = -5;
          g.bird.y += g.bird.vy;

          // Spawn pipes
          if (g.frame % 100 === 0) {
            const gapY = 70 + Math.random() * (H - 200);
            g.pipes.push({ x: W, gapY: gapY, gap: 110, passed: false });
          }

          // Move pipes
          for (let i = g.pipes.length - 1; i >= 0; i--) {
            const p = g.pipes[i];
            p.x -= 2;
            if (!p.passed && p.x + 30 < 50) {
              p.passed = true;
              g.score++;
            }
            if (p.x < -40) g.pipes.splice(i, 1);
          }

          // Trail
          if (g.frame % 3 === 0) {
            g.particles.push({
              x: 36, y: g.bird.y,
              vx: -1 - Math.random(), vy: (Math.random() - 0.5) * 2,
              life: 15,
            });
          }

          // Collision
          let dead = false;
          if (g.bird.y < 0 || g.bird.y > H) dead = true;
          for (let i = 0; i < g.pipes.length; i++) {
            const p = g.pipes[i];
            if (60 > p.x && 40 < p.x + 30) {
              if (g.bird.y - 8 < p.gapY || g.bird.y + 8 > p.gapY + p.gap) {
                dead = true;
              }
            }
          }
          if (dead) {
            s.phase = 'dead';
            setTick(k => k + 1);
          }
        }

        // Draw particles
        for (let i = g.particles.length - 1; i >= 0; i--) {
          const p = g.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life--;
          if (p.life <= 0) { g.particles.splice(i, 1); continue; }
          const alpha = p.life / 15;
          const radius = Math.max(0.5, alpha * 2);
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
          ctx.fillStyle = g.bird.vy < 0
            ? `rgba(255,180,50,${alpha * 0.6})`
            : `rgba(100,200,255,${alpha * 0.3})`;
          ctx.fill();
        }

        // Draw pipes
        for (let i = 0; i < g.pipes.length; i++) {
          const p = g.pipes[i];
          // Top pipe
          ctx.fillStyle = 'rgba(40,100,150,0.3)';
          ctx.fillRect(p.x, 0, 30, p.gapY);
          ctx.strokeStyle = 'rgba(100,200,255,0.4)';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(p.x, 0, 30, p.gapY);
          // Bottom pipe
          const bt = p.gapY + p.gap;
          ctx.fillStyle = 'rgba(40,100,150,0.3)';
          ctx.fillRect(p.x, bt, 30, H - bt);
          ctx.strokeStyle = 'rgba(100,200,255,0.4)';
          ctx.strokeRect(p.x, bt, 30, H - bt);
        }

        // Draw rocket
        const by = g.bird.y;
        ctx.save();
        ctx.shadowColor = '#64c8ff';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#64c8ff';
        ctx.beginPath();
        ctx.moveTo(62, by);
        ctx.lineTo(44, by - 8);
        ctx.lineTo(38, by - 6);
        ctx.lineTo(38, by + 6);
        ctx.lineTo(44, by + 8);
        ctx.closePath();
        ctx.fill();
        // Window
        ctx.fillStyle = 'rgba(200,240,255,0.8)';
        ctx.beginPath();
        ctx.arc(50, by, 2.5, 0, Math.PI * 2);
        ctx.fill();
        // Flame
        if (g.bird.vy < 0) {
          const fl = 6 + Math.random() * 6;
          ctx.fillStyle = 'rgba(255,180,50,0.7)';
          ctx.beginPath();
          ctx.moveTo(38, by - 4);
          ctx.lineTo(38 - fl, by);
          ctx.lineTo(38, by + 4);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();

        // Score
        ctx.fillStyle = 'rgba(100,200,255,0.9)';
        ctx.font = 'bold 16px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(String(g.score), W / 2, 28);

        // Dead overlay
        if (s.phase === 'dead') {
          ctx.fillStyle = 'rgba(6,10,20,0.75)';
          ctx.fillRect(0, 0, W, H);
          ctx.fillStyle = '#ff6b6b';
          ctx.font = 'bold 22px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText('CRASH', W / 2, H / 2 - 15);
          ctx.fillStyle = '#c8d0e0';
          ctx.font = '13px "JetBrains Mono", monospace';
          ctx.fillText('Score: ' + g.score, W / 2, H / 2 + 12);
        }
      } catch (err) {
        // Prevent draw loop from dying
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('keydown', onKey);
      canvas.removeEventListener('touchstart', onTouch);
      canvas.removeEventListener('click', onClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const phase = stateRef.current.phase;

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 300 }}>
      <canvas
        ref={canvasRef} width={W} height={H}
        style={{ width: '100%', maxWidth: 300, height: 'auto', borderRadius: 8, display: 'block', touchAction: 'none' }}
      />
      {phase === 'idle' && (
        <button
          onClick={(e) => { e.stopPropagation(); initGame(); }}
          className="constellation-clear"
          style={{ position: 'absolute', left: '50%', bottom: '35%', transform: 'translateX(-50%)', zIndex: 2, touchAction: 'manipulation' }}
        >
          Start
        </button>
      )}
      {phase === 'dead' && (
        <button
          onClick={(e) => { e.stopPropagation(); initGame(); }}
          className="constellation-clear"
          style={{ position: 'absolute', left: '50%', bottom: '35%', transform: 'translateX(-50%)', zIndex: 2, touchAction: 'manipulation' }}
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default FlappyRocket;
