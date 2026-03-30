import React, { useRef, useEffect, useState, useCallback } from 'react';

const ACCENT = '#64c8ff';
const BG = '#050810';
const W_BASE = 500;
const H_BASE = 320;
const G = 0.5;
const TRAIL_MAX = 60;
const TRAIL_STAR = 8;

function massToColor(mass) {
  if (mass >= 200) return '#ff4444';
  if (mass >= 50) return '#ff9933';
  if (mass >= 15) return '#44cc66';
  return '#64c8ff';
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function makeStar(cx, cy) {
  return {
    x: cx, y: cy, vx: 0, vy: 0,
    mass: 800, radius: 12, color: '#febc2e',
    trail: [], isStar: true,
  };
}

const btnStyle = {
  fontFamily: 'var(--font-mono, monospace)',
  fontSize: '0.72rem',
  padding: '0.3rem 0.8rem',
  background: 'transparent',
  color: '#7a8ba5',
  border: '1px solid rgba(100, 200, 255, 0.2)',
  borderRadius: 4,
  cursor: 'pointer',
  transition: 'all 0.3s',
};

const btnActiveStyle = {
  ...btnStyle,
  background: 'rgba(100, 200, 255, 0.08)',
  borderColor: ACCENT,
  color: ACCENT,
};

const sliderLabelStyle = {
  fontFamily: 'var(--font-mono, monospace)',
  fontSize: '0.68rem',
  color: '#515c72',
  display: 'flex',
  alignItems: 'center',
  gap: '0.3rem',
};

const GravitySim = () => {
  const canvasRef = useRef(null);
  const bodiesRef = useRef([]);
  const zoomRef = useRef(1);
  const panRef = useRef({ x: 0, y: 0 });
  const heatmapCanvasRef = useRef(null);
  const [bodyCount, setBodyCount] = useState(0);
  const [spawnMass, setSpawnMass] = useState(5);
  const [showTrails, setShowTrails] = useState(true);
  const [showVectors, setShowVectors] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [zoom, setZoom] = useState(1);

  const screenToWorld = useCallback((sx, sy, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = W_BASE / rect.width;
    const scaleY = H_BASE / rect.height;
    const cx = W_BASE / 2;
    const cy = H_BASE / 2;
    const px = (sx - rect.left) * scaleX;
    const py = (sy - rect.top) * scaleY;
    const wx = (px - cx) / zoomRef.current + cx - panRef.current.x;
    const wy = (py - cy) / zoomRef.current + cy - panRef.current.y;
    return { x: wx, y: wy };
  }, []);

  const spawnBody = useCallback((x, y, mass, vxOverride, vyOverride) => {
    const bodies = bodiesRef.current;
    let bestBody = null;
    let bestMass = 0;
    bodies.forEach(b => { if (b.mass > bestMass) { bestMass = b.mass; bestBody = b; } });

    let vx, vy;
    if (vxOverride !== undefined) {
      vx = vxOverride;
      vy = vyOverride;
    } else if (bestBody) {
      const dx = x - bestBody.x;
      const dy = y - bestBody.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const speed = Math.sqrt(bestBody.mass / dist) * 0.8;
      vx = (-dy / dist) * speed + bestBody.vx + (Math.random() - 0.5) * 0.3;
      vy = (dx / dist) * speed + bestBody.vy + (Math.random() - 0.5) * 0.3;
    } else {
      vx = (Math.random() - 0.5) * 2;
      vy = (Math.random() - 0.5) * 2;
    }

    const radius = Math.max(2, Math.min(10, 2 + Math.pow(mass, 0.4)));
    const color = massToColor(mass);

    bodies.push({ x, y, vx, vy, mass, radius, color, trail: [], isStar: false });
    setBodyCount(bodies.length);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = W_BASE;
    canvas.height = H_BASE;

    const heatCanvas = document.createElement('canvas');
    heatCanvas.width = Math.floor(W_BASE / 8);
    heatCanvas.height = Math.floor(H_BASE / 8);
    heatmapCanvasRef.current = heatCanvas;

    let animId;
    let lastPinchDist = 0;
    if (bodiesRef.current.length === 0) {
      bodiesRef.current.push(makeStar(W_BASE / 2, H_BASE / 2));
      setBodyCount(1);
    }

    const handlePointer = (e) => {
      e.preventDefault();
      const { x, y } = screenToWorld(e.clientX, e.clientY, canvas);
      const massVal = parseFloat(canvas.dataset.spawnMass) || 5;
      spawnBody(x, y, massVal);
    };

    const handleWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.max(0.3, Math.min(5, zoomRef.current * delta));
      zoomRef.current = newZoom;
      setZoom(newZoom);
    };

    const handleTouchStart = (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        lastPinchDist = Math.sqrt(dx * dx + dy * dy);
      } else if (e.touches.length === 1) {
        e.preventDefault();
        const touch = e.touches[0];
        const { x, y } = screenToWorld(touch.clientX, touch.clientY, canvas);
        const massVal = parseFloat(canvas.dataset.spawnMass) || 5;
        spawnBody(x, y, massVal);
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (lastPinchDist > 0) {
          const ratio = dist / lastPinchDist;
          const newZoom = Math.max(0.3, Math.min(5, zoomRef.current * ratio));
          zoomRef.current = newZoom;
          setZoom(newZoom);
        }
        lastPinchDist = dist;
      }
    };

    const handleTouchEnd = () => {
      lastPinchDist = 0;
    };

    canvas.addEventListener('click', handlePointer);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);

    const renderHeatmap = (bodies) => {
      const hc = heatmapCanvasRef.current;
      const hctx = hc.getContext('2d');
      const sw = hc.width;
      const sh = hc.height;
      const imageData = hctx.createImageData(sw, sh);
      const data = imageData.data;
      const scaleX = W_BASE / sw;
      const scaleY = H_BASE / sh;

      for (let py = 0; py < sh; py++) {
        for (let px = 0; px < sw; px++) {
          const wx = px * scaleX;
          const wy = py * scaleY;
          let potential = 0;
          for (let i = 0; i < bodies.length; i++) {
            const dx = wx - bodies[i].x;
            const dy = wy - bodies[i].y;
            const distSq = dx * dx + dy * dy + 200;
            potential += bodies[i].mass / distSq;
          }
          const intensity = Math.min(1, potential * 8);
          const idx = (py * sw + px) * 4;
          data[idx] = Math.floor(20 * intensity);
          data[idx + 1] = Math.floor(60 * intensity);
          data[idx + 2] = Math.floor(120 * intensity);
          data[idx + 3] = Math.floor(80 * intensity);
        }
      }
      hctx.putImageData(imageData, 0, 0);
    };

    let frameCount = 0;

    const draw = () => {
      frameCount++;
      const currentZoom = zoomRef.current;
      const cx = W_BASE / 2;
      const cy = H_BASE / 2;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, W_BASE, H_BASE);

      const bodies = bodiesRef.current;

      // Read toggle states from dataset
      const trailsOn = canvas.dataset.showTrails === 'true';
      const vectorsOn = canvas.dataset.showVectors === 'true';
      const heatmapOn = canvas.dataset.showHeatmap === 'true';

      // Heatmap (rendered at lower res, every 4 frames for performance)
      if (heatmapOn && frameCount % 4 === 0) {
        renderHeatmap(bodies);
      }
      if (heatmapOn && heatmapCanvasRef.current) {
        ctx.save();
        ctx.setTransform(currentZoom, 0, 0, currentZoom, cx * (1 - currentZoom), cy * (1 - currentZoom));
        ctx.drawImage(heatmapCanvasRef.current, 0, 0, W_BASE, H_BASE);
        ctx.restore();
      }

      // Gravity
      for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
          const dx = bodies[j].x - bodies[i].x;
          const dy = bodies[j].y - bodies[i].y;
          const distSq = dx * dx + dy * dy + 100;
          const dist = Math.sqrt(distSq);
          const force = G * bodies[i].mass * bodies[j].mass / distSq;
          const fx = force * dx / dist;
          const fy = force * dy / dist;
          bodies[i].vx += fx / bodies[i].mass;
          bodies[i].vy += fy / bodies[i].mass;
          bodies[j].vx -= fx / bodies[j].mass;
          bodies[j].vy -= fy / bodies[j].mass;
        }
      }

      // Collision detection - merge overlapping bodies
      const toRemove = new Set();
      for (let i = 0; i < bodies.length; i++) {
        if (toRemove.has(i)) continue;
        for (let j = i + 1; j < bodies.length; j++) {
          if (toRemove.has(j)) continue;
          const dx = bodies[j].x - bodies[i].x;
          const dy = bodies[j].y - bodies[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = bodies[i].radius + bodies[j].radius;
          if (dist < minDist) {
            const a = bodies[i];
            const b = bodies[j];
            const totalMass = a.mass + b.mass;
            a.x = (a.x * a.mass + b.x * b.mass) / totalMass;
            a.y = (a.y * a.mass + b.y * b.mass) / totalMass;
            a.vx = (a.vx * a.mass + b.vx * b.mass) / totalMass;
            a.vy = (a.vy * a.mass + b.vy * b.mass) / totalMass;
            a.mass = totalMass;
            a.radius = Math.max(2, Math.min(20, 2 + Math.pow(totalMass, 0.4)));
            a.isStar = a.isStar || b.isStar;
            if (a.isStar) {
              a.color = '#febc2e';
            } else {
              a.color = massToColor(totalMass);
            }
            toRemove.add(j);
          }
        }
      }
      if (toRemove.size > 0) {
        bodiesRef.current = bodies.filter((_, idx) => !toRemove.has(idx));
      }

      const activeBodies = bodiesRef.current;

      // Update positions
      activeBodies.forEach(b => {
        b.x += b.vx;
        b.y += b.vy;
        b.trail.push({ x: b.x, y: b.y });
        const maxTrail = b.isStar ? TRAIL_STAR : TRAIL_MAX;
        if (b.trail.length > maxTrail) b.trail.shift();
      });

      // Apply zoom transform for drawing
      ctx.save();
      ctx.setTransform(currentZoom, 0, 0, currentZoom, cx * (1 - currentZoom), cy * (1 - currentZoom));

      // Draw trails
      if (trailsOn) {
        activeBodies.forEach(b => {
          if (b.trail.length < 2) return;
          const rgb = hexToRgb(b.color);
          for (let i = 1; i < b.trail.length; i++) {
            const alpha = (i / b.trail.length) * (b.isStar ? 0.12 : 0.35);
            ctx.beginPath();
            ctx.moveTo(b.trail[i - 1].x, b.trail[i - 1].y);
            ctx.lineTo(b.trail[i].x, b.trail[i].y);
            ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`;
            ctx.lineWidth = b.isStar ? 3 : Math.max(0.5, b.radius * 0.5);
            ctx.stroke();
          }
        });
      }

      // Draw bodies
      activeBodies.forEach(b => {
        ctx.save();
        ctx.shadowColor = b.color;
        ctx.shadowBlur = b.isStar ? 25 : 8;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.fill();
        ctx.restore();
      });

      // Draw velocity vectors
      if (vectorsOn) {
        activeBodies.forEach(b => {
          const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
          if (speed < 0.05) return;
          const arrowLen = Math.min(25, speed * 8);
          const nx = b.vx / speed;
          const ny = b.vy / speed;
          const tipX = b.x + nx * (b.radius + arrowLen);
          const tipY = b.y + ny * (b.radius + arrowLen);
          const baseX = b.x + nx * (b.radius + 2);
          const baseY = b.y + ny * (b.radius + 2);

          ctx.beginPath();
          ctx.moveTo(baseX, baseY);
          ctx.lineTo(tipX, tipY);
          ctx.strokeStyle = 'rgba(100, 200, 255, 0.5)';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Arrowhead
          const headLen = 4;
          const angle = Math.atan2(ny, nx);
          ctx.beginPath();
          ctx.moveTo(tipX, tipY);
          ctx.lineTo(tipX - headLen * Math.cos(angle - 0.5), tipY - headLen * Math.sin(angle - 0.5));
          ctx.moveTo(tipX, tipY);
          ctx.lineTo(tipX - headLen * Math.cos(angle + 0.5), tipY - headLen * Math.sin(angle + 0.5));
          ctx.strokeStyle = 'rgba(100, 200, 255, 0.5)';
          ctx.lineWidth = 1;
          ctx.stroke();
        });
      }

      ctx.restore(); // end zoom transform

      // Remove escaped bodies
      const margin = 200 / currentZoom;
      bodiesRef.current = activeBodies.filter(b =>
        b.isStar || (b.x > -margin && b.x < W_BASE + margin && b.y > -margin && b.y < H_BASE + margin)
      );

      setBodyCount(bodiesRef.current.length);
      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('click', handlePointer);
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [screenToWorld, spawnBody]);

  const reset = () => {
    bodiesRef.current = [makeStar(W_BASE / 2, H_BASE / 2)];
    zoomRef.current = 1;
    panRef.current = { x: 0, y: 0 };
    setZoom(1);
    setBodyCount(1);
  };

  const spawnOrbiter = () => {
    const bodies = bodiesRef.current;
    let largest = null;
    let largestMass = 0;
    bodies.forEach(b => { if (b.mass > largestMass) { largestMass = b.mass; largest = b; } });
    if (!largest) return;

    const angle = Math.random() * Math.PI * 2;
    const orbitR = 40 + Math.random() * 60;
    const ox = largest.x + Math.cos(angle) * orbitR;
    const oy = largest.y + Math.sin(angle) * orbitR;
    const speed = Math.sqrt(G * largest.mass / orbitR);
    const vx = -Math.sin(angle) * speed + largest.vx;
    const vy = Math.cos(angle) * speed + largest.vy;
    const mass = 2 + Math.random() * 4;

    spawnBody(ox, oy, mass, vx, vy);
  };

  // Sync React state to canvas dataset for the animation loop to read
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.dataset.showTrails = showTrails;
      canvas.dataset.showVectors = showVectors;
      canvas.dataset.showHeatmap = showHeatmap;
      canvas.dataset.spawnMass = spawnMass;
    }
  }, [showTrails, showVectors, showHeatmap, spawnMass]);

  return (
    <div>
      <div className="city-sim__toolbar" style={{ marginBottom: '0.5rem' }}>
        <span className="city-sim__pop">Bodies: {bodyCount}</span>
        <span className="city-sim__pop" style={{ marginLeft: 0 }}>Zoom: {zoom.toFixed(1)}x</span>
        <button className="constellation-clear" onClick={reset}>Reset</button>
        <button
          style={btnStyle}
          onMouseEnter={e => { e.target.style.borderColor = ACCENT; e.target.style.color = ACCENT; }}
          onMouseLeave={e => { e.target.style.borderColor = 'rgba(100,200,255,0.2)'; e.target.style.color = '#7a8ba5'; }}
          onClick={spawnOrbiter}
        >
          Spawn Orbiter
        </button>
      </div>

      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          style={showTrails ? btnActiveStyle : btnStyle}
          onClick={() => setShowTrails(v => !v)}
        >
          Trails
        </button>
        <button
          style={showVectors ? btnActiveStyle : btnStyle}
          onClick={() => setShowVectors(v => !v)}
        >
          Vectors
        </button>
        <button
          style={showHeatmap ? btnActiveStyle : btnStyle}
          onClick={() => setShowHeatmap(v => !v)}
        >
          Gravity Field
        </button>
        <span style={sliderLabelStyle}>
          Mass: {spawnMass}
          <input
            type="range"
            min="1"
            max="200"
            value={spawnMass}
            onChange={e => setSpawnMass(Number(e.target.value))}
            style={{
              width: 80,
              accentColor: ACCENT,
              cursor: 'pointer',
            }}
          />
        </span>
      </div>

      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          maxWidth: W_BASE,
          height: 'auto',
          borderRadius: 8,
          cursor: 'crosshair',
          display: 'block',
          background: BG,
          touchAction: 'none',
        }}
      />

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
        marginTop: '0.4rem',
        flexWrap: 'wrap',
      }}>
        <span style={{ ...sliderLabelStyle, gap: '0.5rem' }}>
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#64c8ff' }} /> Small
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#44cc66' }} /> Med
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#ff9933' }} /> Large
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#ff4444' }} /> Huge
        </span>
      </div>

      <p className="city-sim__hint" style={{
        textAlign: 'center',
        color: '#515c72',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.72rem',
        marginTop: '0.3rem',
      }}>
        Click/tap to spawn bodies -- scroll/pinch to zoom -- mass slider controls new body size
      </p>
    </div>
  );
};

export default GravitySim;
