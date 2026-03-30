import React, { useRef, useEffect, useState } from 'react';

const CitySimulator = () => {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    buildings: [],
    cars: [],
    pedestrians: [],
    flyingObjects: [],
    clouds: [],
    initialized: false,
    isNight: true,
  });
  const [population, setPopulation] = useState(0);
  const [buildMode, setBuildMode] = useState('residential');
  const [isNight, setIsNight] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    const W = 500, H = 320;
    canvas.width = W;
    canvas.height = H;
    const groundY = 250;
    const st = stateRef.current;

    const buildingStyles = [
      // style 0: standard box
      { draw: (ctx, bx, by, w, h) => { ctx.fillRect(bx, by, w, h); } },
      // style 1: stepped top
      { draw: (ctx, bx, by, w, h) => {
        ctx.fillRect(bx, by + h * 0.15, w, h * 0.85);
        ctx.fillRect(bx + w * 0.15, by, w * 0.7, h * 0.2);
      }},
      // style 2: narrow tower with wider base
      { draw: (ctx, bx, by, w, h) => {
        ctx.fillRect(bx + w * 0.1, by, w * 0.8, h * 0.7);
        ctx.fillRect(bx, by + h * 0.65, w, h * 0.35);
      }},
      // style 3: pyramid/tapered top
      { draw: (ctx, bx, by, w, h) => {
        ctx.fillRect(bx, by + h * 0.2, w, h * 0.8);
        ctx.beginPath();
        ctx.moveTo(bx + w * 0.2, by + h * 0.2);
        ctx.lineTo(bx + w * 0.5, by);
        ctx.lineTo(bx + w * 0.8, by + h * 0.2);
        ctx.closePath();
        ctx.fill();
      }},
    ];

    // Seed initial data
    if (!st.initialized) {
      st.initialized = true;
      for (let i = 0; i < 6; i++) {
        const w = 28 + Math.random() * 30;
        const h = 45 + Math.random() * 100;
        st.buildings.push({
          x: 20 + i * 78, width: w, height: h,
          type: ['residential', 'commercial', 'park'][Math.floor(Math.random() * 3)],
          style: Math.floor(Math.random() * buildingStyles.length),
          hasAntenna: Math.random() > 0.5,
          hasSign: Math.random() > 0.6,
          signColor: `hsl(${Math.random() * 360}, 80%, 60%)`,
          windowSeed: Math.random() * 1000,
        });
      }
      // Initial pedestrians
      for (let i = 0; i < 8; i++) {
        st.pedestrians.push({
          x: Math.random() * W,
          speed: (Math.random() > 0.5 ? 1 : -1) * (0.2 + Math.random() * 0.3),
          color: ['#64c8ff', '#c084fc', '#febc2e', '#28c840', '#ff6b6b'][Math.floor(Math.random() * 5)],
        });
      }
      // Initial clouds
      for (let i = 0; i < 4; i++) {
        st.clouds.push({
          x: Math.random() * W,
          y: 20 + Math.random() * 60,
          w: 40 + Math.random() * 60,
          speed: 0.1 + Math.random() * 0.15,
        });
      }
      setPopulation(st.buildings.filter(b => b.type === 'residential').length * 12 + st.buildings.filter(b => b.type === 'commercial').length * 3);
    }

    const handleInteraction = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = W / rect.width;
      const x = (clientX - rect.left) * scaleX;
      const w = buildMode === 'park' ? 38 : 24 + Math.random() * 22;
      const h = buildMode === 'park' ? 15 : 35 + Math.random() * 100;

      const nx = x - w / 2;
      const overlap = st.buildings.some(b =>
        nx < b.x + b.width + 4 && nx + w + 4 > b.x
      );
      if (overlap) return;

      st.buildings.push({
        x: nx, width: w, height: h, type: buildMode,
        style: Math.floor(Math.random() * buildingStyles.length),
        hasAntenna: Math.random() > 0.4,
        hasSign: Math.random() > 0.5,
        signColor: `hsl(${Math.random() * 360}, 80%, 60%)`,
        windowSeed: Math.random() * 1000,
        isNew: true,
      });
      if (buildMode === 'residential') setPopulation(p => p + Math.floor(Math.random() * 8 + 5));
      if (buildMode === 'commercial') setPopulation(p => p + Math.floor(Math.random() * 3 + 1));

      // Spawn car
      if (Math.random() > 0.35) {
        st.cars.push({
          x: Math.random() > 0.5 ? -20 : W + 20,
          speed: (Math.random() > 0.5 ? 1 : -1) * (0.5 + Math.random()),
          color: ['#64c8ff', '#ff6b6b', '#febc2e', '#28c840', '#c084fc'][Math.floor(Math.random() * 5)],
        });
      }
      // Spawn pedestrian
      if (Math.random() > 0.3) {
        st.pedestrians.push({
          x: x,
          speed: (Math.random() > 0.5 ? 1 : -1) * (0.2 + Math.random() * 0.3),
          color: ['#64c8ff', '#c084fc', '#febc2e'][Math.floor(Math.random() * 3)],
        });
      }
    };

    const handleClick = (e) => handleInteraction(e.clientX, e.clientY);
    const handleTouch = (e) => {
      e.preventDefault();
      if (e.touches.length > 0) handleInteraction(e.touches[0].clientX, e.touches[0].clientY);
    };

    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('touchstart', handleTouch, { passive: false });

    const draw = () => {
      const night = st.isNight;
      ctx.clearRect(0, 0, W, H);

      // Sky
      const sky = ctx.createLinearGradient(0, 0, 0, groundY);
      if (night) {
        sky.addColorStop(0, '#05080f');
        sky.addColorStop(1, '#0a1025');
      } else {
        sky.addColorStop(0, '#1a3a6a');
        sky.addColorStop(0.5, '#3a6a9a');
        sky.addColorStop(1, '#6a9ac8');
      }
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, groundY);

      // Stars (night only)
      if (night) {
        for (let i = 0; i < 50; i++) {
          const sx = (i * 137.5 + 50) % W;
          const sy = (i * 73.3 + 20) % (groundY - 50);
          const alpha = 0.25 + Math.sin(Date.now() * 0.001 + i * 2.5) * 0.2;
          ctx.beginPath(); ctx.arc(sx, sy, 0.7 + (i % 3) * 0.3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(200, 220, 255, ${alpha})`; ctx.fill();
        }
      }

      // Moon/Sun
      ctx.save();
      if (night) {
        ctx.shadowColor = '#c8deff'; ctx.shadowBlur = 25;
        ctx.beginPath(); ctx.arc(420, 42, 18, 0, Math.PI * 2);
        ctx.fillStyle = '#e0e8f5'; ctx.fill();
        // Moon craters
        ctx.fillStyle = 'rgba(180,190,210,0.3)';
        ctx.beginPath(); ctx.arc(414, 38, 4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(425, 48, 3, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.shadowColor = '#ffdd44'; ctx.shadowBlur = 35;
        ctx.beginPath(); ctx.arc(420, 50, 22, 0, Math.PI * 2);
        ctx.fillStyle = '#ffe066'; ctx.fill();
      }
      ctx.restore();

      // Clouds
      st.clouds.forEach(c => {
        c.x += c.speed;
        if (c.x > W + c.w) c.x = -c.w;
        const ca = night ? 0.04 : 0.2;
        ctx.fillStyle = night ? `rgba(150,170,200,${ca})` : `rgba(255,255,255,${ca})`;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.w * 0.25, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath();
        ctx.arc(c.x + c.w * 0.2, c.y - c.w * 0.08, c.w * 0.3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath();
        ctx.arc(c.x + c.w * 0.45, c.y, c.w * 0.22, 0, Math.PI * 2); ctx.fill();
      });

      // Flying objects (airplane/helicopter)
      if (Math.random() < 0.003 && st.flyingObjects.length < 2) {
        const isHeli = Math.random() > 0.5;
        st.flyingObjects.push({
          x: -40, y: 30 + Math.random() * 60,
          speed: isHeli ? 0.6 + Math.random() * 0.4 : 1.0 + Math.random() * 0.8,
          isHeli,
        });
      }
      st.flyingObjects.forEach(fo => {
        fo.x += fo.speed;
        ctx.save();
        if (fo.isHeli) {
          // Helicopter body
          ctx.fillStyle = night ? 'rgba(100,200,255,0.4)' : 'rgba(80,80,100,0.7)';
          ctx.fillRect(fo.x, fo.y, 14, 6);
          ctx.fillRect(fo.x + 12, fo.y - 2, 5, 4);
          // Rotor
          const rotorPhase = Math.sin(Date.now() * 0.03) * 10;
          ctx.strokeStyle = night ? 'rgba(100,200,255,0.3)' : 'rgba(60,60,80,0.5)';
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(fo.x + 3 - rotorPhase, fo.y - 2); ctx.lineTo(fo.x + 11 + rotorPhase, fo.y - 2); ctx.stroke();
          // Tail
          ctx.fillRect(fo.x - 6, fo.y + 1, 7, 2);
          ctx.fillRect(fo.x - 7, fo.y - 2, 3, 4);
        } else {
          // Airplane
          ctx.fillStyle = night ? 'rgba(100,200,255,0.3)' : 'rgba(200,200,220,0.7)';
          ctx.fillRect(fo.x, fo.y, 20, 4);
          // Wings
          ctx.fillRect(fo.x + 6, fo.y - 5, 8, 14);
          // Tail
          ctx.fillRect(fo.x - 2, fo.y - 4, 5, 8);
          // Blinking light
          if (Math.sin(Date.now() * 0.005) > 0) {
            ctx.fillStyle = 'rgba(255,60,60,0.8)';
            ctx.beginPath(); ctx.arc(fo.x + 10, fo.y - 5, 1.5, 0, Math.PI * 2); ctx.fill();
          }
        }
        ctx.restore();
      });
      st.flyingObjects = st.flyingObjects.filter(fo => fo.x < W + 50);

      // Ground
      ctx.fillStyle = night ? '#0d1520' : '#1a2a1a';
      ctx.fillRect(0, groundY, W, H - groundY);

      // Road
      ctx.fillStyle = night ? '#151d2b' : '#2a2a2a';
      ctx.fillRect(0, groundY + 5, W, 25);
      ctx.setLineDash([15, 10]);
      ctx.strokeStyle = night ? 'rgba(100, 200, 255, 0.15)' : 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, groundY + 17); ctx.lineTo(W, groundY + 17); ctx.stroke();
      ctx.setLineDash([]);

      // Sidewalk
      ctx.fillStyle = night ? '#1a2030' : '#3a3a3a';
      ctx.fillRect(0, groundY + 30, W, 8);
      // Sidewalk lines
      ctx.strokeStyle = night ? 'rgba(100,200,255,0.06)' : 'rgba(255,255,255,0.1)';
      for (let sx = 0; sx < W; sx += 20) {
        ctx.beginPath(); ctx.moveTo(sx, groundY + 30); ctx.lineTo(sx, groundY + 38); ctx.stroke();
      }

      // Buildings
      st.buildings.forEach(b => {
        if (b.type === 'park') {
          // Tree trunk
          ctx.fillStyle = night ? '#2d1f0a' : '#5a3a1a';
          ctx.fillRect(b.x + b.width / 2 - 3, groundY - 8, 6, 10);
          // Tree canopy - layered circles
          const treeColor = night ? '#1a3a2a' : '#2a6a2a';
          ctx.fillStyle = treeColor;
          ctx.beginPath(); ctx.arc(b.x + b.width / 2, groundY - 18, 14, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(b.x + b.width / 2 - 7, groundY - 12, 10, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(b.x + b.width / 2 + 7, groundY - 12, 10, 0, Math.PI * 2); ctx.fill();
          // Grass
          ctx.fillStyle = night ? 'rgba(40, 200, 64, 0.12)' : 'rgba(40, 180, 64, 0.25)';
          ctx.fillRect(b.x - 3, groundY - 2, b.width + 6, 4);
          // Bench
          ctx.fillStyle = night ? '#2a2a3a' : '#5a4a2a';
          ctx.fillRect(b.x + 4, groundY - 4, 10, 3);
          ctx.fillRect(b.x + 5, groundY - 1, 1, 3);
          ctx.fillRect(b.x + 12, groundY - 1, 1, 3);
          return;
        }

        const bx = b.x;
        const by = groundY - b.height;
        const styleIdx = b.style || 0;

        // Building body
        const bGrad = ctx.createLinearGradient(bx, by, bx + b.width, by);
        if (night) {
          if (b.type === 'residential') {
            bGrad.addColorStop(0, '#141e30'); bGrad.addColorStop(1, '#1a2540');
          } else {
            bGrad.addColorStop(0, '#1a1530'); bGrad.addColorStop(1, '#201a40');
          }
        } else {
          if (b.type === 'residential') {
            bGrad.addColorStop(0, '#8a9ab0'); bGrad.addColorStop(1, '#a0b0c8');
          } else {
            bGrad.addColorStop(0, '#7a8aa0'); bGrad.addColorStop(1, '#90a0b8');
          }
        }
        ctx.fillStyle = bGrad;
        const styleDef = buildingStyles[styleIdx];
        styleDef.draw(ctx, bx, by, b.width, b.height);

        // Building edge
        ctx.strokeStyle = night ? 'rgba(100, 200, 255, 0.08)' : 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, by, b.width, b.height);

        // Windows - varied patterns
        const wSize = 3;
        const wGapX = 7;
        const wGapY = 8;
        const cols = Math.floor((b.width - 5) / wGapX);
        const rows = Math.floor((b.height - 10) / wGapY);
        const seed = b.windowSeed || 0;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const wx = bx + 3 + c * wGapX;
            const wy = by + 7 + r * wGapY;
            if (night) {
              const lit = Math.sin(seed + wx * 3.7 + wy * 7.3 + Date.now() * 0.0002) > 0.15;
              if (lit) {
                const warmth = Math.sin(seed + c * 5 + r * 3) > 0;
                ctx.fillStyle = b.type === 'commercial'
                  ? 'rgba(100, 200, 255, 0.65)'
                  : (warmth ? 'rgba(255, 220, 100, 0.55)' : 'rgba(255, 200, 150, 0.4)');
              } else {
                ctx.fillStyle = 'rgba(20, 30, 50, 0.8)';
              }
            } else {
              const reflected = Math.sin(seed + wx * 2 + Date.now() * 0.0005) > 0.5;
              ctx.fillStyle = reflected ? 'rgba(180,210,240,0.7)' : 'rgba(120,150,180,0.5)';
            }
            // Alternate between square and tall windows
            if ((r + c) % 3 === 0) {
              ctx.fillRect(wx, wy, wSize, wSize + 2);
            } else {
              ctx.fillRect(wx, wy, wSize, wSize);
            }
          }
        }

        // Door at base
        ctx.fillStyle = night ? 'rgba(100,200,255,0.15)' : 'rgba(60,40,20,0.5)';
        ctx.fillRect(bx + b.width / 2 - 3, groundY - 8, 6, 8);

        // Antenna
        if (b.hasAntenna && b.type !== 'park') {
          ctx.strokeStyle = night ? 'rgba(100,200,255,0.3)' : 'rgba(80,80,100,0.5)';
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(bx + b.width / 2, by); ctx.lineTo(bx + b.width / 2, by - 12); ctx.stroke();
          // Blinking light on antenna
          const blink = Math.sin(Date.now() * 0.003 + seed) > 0.3;
          ctx.fillStyle = blink ? 'rgba(255,60,60,0.8)' : 'rgba(255,60,60,0.2)';
          ctx.beginPath(); ctx.arc(bx + b.width / 2, by - 12, 1.5, 0, Math.PI * 2); ctx.fill();
        }

        // Rooftop sign for commercial
        if (b.hasSign && b.type === 'commercial') {
          ctx.fillStyle = night ? (b.signColor || 'rgba(255,100,100,0.6)') : 'rgba(100,100,120,0.4)';
          ctx.fillRect(bx + 4, by + 3, b.width - 8, 5);
          if (night) {
            ctx.save();
            ctx.shadowColor = b.signColor || '#ff6b6b';
            ctx.shadowBlur = 6;
            ctx.fillRect(bx + 4, by + 3, b.width - 8, 5);
            ctx.restore();
          }
        }

        // Water tank on some residential
        if (b.type === 'residential' && seed > 500 && b.height > 60) {
          ctx.fillStyle = night ? '#1a2535' : '#6a7a8a';
          ctx.fillRect(bx + b.width * 0.6, by - 8, 8, 8);
          ctx.fillRect(bx + b.width * 0.62, by - 10, 6, 3);
        }
      });

      // Cars
      st.cars.forEach(car => {
        car.x += car.speed;
        const cy = groundY + 12;
        ctx.fillStyle = car.color;
        // Car body
        ctx.fillRect(car.x, cy, 14, 5);
        ctx.fillRect(car.x + 2, cy - 3, 10, 4);
        // Windows
        ctx.fillStyle = night ? 'rgba(150,200,255,0.3)' : 'rgba(180,220,255,0.6)';
        ctx.fillRect(car.x + 3, cy - 2, 4, 3);
        ctx.fillRect(car.x + 8, cy - 2, 3, 3);
        // Wheels
        ctx.fillStyle = '#111';
        ctx.beginPath(); ctx.arc(car.x + 3, cy + 5, 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(car.x + 11, cy + 5, 2, 0, Math.PI * 2); ctx.fill();
        // Headlights
        if (night) {
          ctx.fillStyle = 'rgba(255, 255, 200, 0.7)';
          ctx.fillRect(car.speed > 0 ? car.x + 14 : car.x - 3, cy + 1, 3, 2);
          // Taillights
          ctx.fillStyle = 'rgba(255, 40, 40, 0.6)';
          ctx.fillRect(car.speed > 0 ? car.x - 1 : car.x + 13, cy + 1, 2, 2);
        }
      });
      st.cars = st.cars.filter(c => c.x > -30 && c.x < W + 30);

      // Pedestrians on sidewalk
      st.pedestrians.forEach(ped => {
        ped.x += ped.speed;
        if (ped.x < -10) ped.x = W + 10;
        if (ped.x > W + 10) ped.x = -10;
        const py = groundY + 33;
        // Body
        ctx.fillStyle = ped.color;
        ctx.globalAlpha = night ? 0.5 : 0.7;
        // Head
        ctx.beginPath(); ctx.arc(ped.x, py - 5, 2, 0, Math.PI * 2); ctx.fill();
        // Torso
        ctx.fillRect(ped.x - 1.5, py - 3, 3, 5);
        // Legs - animated
        const legPhase = Math.sin(Date.now() * 0.008 + ped.x);
        ctx.fillRect(ped.x - 1.5 + legPhase, py + 2, 1.5, 3);
        ctx.fillRect(ped.x - legPhase, py + 2, 1.5, 3);
        ctx.globalAlpha = 1;
      });

      // Street lamps
      for (let lx = 30; lx < W; lx += 100) {
        ctx.strokeStyle = night ? '#2a3545' : '#4a4a4a';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(lx, groundY + 30); ctx.lineTo(lx, groundY - 5); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(lx, groundY - 5); ctx.lineTo(lx + 5, groundY - 8); ctx.stroke();
        if (night) {
          // Lamp glow
          const glow = ctx.createRadialGradient(lx + 5, groundY - 8, 0, lx + 5, groundY - 8, 25);
          glow.addColorStop(0, 'rgba(255,220,150,0.15)');
          glow.addColorStop(1, 'rgba(255,220,150,0)');
          ctx.fillStyle = glow;
          ctx.fillRect(lx - 20, groundY - 33, 50, 50);
          ctx.fillStyle = 'rgba(255,220,150,0.8)';
          ctx.beginPath(); ctx.arc(lx + 5, groundY - 8, 2, 0, Math.PI * 2); ctx.fill();
        }
      }

      // Reflection on ground (night)
      if (night) {
        ctx.fillStyle = 'rgba(100, 200, 255, 0.015)';
        ctx.fillRect(0, groundY + 38, W, H - groundY - 38);
      }

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('touchstart', handleTouch);
    };
  }, [buildMode]);

  const toggleDayNight = () => {
    setIsNight(prev => {
      stateRef.current.isNight = !prev;
      return !prev;
    });
  };

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
        <button
          className="city-sim__btn"
          onClick={toggleDayNight}
        >
          {isNight ? '☀️ Day' : '🌙 Night'}
        </button>
        <span className="city-sim__pop">Pop: {population}</span>
      </div>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', maxWidth: 500, height: 'auto', borderRadius: 8, cursor: 'pointer', display: 'block', touchAction: 'none' }}
      />
      <p className="city-sim__hint">Tap or click on the skyline to place buildings</p>
    </div>
  );
};

export default CitySimulator;
