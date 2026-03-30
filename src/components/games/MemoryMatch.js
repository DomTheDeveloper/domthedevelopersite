import React, { useState, useEffect, useCallback } from 'react';

const ICONS = [
  { symbol: '⬡', color: '#64c8ff' },
  { symbol: '✶', color: '#ff6b6b' },
  { symbol: '△', color: '#28c840' },
  { symbol: '◎', color: '#febc2e' },
  { symbol: '⬟', color: '#c084fc' },
  { symbol: '✦', color: '#ff79c6' },
  { symbol: '⊞', color: '#48d1cc' },
  { symbol: '⟐', color: '#e4eaf5' },
];

const MemoryMatch = () => {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [started, setStarted] = useState(false);

  const initGame = useCallback(() => {
    const pairs = [...ICONS, ...ICONS];
    const shuffled = pairs.sort(() => Math.random() - 0.5).map((item, i) => ({ id: i, symbol: item.symbol, color: item.color }));
    setCards(shuffled);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setStarted(true);
  }, []);

  useEffect(() => {
    if (flipped.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = flipped;
      if (cards[a].symbol === cards[b].symbol) {
        setTimeout(() => {
          setMatched(prev => [...prev, a, b]);
          setFlipped([]);
        }, 400);
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
    }
  }, [flipped, cards]);

  const handleClick = (i) => {
    if (flipped.length >= 2 || flipped.includes(i) || matched.includes(i)) return;
    setFlipped(prev => [...prev, i]);
  };

  if (!started) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem 0' }}>
        <p style={{ color: '#8892a8', marginBottom: '1rem', fontSize: '0.9rem' }}>Match all pairs with the fewest moves</p>
        <button className="arcade__tab arcade__tab--active" onClick={initGame}>Start Game</button>
      </div>
    );
  }

  const won = matched.length === cards.length;

  return (
    <div className="memory">
      <div className="memory__info">
        <span>Moves: {moves}</span>
        <span>Matched: {matched.length / 2}/8</span>
        {won && <button className="constellation-clear" onClick={initGame}>Play Again</button>}
      </div>
      <div className="memory__grid">
        {cards.map((card, i) => {
          const isFlipped = flipped.includes(i) || matched.includes(i);
          return (
            <button
              key={card.id}
              className={`memory__card ${isFlipped ? 'memory__card--flipped' : ''} ${matched.includes(i) ? 'memory__card--matched' : ''}`}
              onClick={() => handleClick(i)}
            >
              <span className="memory__card-front" style={{ color: card.color, fontSize: '1.4rem' }}>{card.symbol}</span>
              <span className="memory__card-back">?</span>
            </button>
          );
        })}
      </div>
      {won && (
        <p style={{ textAlign: 'center', color: '#28c840', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', marginTop: '1rem' }}>
          Completed in {moves} moves!
        </p>
      )}
    </div>
  );
};

export default MemoryMatch;
