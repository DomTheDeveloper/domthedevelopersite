import React, { useState, useCallback, useRef } from 'react';

const GRID = 16;
const COLORS = ['#0a0e17', '#64c8ff', '#4facfe', '#00f2fe', '#ff6b6b', '#febc2e', '#28c840', '#c084fc', '#ff79c6', '#e4eaf5'];

const PixelArt = () => {
  const [pixels, setPixels] = useState(() => Array(GRID * GRID).fill('#0a0e17'));
  const [color, setColor] = useState('#64c8ff');
  const [painting, setPainting] = useState(false);
  const [customHex, setCustomHex] = useState('#64c8ff');
  const gridRef = useRef(null);

  const paint = useCallback((i) => {
    setPixels(prev => { const next = [...prev]; next[i] = color; return next; });
  }, [color]);

  const getCellFromTouch = useCallback((touch) => {
    if (!gridRef.current) return -1;
    const rect = gridRef.current.getBoundingClientRect();
    const cellSize = rect.width / GRID;
    const col = Math.floor((touch.clientX - rect.left) / cellSize);
    const row = Math.floor((touch.clientY - rect.top) / cellSize);
    if (col < 0 || col >= GRID || row < 0 || row >= GRID) return -1;
    return row * GRID + col;
  }, []);

  const clear = () => setPixels(Array(GRID * GRID).fill('#0a0e17'));

  const save = () => {
    const cellSize = 16;
    const canvas = document.createElement('canvas');
    canvas.width = GRID * cellSize;
    canvas.height = GRID * cellSize;
    const ctx = canvas.getContext('2d');
    pixels.forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.fillRect((i % GRID) * cellSize, Math.floor(i / GRID) * cellSize, cellSize, cellSize);
    });
    const link = document.createElement('a');
    link.download = 'pixel-art.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const applyCustomHex = () => {
    const hex = customHex.trim();
    if (/^#[0-9a-fA-F]{3,6}$/.test(hex)) {
      setColor(hex);
    }
  };

  const lastTouchCell = useRef(-1);

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
        <div className="pixel-art__hex-row">
          <input
            type="text"
            value={customHex}
            onChange={(e) => setCustomHex(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') applyCustomHex(); }}
            className="pixel-art__hex-input"
            placeholder="#hex"
            maxLength={7}
          />
          <button className="pixel-art__hex-btn" onClick={applyCustomHex} style={{ background: /^#[0-9a-fA-F]{3,6}$/.test(customHex.trim()) ? customHex.trim() : '#333' }} />
        </div>
        <button className="pixel-art__clear-btn" onClick={save}>Save</button>
        <button className="pixel-art__clear-btn" onClick={clear}>Clear</button>
      </div>
      <div
        className="pixel-art__grid"
        ref={gridRef}
        onMouseDown={() => setPainting(true)}
        onMouseUp={() => setPainting(false)}
        onMouseLeave={() => setPainting(false)}
        onTouchStart={(e) => {
          e.preventDefault();
          const idx = getCellFromTouch(e.touches[0]);
          if (idx >= 0) { paint(idx); lastTouchCell.current = idx; }
        }}
        onTouchMove={(e) => {
          e.preventDefault();
          const idx = getCellFromTouch(e.touches[0]);
          if (idx >= 0 && idx !== lastTouchCell.current) { paint(idx); lastTouchCell.current = idx; }
        }}
        onTouchEnd={() => { lastTouchCell.current = -1; }}
        style={{ touchAction: 'none' }}
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
