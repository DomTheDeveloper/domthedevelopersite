import React, { useState, useEffect, useCallback } from 'react';

const SIZE = 8;
const MINES = 10;

const MinesweeperGame = () => {
  const [board, setBoard] = useState([]);
  const [revealed, setRevealed] = useState([]);
  const [flagged, setFlagged] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [, setStarted] = useState(false);

  const init = useCallback(() => {
    const mines = new Set();
    while (mines.size < MINES) mines.add(Math.floor(Math.random() * SIZE * SIZE));

    const b = Array(SIZE * SIZE).fill(0);
    mines.forEach(m => { b[m] = -1; });

    for (let i = 0; i < SIZE; i++) {
      for (let j = 0; j < SIZE; j++) {
        if (b[i * SIZE + j] === -1) continue;
        let count = 0;
        for (let di = -1; di <= 1; di++) {
          for (let dj = -1; dj <= 1; dj++) {
            const ni = i + di, nj = j + dj;
            if (ni >= 0 && ni < SIZE && nj >= 0 && nj < SIZE && b[ni * SIZE + nj] === -1) count++;
          }
        }
        b[i * SIZE + j] = count;
      }
    }

    setBoard(b);
    setRevealed(Array(SIZE * SIZE).fill(false));
    setFlagged(Array(SIZE * SIZE).fill(false));
    setGameOver(false);
    setWon(false);
    setStarted(true);
  }, []);

  const reveal = (idx) => {
    if (gameOver || won || revealed[idx] || flagged[idx]) return;

    const newRevealed = [...revealed];
    if (board[idx] === -1) {
      board.forEach((v, i) => { if (v === -1) newRevealed[i] = true; });
      setRevealed(newRevealed);
      setGameOver(true);
      return;
    }

    const flood = (i) => {
      if (i < 0 || i >= SIZE * SIZE || newRevealed[i]) return;
      newRevealed[i] = true;
      if (board[i] === 0) {
        const r = Math.floor(i / SIZE), c = i % SIZE;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) flood(nr * SIZE + nc);
          }
        }
      }
    };

    flood(idx);
    setRevealed(newRevealed);

    if (newRevealed.filter((v, i) => !v).length === MINES) setWon(true);
  };

  const flag = (e, idx) => {
    e.preventDefault();
    if (gameOver || won || revealed[idx]) return;
    const f = [...flagged];
    f[idx] = !f[idx];
    setFlagged(f);
  };

  useEffect(() => { init(); }, [init]);

  const numColors = ['', '#64c8ff', '#28c840', '#ff6b6b', '#c084fc', '#febc2e', '#48d1cc', '#e4eaf5', '#8892a8'];

  return (
    <div className="minesweeper">
      <div className="minesweeper__header">
        <span>Mines: {MINES - flagged.filter(Boolean).length}</span>
        {(gameOver || won) && <button className="constellation-clear" onClick={init}>{won ? 'Play Again' : 'Retry'}</button>}
        {won && <span style={{ color: '#28c840' }}>You Win!</span>}
        {gameOver && <span style={{ color: '#ff6b6b' }}>Boom!</span>}
      </div>
      <div className="minesweeper__grid" style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}>
        {board.map((v, i) => (
          <button
            key={i}
            className={`minesweeper__cell ${revealed[i] ? 'minesweeper__cell--revealed' : ''} ${revealed[i] && v === -1 ? 'minesweeper__cell--mine' : ''}`}
            onClick={() => reveal(i)}
            onContextMenu={(e) => flag(e, i)}
          >
            {flagged[i] && !revealed[i] ? '🚩' : revealed[i] ? (v === -1 ? '💥' : (v > 0 ? <span style={{ color: numColors[v] }}>{v}</span> : '')) : ''}
          </button>
        ))}
      </div>
      <p style={{ textAlign: 'center', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', marginTop: '0.5rem' }}>Click to reveal. Right-click to flag.</p>
    </div>
  );
};

export default MinesweeperGame;
