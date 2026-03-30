import React, { useRef, useEffect, useState, useCallback } from 'react';

const Snake = () => {
  const canvasRef = useRef(null);
  const gameRef = useRef({});
  const [, setScore] = useState(0);
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [, setBest] = useState(0);

  const W = 400, H = 400, CELL = 20;

  const resetGame = useCallback(() => {
    const g = gameRef.current;
    g.snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    g.dir = { x: 1, y: 0 };
    g.nextDir = { x: 1, y: 0 };
    g.food = { x: 15, y: 10 };
    g.running = true;
    g.score = 0;
    setScore(0);
  }, []);

  const start = useCallback(() => {
    resetGame();
    setStarted(true);
    setGameOver(false);
  }, [resetGame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let interval;

    const spawnFood = () => {
      const g = gameRef.current;
      const cells = [];
      for (let x = 0; x < W / CELL; x++) {
        for (let y = 0; y < H / CELL; y++) {
          if (!g.snake.some(s => s.x === x && s.y === y)) cells.push({ x, y });
        }
      }
      if (cells.length > 0) g.food = cells[Math.floor(Math.random() * cells.length)];
    };

    const handleKey = (e) => {
      if (!started) return;
      const g = gameRef.current;
      if (!g.running) return;
      const map = { ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 }, ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 }, w: { x: 0, y: -1 }, s: { x: 0, y: 1 }, a: { x: -1, y: 0 }, d: { x: 1, y: 0 } };
      const nd = map[e.key];
      if (nd && !(nd.x === -g.dir.x && nd.y === -g.dir.y)) {
        e.preventDefault();
        g.nextDir = nd;
      }
    };

    // touch swipe
    let touchStart = null;
    const handleTouchStart = (e) => {
      touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };
    const handleTouchEnd = (e) => {
      if (!touchStart) return;
      const dx = e.changedTouches[0].clientX - touchStart.x;
      const dy = e.changedTouches[0].clientY - touchStart.y;
      if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return; // ignore taps
      const g = gameRef.current;
      if (!started || !g.running) return;
      let nd;
      if (Math.abs(dx) > Math.abs(dy)) nd = dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
      else nd = dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
      if (nd && !(nd.x === -g.dir.x && nd.y === -g.dir.y)) g.nextDir = nd;
    };

    window.addEventListener('keydown', handleKey);
    // no click-to-start; use button instead
    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvas.addEventListener('touchend', handleTouchEnd);

    const tick = () => {
      const g = gameRef.current;
      if (!g.running || !started) return;

      g.dir = g.nextDir;
      const head = { x: g.snake[0].x + g.dir.x, y: g.snake[0].y + g.dir.y };

      // wall collision (wrap)
      head.x = (head.x + W / CELL) % (W / CELL);
      head.y = (head.y + H / CELL) % (H / CELL);

      // self collision
      if (g.snake.some(s => s.x === head.x && s.y === head.y)) {
        g.running = false;
        setGameOver(true);
        setBest(prev => Math.max(prev, g.score));
        return;
      }

      g.snake.unshift(head);

      if (head.x === g.food.x && head.y === g.food.y) {
        g.score++;
        setScore(g.score);
        spawnFood();
      } else {
        g.snake.pop();
      }
    };

    const draw = () => {
      ctx.fillStyle = '#060a14';
      ctx.fillRect(0, 0, W, H);

      // grid
      ctx.strokeStyle = 'rgba(100, 200, 255, 0.03)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i <= W / CELL; i++) {
        ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, H); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(W, i * CELL); ctx.stroke();
      }

      if (!started) {
        ctx.fillStyle = '#64c8ff';
        ctx.font = '16px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SNAKE', W / 2, H / 2 - 20);
        ctx.fillStyle = '#8892a8';
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillText('Press Start to play', W / 2, H / 2 + 10);
        return;
      }

      const g = gameRef.current;

      // food glow
      ctx.save();
      ctx.shadowColor = '#ff6b6b';
      ctx.shadowBlur = 15;
      ctx.fillStyle = '#ff6b6b';
      ctx.beginPath();
      ctx.arc(g.food.x * CELL + CELL / 2, g.food.y * CELL + CELL / 2, CELL / 2 - 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // snake
      g.snake.forEach((s, i) => {
        const alpha = 1 - (i / g.snake.length) * 0.5;
        ctx.save();
        if (i === 0) { ctx.shadowColor = '#64c8ff'; ctx.shadowBlur = 10; }
        ctx.fillStyle = i === 0 ? '#64c8ff' : `rgba(100, 200, 255, ${alpha})`;
        ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
        ctx.restore();
      });

      // score
      ctx.fillStyle = 'rgba(100, 200, 255, 0.6)';
      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`Score: ${g.score}`, W - 10, 18);

      if (!g.running) {
        ctx.fillStyle = 'rgba(6, 10, 20, 0.7)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#ff6b6b';
        ctx.font = '18px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', W / 2, H / 2 - 10);
        ctx.fillStyle = '#8892a8';
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillText(`Score: ${g.score}`, W / 2, H / 2 + 15);
        ctx.fillText('Press Retry to play again', W / 2, H / 2 + 35);
      }
    };

    interval = setInterval(() => { tick(); draw(); }, 100);
    draw();

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKey);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [started, start]);

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 400 }}>
      <canvas ref={canvasRef} width={W} height={H}
        style={{ width: '100%', maxWidth: 400, height: 'auto', borderRadius: 8, cursor: 'pointer', display: 'block', touchAction: 'none' }}
      />
      {!started && (
        <button onClick={start} className="constellation-clear" style={{ position: 'absolute', left: '50%', bottom: '45%', transform: 'translateX(-50%)' }}>
          Start
        </button>
      )}
      {gameOver && (
        <button onClick={start} className="constellation-clear" style={{ position: 'absolute', left: '50%', bottom: '35%', transform: 'translateX(-50%)' }}>
          Retry
        </button>
      )}
    </div>
  );
};

export default Snake;
