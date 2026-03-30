import React, { useRef, useEffect, useState } from 'react';

const CitySimulator = () => {
  const canvasRef = useRef(null);
  const buildingsRef = useRef([]);
  const carsRef = useRef([]);
  const [population, setPopulation] = useState(0);
  const [buildMode, setBuildMode] = useState('residential');

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    const W = 500, H = 320;
    canvas.width = W;
    canvas.height = H;
    const groundY = 250;

    // seed some buildings
    if (buildingsRef.current.length === 0) {
      for (let i = 0; i < 5; i++) {
        const w = 30 + Math.random() * 25;
        buildingsRef.current.push({
          x: 40 + i * 90, width: w, height: 40 + Math.random() * 80,
          type: ['residential', 'commercial', 'park'][Math.floor(Math.random() * 3)],
          windows: [],
        });
      }
      setPopulation(buildingsRef.current.filter(b => b.type === 'residential').length * 12);
    }

    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = W / rect.width;
      const x = (e.clientX - rect.left) * scaleX;
      const w = buildMode === 'park' ? 40 : 25 + Math.random() * 20;
      const h = buildMode === 'park' ? 15 : 30 + Math.random() * 90;

      // check overlap
      const nx = x - w / 2;
      const overlap = buildingsRef.current.some(b =>
        nx < b.x + b.width + 5 && nx + w + 5 > b.x
      );
      if (overlap) return;

      buildingsRef.current.push({ x: nx, width: w, height: h, type: buildMode, windows: [], isNew: true });
      if (buildMode === 'residential') setPopulation(p => p + Math.floor(Math.random() * 8 + 5));
      if (buildMode === 'commercial') setPopulation(p => p + Math.floor(Math.random() * 3 + 1));

      // spawn car
      if (Math.random() > 0.4) {
        carsRef.current.push({
          x: Math.random() > 0.5 ? -20 : W + 20,
          speed: (Math.random() > 0.5 ? 1 : -1) * (0.5 + Math.random()),
          color: ['#64c8ff', '#ff6b6b', '#febc2e', '#28c840', '#c084fc'][Math.floor(Math.random() * 5)],
        });
      }
    };

    canvas.addEventListener('click', handleClick);

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // sky gradient (night)
      const sky = ctx.createLinearGradient(0, 0, 0, groundY);
      sky.addColorStop(0, '#05080f');
      sky.addColorStop(1, '#0a1025');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, groundY);

      // stars
      for (let i = 0; i < 40; i++) {
        const sx = (i * 137.5 + 50) % W;
        const sy = (i * 73.3 + 20) % (groundY - 40);
        const alpha = 0.3 + Math.sin(Date.now() * 0.001 + i) * 0.2;
        ctx.beginPath();
        ctx.arc(sx, sy, 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 220, 255, ${alpha})`;
        ctx.fill();
      }

      // moon
      ctx.save();
      ctx.shadowColor = '#c8deff';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(420, 45, 18, 0, Math.PI * 2);
      ctx.fillStyle = '#e0e8f5';
      ctx.fill();
      ctx.restore();

      // ground
      ctx.fillStyle = '#0d1520';
      ctx.fillRect(0, groundY, W, H - groundY);

      // road
      ctx.fillStyle = '#151d2b';
      ctx.fillRect(0, groundY + 5, W, 25);
      // road lines
      ctx.setLineDash([15, 10]);
      ctx.strokeStyle = 'rgba(100, 200, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, groundY + 17);
      ctx.lineTo(W, groundY + 17);
      ctx.stroke();
      ctx.setLineDash([]);

      // buildings
      buildingsRef.current.forEach(b => {
        if (b.type === 'park') {
          // tree
          ctx.fillStyle = '#1a3a2a';
          ctx.beginPath();
          ctx.arc(b.x + b.width / 2, groundY - 15, 18, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#2d1f0a';
          ctx.fillRect(b.x + b.width / 2 - 3, groundY - 5, 6, 8);
          // grass
          ctx.fillStyle = 'rgba(40, 200, 64, 0.15)';
          ctx.fillRect(b.x, groundY - 2, b.width, 4);
          return;
        }

        const bx = b.x;
        const by = groundY - b.height;

        // building body
        const bGrad = ctx.createLinearGradient(bx, by, bx + b.width, by);
        if (b.type === 'residential') {
          bGrad.addColorStop(0, '#141e30');
          bGrad.addColorStop(1, '#1a2540');
        } else {
          bGrad.addColorStop(0, '#1a1530');
          bGrad.addColorStop(1, '#201a40');
        }
        ctx.fillStyle = bGrad;
        ctx.fillRect(bx, by, b.width, b.height);

        // building edge highlight
        ctx.strokeStyle = 'rgba(100, 200, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, by, b.width, b.height);

        // windows
        const wSize = 4;
        const wGap = 8;
        const cols = Math.floor((b.width - 6) / wGap);
        const rows = Math.floor((b.height - 8) / wGap);
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const wx = bx + 4 + c * wGap;
            const wy = by + 6 + r * wGap;
            const lit = Math.sin(wx * 3 + wy * 7 + Date.now() * 0.0003) > 0.2;
            ctx.fillStyle = lit
              ? (b.type === 'commercial' ? 'rgba(100, 200, 255, 0.6)' : 'rgba(255, 220, 100, 0.5)')
              : 'rgba(20, 30, 50, 0.8)';
            ctx.fillRect(wx, wy, wSize, wSize);
          }
        }

        // rooftop accent
        if (b.type === 'commercial') {
          ctx.fillStyle = 'rgba(100, 200, 255, 0.3)';
          ctx.fillRect(bx + b.width / 2 - 1, by - 6, 2, 6);
          ctx.beginPath();
          ctx.arc(bx + b.width / 2, by - 6, 2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 100, 100, 0.6)';
          ctx.fill();
        }
      });

      // cars
      carsRef.current.forEach(car => {
        car.x += car.speed;
        const cy = groundY + 14;
        ctx.fillStyle = car.color;
        ctx.fillRect(car.x, cy, 12, 5);
        // headlights
        ctx.fillStyle = `rgba(255, 255, 200, 0.6)`;
        ctx.fillRect(car.speed > 0 ? car.x + 12 : car.x - 3, cy + 1, 3, 2);
      });
      carsRef.current = carsRef.current.filter(c => c.x > -30 && c.x < W + 30);

      // reflection on ground
      ctx.fillStyle = 'rgba(100, 200, 255, 0.02)';
      ctx.fillRect(0, groundY + 30, W, 40);

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('click', handleClick);
    };
  }, [buildMode]);

  return (
    <div className="city-sim">
      <div className="city-sim__toolbar">
        {[
          { id: 'residential', label: '🏠 Residential' },
          { id: 'commercial', label: '🏢 Commercial' },
          { id: 'park', label: '🌳 Park' },
        ].map(b => (
          <button
            key={b.id}
            className={`city-sim__btn ${buildMode === b.id ? 'city-sim__btn--active' : ''}`}
            onClick={() => setBuildMode(b.id)}
          >
            {b.label}
          </button>
        ))}
        <span className="city-sim__pop">Pop: {population}</span>
      </div>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', maxWidth: 500, height: 'auto', borderRadius: 8, cursor: 'pointer', display: 'block' }}
      />
      <p className="city-sim__hint">Click on the skyline to place buildings</p>
    </div>
  );
};

export default CitySimulator;
