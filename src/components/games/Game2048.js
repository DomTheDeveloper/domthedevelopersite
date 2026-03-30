import React, { useState, useCallback } from 'react';

const SIZE = 4;

const getEmpty = () => Array(SIZE * SIZE).fill(0);

const addRandom = (board) => {
  const empty = board.reduce((acc, v, i) => (v === 0 ? [...acc, i] : acc), []);
  if (empty.length === 0) return board;
  const idx = empty[Math.floor(Math.random() * empty.length)];
  const next = [...board];
  next[idx] = Math.random() < 0.9 ? 2 : 4;
  return next;
};

const slide = (row) => {
  const filtered = row.filter(v => v !== 0);
  const merged = [];
  let score = 0;
  for (let i = 0; i < filtered.length; i++) {
    if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
      merged.push(filtered[i] * 2);
      score += filtered[i] * 2;
      i++;
    } else {
      merged.push(filtered[i]);
    }
  }
  while (merged.length < SIZE) merged.push(0);
  return { row: merged, score };
};

const move = (board, dir) => {
  let newBoard = [...board];
  let totalScore = 0;

  const getRow = (i) => {
    if (dir === 'left' || dir === 'right') return [0, 1, 2, 3].map(j => newBoard[i * SIZE + j]);
    return [0, 1, 2, 3].map(j => newBoard[j * SIZE + i]);
  };
  const setRow = (i, row) => {
    if (dir === 'left' || dir === 'right') row.forEach((v, j) => { newBoard[i * SIZE + j] = v; });
    else row.forEach((v, j) => { newBoard[j * SIZE + i] = v; });
  };

  for (let i = 0; i < SIZE; i++) {
    let row = getRow(i);
    if (dir === 'right' || dir === 'down') row.reverse();
    const { row: slid, score } = slide(row);
    totalScore += score;
    if (dir === 'right' || dir === 'down') slid.reverse();
    setRow(i, slid);
  }

  return { board: newBoard, score: totalScore };
};

const canMove = (board) => {
  if (board.includes(0)) return true;
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      const v = board[i * SIZE + j];
      if (j < SIZE - 1 && v === board[i * SIZE + j + 1]) return true;
      if (i < SIZE - 1 && v === board[(i + 1) * SIZE + j]) return true;
    }
  }
  return false;
};

const TILE_COLORS = {
  0: 'rgba(100,200,255,0.04)', 2: '#1a2540', 4: '#1e2d4a', 8: '#1a3a55', 16: '#1a4565',
  32: '#1a5070', 64: '#1a5b7a', 128: '#1a6585', 256: '#1a7090', 512: '#1a7b9a',
  1024: '#1a85a5', 2048: '#64c8ff',
};

const Game2048 = () => {
  const [board, setBoard] = useState(() => addRandom(addRandom(getEmpty())));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [best, setBest] = useState(0);

  const handleMove = useCallback((dir) => {
    if (gameOver) return;
    const { board: newBoard, score: gained } = move(board, dir);
    if (JSON.stringify(newBoard) === JSON.stringify(board)) return;
    const withNew = addRandom(newBoard);
    setBoard(withNew);
    setScore(s => s + gained);
    if (!canMove(withNew)) {
      setGameOver(true);
      setBest(prev => Math.max(prev, score + gained));
    }
  }, [board, gameOver, score]);

  const restart = () => { setBoard(addRandom(addRandom(getEmpty()))); setScore(0); setGameOver(false); };

  React.useEffect(() => {
    const handleKey = (e) => {
      const map = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', a: 'left', d: 'right', w: 'up', s: 'down' };
      if (map[e.key]) { e.preventDefault(); handleMove(map[e.key]); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleMove]);

  // swipe support
  const touchRef = React.useRef(null);
  const containerRef = React.useRef(null);

  const handleTouchStart = (e) => {
    e.preventDefault();
    touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const handleTouchEnd = (e) => {
    if (!touchRef.current) return;
    const dx = e.changedTouches[0].clientX - touchRef.current.x;
    const dy = e.changedTouches[0].clientY - touchRef.current.y;
    const MIN_SWIPE = 30;
    if (Math.abs(dx) < MIN_SWIPE && Math.abs(dy) < MIN_SWIPE) return;
    if (Math.abs(dx) > Math.abs(dy)) handleMove(dx > 0 ? 'right' : 'left');
    else handleMove(dy > 0 ? 'down' : 'up');
  };

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('touchstart', handleTouchStart, { passive: false });
    return () => el.removeEventListener('touchstart', handleTouchStart);
  });

  return (
    <div className="game2048" ref={containerRef} onTouchEnd={handleTouchEnd} style={{ touchAction: 'none' }}>
      <div className="game2048__header">
        <span>Score: {score}</span>
        {best > 0 && <span>Best: {best}</span>}
        <button className="constellation-clear" onClick={restart}>New Game</button>
      </div>
      <div className="game2048__grid">
        {board.map((v, i) => (
          <div key={i} className={`game2048__tile ${v > 0 ? 'game2048__tile--filled' : ''}`} style={{ background: TILE_COLORS[v] || '#64c8ff' }}>
            {v > 0 && <span style={{ color: v >= 128 ? '#fff' : '#64c8ff', fontSize: v >= 1000 ? '0.8rem' : '1rem' }}>{v}</span>}
          </div>
        ))}
      </div>
      {gameOver && <p style={{ textAlign: 'center', color: '#ff6b6b', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', marginTop: '0.8rem' }}>Game Over! Score: {score}</p>}
      <p className="game2048__hint">Arrow keys or WASD. Swipe on mobile.</p>
    </div>
  );
};

export default Game2048;
