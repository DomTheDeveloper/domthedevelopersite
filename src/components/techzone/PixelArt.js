import React, { useState, useCallback } from 'react';

const GRID = 16;
const COLORS = ['#0a0e17', '#64c8ff', '#4facfe', '#00f2fe', '#ff6b6b', '#febc2e', '#28c840', '#c084fc', '#ff79c6', '#e4eaf5'];

const PixelArt = () => {
  const [pixels, setPixels] = useState(() => Array(GRID * GRID).fill('#0a0e17'));
  const [color, setColor] = useState('#64c8ff');
  const [painting, setPainting] = useState(false);

  const paint = useCallback((i) => {
    setPixels(prev => { const next = [...prev]; next[i] = color; return next; });
  }, [color]);

  const clear = () => setPixels(Array(GRID * GRID).fill('#0a0e17'));

  return (
    <div className="pixel-art">
      <div className="pixel-art__palette">
        {COLORS.map(c => (
          <button
            key={c}
            className={`pixel-art__color ${color === c ? 'pixel-art__color--active' : ''}`}
            style={{ background: c }}
            onClick={() => setColor(c)}
          />
        ))}
        <button className="pixel-art__clear-btn" onClick={clear}>Clear</button>
      </div>
      <div
        className="pixel-art__grid"
        onMouseDown={() => setPainting(true)}
        onMouseUp={() => setPainting(false)}
        onMouseLeave={() => setPainting(false)}
      >
        {pixels.map((c, i) => (
          <div
            key={i}
            className="pixel-art__cell"
            style={{ background: c }}
            onMouseDown={() => paint(i)}
            onMouseEnter={() => painting && paint(i)}
          />
        ))}
      </div>
    </div>
  );
};

export default PixelArt;
