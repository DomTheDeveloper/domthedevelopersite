import React, { useRef, useEffect, useState, useCallback } from 'react';

const CitySimulator = () => {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    buildings: [],
    cars: [],
    clouds: [],
    airplane: null,
    isNight: true,
    stars: [],
  });
  const [buildingCount, setBuildingCount] = useState(0);
  const [buildMode, setBuildMode] = useState('skyscraper');
  const [demolishMode, setDemolishMode] = useState(false);
  const [isNight, setIsNight] = useState(true);

  const W = 400;
  const H = 300;
  const GROUND_Y = 230;
  const ROAD_Y = GROUND_Y + 4;
  const ROAD_H = 22;

  const initState = useCallback(() => {
    const st = stateRef.current;
    st.buildings = [];
    st.cars = [];
    st.clouds = [];
    st.airplane = null;
    st.stars = [];
    for (let i = 0; i < 60; i++) {
      st.stars.push({
        x: Math.random() * W,
        y: Math.random() * (GROUND_Y - 30),
        size: 0.5 + Math.random() * 1.2,
        twinkleOffset: Math.random() * Math.PI * 2,
      });
    }
    for (let i = 0; i < 4; i++) {
      st.clouds.push({
        x: Math.random() * W,
        y: 15 + Math.random() * 55,
        w: 35 + Math.random() * 50,
        speed: 0.08 + Math.random() * 0.12,
      });
    }
    for (let i = 0; i < 2; i++) {
      st.cars.push({
        x: Math.random() * W,
        speed: (Math.random() > 0.5 ? 1 : -1) * (0.4 + Math.random() * 0.6),
        color: ['#64c8ff', '#ff5577', '#ffcc33', '#44dd66'][Math.floor(Math.random() * 4)],
        width: 12 + Math.random() * 4,
      });
    }
    setBuildingCount(0);
  }, []);

  useEffect(() => {
    const st = stateRef.current;
    if (st.stars.length === 0) {
      initState();
    }
  }, [initState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = W;
    canvas.height = H;
    let animId;
    const st = stateRef.current;

    const getCanvasPos = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = W / rect.width;
      const scaleY = H / rect.height;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    };

    const handleInteraction = (clientX, clientY) => {
      const pos = getCanvasPos(clientX, clientY);
      const x = pos.x;
      const y = pos.y;

      if (demolishMode) {
        const idx = st.buildings.findIndex(b => {
          const bx = b.x;
          const by = GROUND_Y - b.height;
          return x >= bx && x <= bx + b.width && y >= by && y <= GROUND_Y;
        });
        if (idx !== -1) {
          st.buildings.splice(idx, 1);
          setBuildingCount(st.buildings.length);
        }
        return;
      }

      // Only place if clicking in the ground/sky area above the road
      if (y > GROUND_Y + 2) return;

      let w, h;
      switch (buildMode) {
        case 'skyscraper':
          w = 22 + Math.random() * 14;
          h = 80 + Math.random() * 70;
          break;
        case 'house':
          w = 24 + Math.random() * 10;
          h = 28 + Math.random() * 18;
          break;
        case 'factory':
          w = 30 + Math.random() * 16;
          h = 40 + Math.random() * 25;
          break;
        case 'tower':
          w = 14 + Math.random() * 8;
          h = 100 + Math.random() * 50;
          break;
        default:
          w = 24; h = 60;
      }

      const nx = Math.max(2, Math.min(W - w - 2, x - w / 2));
      const overlap = st.buildings.some(b =>
        nx < b.x + b.width + 2 && nx + w + 2 > b.x
      );
      if (overlap) return;

      st.buildings.push({
        x: nx, width: w, height: h, type: buildMode,
        variant: Math.floor(Math.random() * 3),
        hasAntenna: Math.random() > 0.4,
        hasDoor: true,
        windowSeed: Math.random() * 1000,
        roofDetail: Math.floor(Math.random() * 3),
        wallShade: 0.8 + Math.random() * 0.4,
      });
      setBuildingCount(st.buildings.length);

      if (Math.random() > 0.4) {
        st.cars.push({
          x: Math.random() > 0.5 ? -20 : W + 20,
          speed: (Math.random() > 0.5 ? 1 : -1) * (0.4 + Math.random() * 0.6),
          color: ['#64c8ff', '#ff5577', '#ffcc33', '#44dd66'][Math.floor(Math.random() * 4)],
          width: 12 + Math.random() * 4,
        });
      }
    };

    const handleClick = (e) => {
      e.preventDefault();
      handleInteraction(e.clientX, e.clientY);
    };
    const handleTouch = (e) => {
      e.preventDefault();
      if (e.touches.length > 0) {
        handleInteraction(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('touchstart', handleTouch, { passive: false });

    const drawCloud = (c, night) => {
      const alpha = night ? 0.06 : 0.25;
      ctx.fillStyle = night ? `rgba(140,170,210,${alpha})` : `rgba(255,255,255,${alpha})`;
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.w * 0.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath();
      ctx.arc(c.x + c.w * 0.2, c.y - c.w * 0.07, c.w * 0.28, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath();
      ctx.arc(c.x + c.w * 0.45, c.y + c.w * 0.02, c.w * 0.18, 0, Math.PI * 2); ctx.fill();
    };

    const drawBuilding = (b, night, time) => {
      const bx = b.x;
      const by = GROUND_Y - b.height;
      const bw = b.width;
      const bh = b.height;
      const seed = b.windowSeed;

      // -- Building body --
      const shade = b.wallShade || 1;
      if (night) {
        const baseR = Math.floor(14 * shade);
        const baseG = Math.floor(22 * shade);
        const baseB = Math.floor(38 * shade);
        ctx.fillStyle = `rgb(${baseR},${baseG},${baseB})`;
      } else {
        const baseR = Math.floor(110 * shade);
        const baseG = Math.floor(125 * shade);
        const baseB = Math.floor(148 * shade);
        ctx.fillStyle = `rgb(${baseR},${baseG},${baseB})`;
      }

      // Draw shape based on type and variant
      if (b.type === 'skyscraper') {
        if (b.variant === 0) {
          // Stepped top
          ctx.fillRect(bx, by + bh * 0.12, bw, bh * 0.88);
          ctx.fillRect(bx + bw * 0.15, by, bw * 0.7, bh * 0.18);
        } else if (b.variant === 1) {
          // Tapered top
          ctx.fillRect(bx, by + bh * 0.15, bw, bh * 0.85);
          ctx.beginPath();
          ctx.moveTo(bx + bw * 0.2, by + bh * 0.15);
          ctx.lineTo(bx + bw * 0.5, by);
          ctx.lineTo(bx + bw * 0.8, by + bh * 0.15);
          ctx.closePath();
          ctx.fill();
        } else {
          // Flat top box
          ctx.fillRect(bx, by, bw, bh);
        }
      } else if (b.type === 'house') {
        // House body
        ctx.fillRect(bx, by + bh * 0.35, bw, bh * 0.65);
        // Roof
        if (night) {
          ctx.fillStyle = 'rgb(20,14,10)';
        } else {
          ctx.fillStyle = '#7a4433';
        }
        ctx.beginPath();
        ctx.moveTo(bx - 2, by + bh * 0.35);
        ctx.lineTo(bx + bw / 2, by);
        ctx.lineTo(bx + bw + 2, by + bh * 0.35);
        ctx.closePath();
        ctx.fill();
        // Chimney
        if (b.variant === 1) {
          ctx.fillStyle = night ? 'rgb(18,12,10)' : '#664433';
          ctx.fillRect(bx + bw * 0.7, by + bh * 0.05, bw * 0.12, bh * 0.3);
        }
      } else if (b.type === 'factory') {
        // Main body
        ctx.fillRect(bx, by + bh * 0.25, bw, bh * 0.75);
        // Sawtooth roof
        const teeth = 3;
        const tw = bw / teeth;
        if (night) {
          ctx.fillStyle = 'rgb(16,20,30)';
        } else {
          ctx.fillStyle = '#6a7a8a';
        }
        for (let t = 0; t < teeth; t++) {
          ctx.beginPath();
          ctx.moveTo(bx + t * tw, by + bh * 0.25);
          ctx.lineTo(bx + t * tw + tw * 0.5, by);
          ctx.lineTo(bx + (t + 1) * tw, by + bh * 0.25);
          ctx.closePath();
          ctx.fill();
        }
        // Smokestack
        if (b.variant !== 2) {
          ctx.fillStyle = night ? 'rgb(22,28,38)' : '#556677';
          ctx.fillRect(bx + bw * 0.8, by - bh * 0.15, bw * 0.1, bh * 0.4);
          // Smoke puff
          ctx.fillStyle = night ? 'rgba(140,160,180,0.08)' : 'rgba(200,200,200,0.2)';
          const smokeY = by - bh * 0.15 - 4 - Math.sin(time * 0.002) * 3;
          ctx.beginPath();
          ctx.arc(bx + bw * 0.85, smokeY, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(bx + bw * 0.88, smokeY - 5, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (b.type === 'tower') {
        // Narrow tower with wider observation deck
        ctx.fillRect(bx + bw * 0.2, by + bh * 0.1, bw * 0.6, bh * 0.9);
        // Observation deck
        ctx.fillRect(bx, by + bh * 0.25, bw, bh * 0.08);
        // Spire
        ctx.fillRect(bx + bw * 0.4, by - bh * 0.08, bw * 0.2, bh * 0.18);
        // Top point
        ctx.beginPath();
        ctx.moveTo(bx + bw * 0.35, by - bh * 0.08);
        ctx.lineTo(bx + bw * 0.5, by - bh * 0.18);
        ctx.lineTo(bx + bw * 0.65, by - bh * 0.08);
        ctx.closePath();
        ctx.fill();
      }

      // -- Edge outline --
      ctx.strokeStyle = night ? 'rgba(100,200,255,0.1)' : 'rgba(0,0,0,0.12)';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(bx, by, bw, bh);

      // -- Windows --
      const wSize = b.type === 'house' ? 3 : 2.5;
      const wGapX = b.type === 'house' ? 8 : 6;
      const wGapY = b.type === 'house' ? 8 : 7;
      const winStartY = b.type === 'house' ? by + bh * 0.4 : by + 6;
      const winEndY = GROUND_Y - 10;
      const cols = Math.max(1, Math.floor((bw - 4) / wGapX));
      const rows = Math.max(1, Math.floor((winEndY - winStartY) / wGapY));

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const wx = bx + 3 + c * wGapX;
          const wy = winStartY + r * wGapY;
          if (wy + wSize > GROUND_Y - 6) continue;

          if (night) {
            const lit = Math.sin(seed + wx * 3.1 + wy * 5.7 + time * 0.0001) > 0.05;
            if (lit) {
              const warm = Math.sin(seed + c * 4 + r * 2.3) > 0;
              ctx.fillStyle = warm ? 'rgba(255,220,100,0.6)' : 'rgba(100,200,255,0.5)';
              ctx.shadowColor = warm ? 'rgba(255,220,100,0.3)' : 'rgba(100,200,255,0.2)';
              ctx.shadowBlur = 2;
            } else {
              ctx.fillStyle = 'rgba(15,20,35,0.9)';
              ctx.shadowBlur = 0;
            }
          } else {
            const reflected = Math.sin(seed + wx * 2 + time * 0.0004) > 0.4;
            ctx.fillStyle = reflected ? 'rgba(170,210,240,0.7)' : 'rgba(100,130,160,0.5)';
            ctx.shadowBlur = 0;
          }

          if ((r + c) % 3 === 0) {
            ctx.fillRect(wx, wy, wSize, wSize + 1.5);
          } else {
            ctx.fillRect(wx, wy, wSize, wSize);
          }
        }
      }
      ctx.shadowBlur = 0;

      // -- Door --
      if (b.hasDoor) {
        if (b.type === 'house') {
          ctx.fillStyle = night ? 'rgba(100,200,255,0.15)' : '#5a3a1a';
          ctx.fillRect(bx + bw / 2 - 3, GROUND_Y - 9, 6, 9);
          // Doorknob
          ctx.fillStyle = night ? 'rgba(100,200,255,0.3)' : '#ccaa44';
          ctx.beginPath();
          ctx.arc(bx + bw / 2 + 1.5, GROUND_Y - 5, 0.7, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = night ? 'rgba(100,200,255,0.12)' : 'rgba(40,40,60,0.4)';
          ctx.fillRect(bx + bw / 2 - 3, GROUND_Y - 7, 6, 7);
        }
      }

      // -- Antenna --
      if (b.hasAntenna && b.type !== 'house') {
        const antennaBase = b.type === 'tower' ? by - bh * 0.18 : by;
        ctx.strokeStyle = night ? 'rgba(100,200,255,0.25)' : 'rgba(80,80,100,0.4)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(bx + bw / 2, antennaBase);
        ctx.lineTo(bx + bw / 2, antennaBase - 10);
        ctx.stroke();
        // Blinking light
        const blink = Math.sin(time * 0.004 + seed) > 0.2;
        ctx.fillStyle = blink ? 'rgba(255,50,50,0.9)' : 'rgba(255,50,50,0.2)';
        ctx.beginPath();
        ctx.arc(bx + bw / 2, antennaBase - 10, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // -- Rooftop details --
      if (b.type === 'skyscraper' || b.type === 'factory') {
        if (b.roofDetail === 0 && bh > 50) {
          // Water tank
          ctx.fillStyle = night ? '#1a2535' : '#6a7a8a';
          ctx.fillRect(bx + bw * 0.65, by + 2, 6, 6);
          ctx.fillRect(bx + bw * 0.67, by, 4, 3);
        } else if (b.roofDetail === 1) {
          // AC unit
          ctx.fillStyle = night ? '#151e2a' : '#7a8a9a';
          ctx.fillRect(bx + 3, by + 2, 5, 4);
          ctx.fillRect(bx + 4, by, 3, 2);
        }
      }

      // Demolish highlight
      if (demolishMode) {
        ctx.strokeStyle = 'rgba(255,50,50,0.3)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.strokeRect(bx - 1, by - 1, bw + 2, bh + 2);
        ctx.setLineDash([]);
      }
    };

    const draw = () => {
      const night = st.isNight;
      const time = Date.now();
      ctx.clearRect(0, 0, W, H);

      // -- Sky gradient --
      const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
      if (night) {
        sky.addColorStop(0, '#030610');
        sky.addColorStop(0.5, '#081020');
        sky.addColorStop(1, '#0c1828');
      } else {
        sky.addColorStop(0, '#1a3a6a');
        sky.addColorStop(0.5, '#3a6a9a');
        sky.addColorStop(1, '#5a8aba');
      }
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, GROUND_Y);

      // -- Stars (night) --
      if (night) {
        st.stars.forEach(s => {
          const alpha = 0.3 + Math.sin(time * 0.001 + s.twinkleOffset) * 0.25;
          ctx.fillStyle = `rgba(200,220,255,${Math.max(0, alpha)})`;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // -- Moon or Sun --
      ctx.save();
      if (night) {
        ctx.shadowColor = '#a0c8ff';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#d8e4f0';
        ctx.beginPath(); ctx.arc(W - 50, 38, 16, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(170,180,200,0.25)';
        ctx.beginPath(); ctx.arc(W - 54, 34, 3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(W - 44, 42, 2.5, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.shadowColor = '#ffdd44';
        ctx.shadowBlur = 30;
        ctx.fillStyle = '#ffe066';
        ctx.beginPath(); ctx.arc(W - 60, 45, 20, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();

      // -- Clouds --
      st.clouds.forEach(c => {
        c.x += c.speed;
        if (c.x > W + c.w) c.x = -c.w - 10;
        drawCloud(c, night);
      });

      // -- Airplane --
      if (!st.airplane && Math.random() < 0.002) {
        st.airplane = {
          x: -30,
          y: 20 + Math.random() * 50,
          speed: 0.6 + Math.random() * 0.5,
        };
      }
      if (st.airplane) {
        const ap = st.airplane;
        ap.x += ap.speed;
        ctx.fillStyle = night ? 'rgba(100,200,255,0.25)' : 'rgba(210,210,220,0.7)';
        // Fuselage
        ctx.fillRect(ap.x, ap.y, 16, 3);
        // Wings
        ctx.fillRect(ap.x + 4, ap.y - 4, 7, 11);
        // Tail
        ctx.fillRect(ap.x - 1, ap.y - 3, 4, 7);
        // Blinking nav light
        if (Math.sin(time * 0.005) > 0) {
          ctx.fillStyle = 'rgba(255,50,50,0.8)';
          ctx.beginPath(); ctx.arc(ap.x + 8, ap.y - 4, 1, 0, Math.PI * 2); ctx.fill();
        }
        if (night) {
          ctx.fillStyle = 'rgba(255,255,200,0.6)';
          ctx.fillRect(ap.x + 16, ap.y + 0.5, 2, 1.5);
        }
        if (ap.x > W + 40) st.airplane = null;
      }

      // -- Ground --
      const groundGrad = ctx.createLinearGradient(0, GROUND_Y, 0, H);
      if (night) {
        groundGrad.addColorStop(0, '#0a1018');
        groundGrad.addColorStop(1, '#060a10');
      } else {
        groundGrad.addColorStop(0, '#1a2a1a');
        groundGrad.addColorStop(1, '#0f1a0f');
      }
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);

      // -- Road --
      ctx.fillStyle = night ? '#111822' : '#2a2a2a';
      ctx.fillRect(0, ROAD_Y, W, ROAD_H);
      // Road dashes
      ctx.setLineDash([12, 8]);
      ctx.strokeStyle = night ? 'rgba(100,200,255,0.12)' : 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, ROAD_Y + ROAD_H / 2);
      ctx.lineTo(W, ROAD_Y + ROAD_H / 2);
      ctx.stroke();
      ctx.setLineDash([]);
      // Road edges
      ctx.strokeStyle = night ? 'rgba(100,200,255,0.06)' : 'rgba(255,255,255,0.08)';
      ctx.beginPath(); ctx.moveTo(0, ROAD_Y); ctx.lineTo(W, ROAD_Y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, ROAD_Y + ROAD_H); ctx.lineTo(W, ROAD_Y + ROAD_H); ctx.stroke();

      // -- Sidewalk --
      ctx.fillStyle = night ? '#141c28' : '#3a3a3a';
      ctx.fillRect(0, ROAD_Y + ROAD_H, W, 6);

      // -- Buildings (sorted by x for consistent layering) --
      const sortedBuildings = [...st.buildings].sort((a, b2) => a.x - b2.x);
      sortedBuildings.forEach(b => drawBuilding(b, night, time));

      // -- Street lamps --
      for (let lx = 35; lx < W; lx += 90) {
        ctx.strokeStyle = night ? '#1a2535' : '#4a4a4a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(lx, ROAD_Y + ROAD_H + 6);
        ctx.lineTo(lx, GROUND_Y - 8);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(lx, GROUND_Y - 8);
        ctx.lineTo(lx + 5, GROUND_Y - 11);
        ctx.stroke();
        if (night) {
          const glow = ctx.createRadialGradient(lx + 5, GROUND_Y - 11, 0, lx + 5, GROUND_Y - 11, 20);
          glow.addColorStop(0, 'rgba(255,220,140,0.12)');
          glow.addColorStop(1, 'rgba(255,220,140,0)');
          ctx.fillStyle = glow;
          ctx.fillRect(lx - 15, GROUND_Y - 31, 40, 40);
          ctx.fillStyle = 'rgba(255,220,140,0.7)';
          ctx.beginPath(); ctx.arc(lx + 5, GROUND_Y - 11, 1.5, 0, Math.PI * 2); ctx.fill();
        } else {
          ctx.fillStyle = 'rgba(200,200,200,0.5)';
          ctx.beginPath(); ctx.arc(lx + 5, GROUND_Y - 11, 1.5, 0, Math.PI * 2); ctx.fill();
        }
      }

      // -- Cars --
      st.cars.forEach(car => {
        car.x += car.speed;
        const cy = ROAD_Y + 5;
        const cw = car.width;
        // Body
        ctx.fillStyle = car.color;
        ctx.fillRect(car.x, cy, cw, 4);
        ctx.fillRect(car.x + cw * 0.15, cy - 3, cw * 0.7, 3.5);
        // Car windows
        ctx.fillStyle = night ? 'rgba(140,200,255,0.3)' : 'rgba(180,220,255,0.5)';
        ctx.fillRect(car.x + cw * 0.2, cy - 2.5, cw * 0.25, 2.5);
        ctx.fillRect(car.x + cw * 0.52, cy - 2.5, cw * 0.2, 2.5);
        // Wheels
        ctx.fillStyle = '#0a0a0a';
        ctx.beginPath(); ctx.arc(car.x + cw * 0.2, cy + 4, 1.8, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(car.x + cw * 0.8, cy + 4, 1.8, 0, Math.PI * 2); ctx.fill();
        // Headlights / taillights
        if (night) {
          const front = car.speed > 0 ? car.x + cw : car.x - 2;
          const back = car.speed > 0 ? car.x - 1 : car.x + cw;
          ctx.fillStyle = 'rgba(255,255,190,0.7)';
          ctx.fillRect(front, cy + 0.5, 2, 1.5);
          ctx.fillStyle = 'rgba(255,40,40,0.6)';
          ctx.fillRect(back, cy + 0.5, 1.5, 1.5);
        }
      });
      // Remove off-screen cars and occasionally add new ones
      st.cars = st.cars.filter(c => c.x > -25 && c.x < W + 25);
      if (st.cars.length < 3 && Math.random() < 0.005) {
        st.cars.push({
          x: Math.random() > 0.5 ? -20 : W + 20,
          speed: (Math.random() > 0.5 ? 1 : -1) * (0.4 + Math.random() * 0.6),
          color: ['#64c8ff', '#ff5577', '#ffcc33', '#44dd66'][Math.floor(Math.random() * 4)],
          width: 12 + Math.random() * 4,
        });
      }

      // -- Neon ground reflection (night) --
      if (night) {
        ctx.fillStyle = 'rgba(100,200,255,0.02)';
        ctx.fillRect(0, ROAD_Y + ROAD_H + 6, W, H - ROAD_Y - ROAD_H - 6);
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('touchstart', handleTouch);
    };
  }, [buildMode, demolishMode, ROAD_Y]);

  const toggleDayNight = () => {
    setIsNight(prev => {
      stateRef.current.isNight = !prev;
      return !prev;
    });
  };

  const handleClear = () => {
    stateRef.current.buildings = [];
    setBuildingCount(0);
  };

  const handleReset = () => {
    initState();
  };

  const btnBase = {
    background: 'rgba(100,200,255,0.08)',
    border: '1px solid rgba(100,200,255,0.25)',
    color: '#64c8ff',
    padding: '4px 10px',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: 12,
    fontFamily: 'monospace',
    transition: 'background 0.2s',
  };

  const btnActive = {
    ...btnBase,
    background: 'rgba(100,200,255,0.2)',
    border: '1px solid #64c8ff',
    color: '#ffffff',
  };

  const btnDemolish = {
    ...btnBase,
    border: demolishMode ? '1px solid #ff5577' : '1px solid rgba(255,85,119,0.3)',
    color: demolishMode ? '#ffffff' : '#ff5577',
    background: demolishMode ? 'rgba(255,85,119,0.25)' : 'rgba(255,85,119,0.06)',
  };

  return (
    <div style={{ background: '#080c14', borderRadius: 8, padding: 12, maxWidth: 420 }}>
      {/* Toolbar row 1: building types */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
        {[
          { id: 'skyscraper', label: 'Skyscraper' },
          { id: 'house', label: 'House' },
          { id: 'factory', label: 'Factory' },
          { id: 'tower', label: 'Tower' },
        ].map(b => (
          <button
            key={b.id}
            style={!demolishMode && buildMode === b.id ? btnActive : btnBase}
            onClick={() => { setBuildMode(b.id); setDemolishMode(false); }}
          >
            {b.label}
          </button>
        ))}
        <button style={btnDemolish} onClick={() => setDemolishMode(d => !d)}>
          Demolish
        </button>
      </div>
      {/* Toolbar row 2: controls + counter */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8, alignItems: 'center' }}>
        <button style={btnBase} onClick={toggleDayNight}>
          {isNight ? 'Day Mode' : 'Night Mode'}
        </button>
        <button style={btnBase} onClick={handleClear}>Clear</button>
        <button style={btnBase} onClick={handleReset}>Reset</button>
        <span style={{
          color: '#64c8ff',
          fontSize: 12,
          fontFamily: 'monospace',
          marginLeft: 'auto',
          opacity: 0.7,
        }}>
          Buildings: {buildingCount}
        </span>
      </div>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          maxWidth: W,
          height: 'auto',
          borderRadius: 6,
          cursor: demolishMode ? 'crosshair' : 'pointer',
          display: 'block',
          touchAction: 'none',
          border: '1px solid rgba(100,200,255,0.1)',
        }}
      />
      <p style={{
        color: 'rgba(100,200,255,0.4)',
        fontSize: 11,
        fontFamily: 'monospace',
        textAlign: 'center',
        margin: '6px 0 0 0',
      }}>
        {demolishMode
          ? 'Click a building to demolish it'
          : 'Click above the road to place buildings'}
      </p>
    </div>
  );
};

export default CitySimulator;
