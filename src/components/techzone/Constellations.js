import React, { useRef, useEffect, useState, useCallback } from 'react';

const ACCENT = '#64c8ff';
const ACCENT_RGB = '100, 200, 255';

const Constellations = () => {
  const canvasRef = useRef(null);
  const starsRef = useRef([]);
  const blackHolesRef = useRef([]);
  const shootingStarsRef = useRef([]);
  const bgStarsRef = useRef([]);
  const nebulaeRef = useRef([]);
  const milkyWayRef = useRef([]);
  const timeRef = useRef(0);
  const modeRef = useRef('star');
  const [mode, setMode] = useState('star');
  const [starCount, setStarCount] = useState(0);
  const [blackHoleCount, setBlackHoleCount] = useState(0);

  const switchMode = useCallback((m) => {
    modeRef.current = m;
    setMode(m);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;

    // ---- Generate background elements ----
    const generateBackground = () => {
      const w = canvas.width;
      const h = canvas.height;

      // Background stars - lots of them, varying sizes and colors
      const bg = [];
      for (let i = 0; i < 300; i++) {
        const temp = Math.random();
        let color;
        if (temp < 0.15) color = '255, 200, 150'; // warm
        else if (temp < 0.3) color = '150, 180, 255'; // cool blue
        else if (temp < 0.4) color = '255, 255, 200'; // yellow
        else color = '210, 220, 240'; // white-ish
        bg.push({
          x: Math.random() * w,
          y: Math.random() * h,
          size: Math.random() * 1.6 + 0.2,
          twinklePhase: Math.random() * Math.PI * 2,
          twinkleSpeed: Math.random() * 0.04 + 0.005,
          baseAlpha: Math.random() * 0.4 + 0.15,
          color,
        });
      }
      bgStarsRef.current = bg;

      // Nebula clouds - subtle colored gas regions
      const neb = [];
      const nebulaColors = [
        { r: 80, g: 40, b: 120 },  // purple
        { r: 30, g: 60, b: 120 },  // deep blue
        { r: 120, g: 40, b: 60 },  // crimson
        { r: 20, g: 80, b: 100 },  // teal
        { r: 100, g: 60, b: 30 },  // amber dust
      ];
      for (let i = 0; i < 5; i++) {
        const col = nebulaColors[i % nebulaColors.length];
        neb.push({
          x: Math.random() * w,
          y: Math.random() * h,
          radius: 80 + Math.random() * 160,
          color: col,
          alpha: 0.015 + Math.random() * 0.025,
          drift: Math.random() * 0.1 - 0.05,
        });
      }
      nebulaeRef.current = neb;

      // Milky Way band - a dense belt of tiny stars and dust
      const mw = [];
      const bandAngle = -0.3;
      const bandCenterY = h * 0.45;
      const bandWidth = h * 0.25;
      for (let i = 0; i < 600; i++) {
        const along = Math.random() * (w + 200) - 100;
        // Gaussian-ish concentration toward center
        const gauss = Math.pow(Math.random(), 0.6) * (Math.random() < 0.5 ? 1 : -1);
        const finalAcross = gauss * bandWidth * 0.5;
        const bx = along;
        const by = bandCenterY + finalAcross + Math.sin(along * 0.005) * 30;
        // Rotate around center
        const cx = w / 2;
        const cy = bandCenterY;
        const dx = bx - cx;
        const dy = by - cy;
        const rx = cx + dx * Math.cos(bandAngle) - dy * Math.sin(bandAngle);
        const ry = cy + dx * Math.sin(bandAngle) + dy * Math.cos(bandAngle);
        if (rx < -50 || rx > w + 50 || ry < -50 || ry > h + 50) continue;
        const isDust = Math.random() < 0.3;
        mw.push({
          x: rx,
          y: ry,
          size: isDust ? Math.random() * 2.5 + 0.5 : Math.random() * 0.9 + 0.1,
          alpha: isDust ? 0.02 + Math.random() * 0.03 : 0.1 + Math.random() * 0.3,
          isDust,
          twinklePhase: Math.random() * Math.PI * 2,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
        });
      }
      milkyWayRef.current = mw;
    };

    const resize = () => {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = 500;
      generateBackground();
    };
    resize();
    window.addEventListener('resize', resize);

    // ---- Spawn random shooting stars periodically ----
    const spawnShootingStar = () => {
      const w = canvas.width;
      const h = canvas.height;
      const fromLeft = Math.random() < 0.5;
      const angle = (Math.random() * 0.6 + 0.2) * (fromLeft ? 1 : -1);
      const speed = 6 + Math.random() * 8;
      shootingStarsRef.current.push({
        x: fromLeft ? -10 : w + 10,
        y: Math.random() * h * 0.6,
        vx: Math.cos(angle) * speed * (fromLeft ? 1 : -1),
        vy: Math.abs(Math.sin(angle)) * speed,
        life: 50 + Math.random() * 40,
        maxLife: 90,
        trail: [],
        brightness: 0.7 + Math.random() * 0.3,
      });
    };

    let shootingTimer = setInterval(() => {
      if (Math.random() < 0.6) spawnShootingStar();
    }, 2000);

    // ---- Input handling ----
    const handleInteraction = (clientX, clientY) => {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      if (modeRef.current === 'star') {
        starsRef.current.push({
          x, y,
          size: 3.5,
          pulse: Math.random() * Math.PI * 2,
          born: Date.now(),
          sparkles: Array.from({ length: 6 }, () => ({
            angle: Math.random() * Math.PI * 2,
            dist: 8 + Math.random() * 12,
            size: 0.5 + Math.random() * 1,
            speed: Math.random() * 0.02 + 0.005,
            phase: Math.random() * Math.PI * 2,
          })),
        });
        setStarCount(starsRef.current.length);

        // Chance of a shooting star on star placement
        if (Math.random() < 0.35) spawnShootingStar();
      } else if (modeRef.current === 'blackhole') {
        blackHolesRef.current.push({
          x, y,
          radius: 0.1,
          targetRadius: 25 + Math.random() * 15,
          mass: 1800 + Math.random() * 1200,
          born: Date.now(),
          rotation: 0,
          ringParticles: Array.from({ length: 40 }, (_, i) => ({
            angle: (i / 40) * Math.PI * 2 + Math.random() * 0.3,
            dist: 1,
            speed: 0.02 + Math.random() * 0.03,
            size: 0.4 + Math.random() * 1.2,
            alpha: 0.3 + Math.random() * 0.5,
          })),
        });
        setBlackHoleCount(blackHolesRef.current.length);
      }
    };

    const handleClick = (e) => {
      handleInteraction(e.clientX, e.clientY);
    };
    const handleTouch = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (touch) handleInteraction(touch.clientX, touch.clientY);
    };

    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('touchstart', handleTouch, { passive: false });

    // ---- Main render loop ----
    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      timeRef.current += 1;
      const t = timeRef.current;

      // Deep space background
      ctx.fillStyle = '#030810';
      ctx.fillRect(0, 0, w, h);

      // Subtle radial depth
      const depthGrad = ctx.createRadialGradient(w * 0.5, h * 0.4, 0, w * 0.5, h * 0.4, w * 0.7);
      depthGrad.addColorStop(0, 'rgba(10, 18, 40, 0.4)');
      depthGrad.addColorStop(1, 'rgba(3, 8, 16, 0)');
      ctx.fillStyle = depthGrad;
      ctx.fillRect(0, 0, w, h);

      // ---- Nebula clouds ----
      nebulaeRef.current.forEach(nb => {
        nb.x += nb.drift;
        if (nb.x < -nb.radius) nb.x = w + nb.radius;
        if (nb.x > w + nb.radius) nb.x = -nb.radius;
        const pulsing = nb.alpha + Math.sin(t * 0.008) * 0.005;
        const grad = ctx.createRadialGradient(nb.x, nb.y, 0, nb.x, nb.y, nb.radius);
        grad.addColorStop(0, `rgba(${nb.color.r}, ${nb.color.g}, ${nb.color.b}, ${pulsing})`);
        grad.addColorStop(0.5, `rgba(${nb.color.r}, ${nb.color.g}, ${nb.color.b}, ${pulsing * 0.4})`);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(nb.x, nb.y, nb.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // ---- Milky Way band ----
      milkyWayRef.current.forEach(s => {
        s.twinklePhase += s.twinkleSpeed;
        const flicker = s.isDust ? 1 : (0.6 + Math.sin(s.twinklePhase) * 0.4);
        const a = s.alpha * flicker;
        if (s.isDust) {
          ctx.fillStyle = `rgba(180, 170, 200, ${a})`;
        } else {
          ctx.fillStyle = `rgba(220, 225, 240, ${a})`;
        }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // ---- Background stars (twinkling) ----
      bgStarsRef.current.forEach(s => {
        s.twinklePhase += s.twinkleSpeed;
        const alpha = s.baseAlpha + Math.sin(s.twinklePhase) * s.baseAlpha * 0.6;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${s.color}, ${Math.max(0, alpha)})`;
        ctx.fill();
        // Faint cross-spike on brighter stars
        if (s.size > 1.0) {
          const spikeAlpha = alpha * 0.3;
          ctx.strokeStyle = `rgba(${s.color}, ${spikeAlpha})`;
          ctx.lineWidth = 0.3;
          ctx.beginPath();
          ctx.moveTo(s.x - s.size * 3, s.y);
          ctx.lineTo(s.x + s.size * 3, s.y);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(s.x, s.y - s.size * 3);
          ctx.lineTo(s.x, s.y + s.size * 3);
          ctx.stroke();
        }
      });

      // ---- Black holes: gravitational warp applied to constellation stars ----
      const blackHoles = blackHolesRef.current;
      blackHoles.forEach(bh => {
        // Grow radius to target
        bh.radius += (bh.targetRadius - bh.radius) * 0.05;
        bh.rotation += 0.015;

        const r = bh.radius;

        // Gravitational lensing ring (Einstein ring)
        ctx.save();
        const lensRadius = r * 2.2;
        const lensGrad = ctx.createRadialGradient(bh.x, bh.y, r * 0.9, bh.x, bh.y, lensRadius);
        lensGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        lensGrad.addColorStop(0.3, `rgba(${ACCENT_RGB}, 0.06)`);
        lensGrad.addColorStop(0.6, `rgba(${ACCENT_RGB}, 0.12)`);
        lensGrad.addColorStop(0.8, `rgba(${ACCENT_RGB}, 0.04)`);
        lensGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = lensGrad;
        ctx.beginPath();
        ctx.arc(bh.x, bh.y, lensRadius, 0, Math.PI * 2);
        ctx.fill();

        // Accretion disk - swirling ring of particles
        bh.ringParticles.forEach(p => {
          p.angle += p.speed;
          p.dist += (r * 1.6 - p.dist) * 0.03;
          const wobble = Math.sin(p.angle * 3 + t * 0.05) * r * 0.15;
          const px = bh.x + Math.cos(p.angle + bh.rotation) * (p.dist + wobble);
          const py = bh.y + Math.sin(p.angle + bh.rotation) * (p.dist + wobble) * 0.35;
          ctx.beginPath();
          ctx.arc(px, py, p.size, 0, Math.PI * 2);
          const hue = 190 + Math.sin(p.angle) * 30;
          ctx.fillStyle = `hsla(${hue}, 80%, 65%, ${p.alpha * (0.6 + Math.sin(t * 0.03 + p.angle) * 0.4)})`;
          ctx.fill();
        });

        // Event horizon (solid black center)
        const eventGrad = ctx.createRadialGradient(bh.x, bh.y, 0, bh.x, bh.y, r);
        eventGrad.addColorStop(0, 'rgba(0, 0, 0, 1)');
        eventGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.98)');
        eventGrad.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
        ctx.fillStyle = eventGrad;
        ctx.beginPath();
        ctx.arc(bh.x, bh.y, r, 0, Math.PI * 2);
        ctx.fill();

        // Subtle glow at the edge
        ctx.strokeStyle = `rgba(${ACCENT_RGB}, 0.15)`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(bh.x, bh.y, r * 1.05, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
      });

      // ---- Gravitational lensing: warp user stars near black holes ----
      const userStars = starsRef.current;
      const getWarpedPos = (sx, sy) => {
        let wx = sx;
        let wy = sy;
        blackHoles.forEach(bh => {
          const dx = sx - bh.x;
          const dy = sy - bh.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < bh.mass * 0.15 && dist > bh.radius) {
            const force = bh.mass / (dist * dist) * 8;
            wx -= dx * force * 0.01;
            wy -= dy * force * 0.01;
          }
        });
        return { x: wx, y: wy };
      };

      // ---- Constellation lines (between user stars) ----
      for (let i = 0; i < userStars.length; i++) {
        for (let j = i + 1; j < userStars.length; j++) {
          const a = getWarpedPos(userStars[i].x, userStars[i].y);
          const b = getWarpedPos(userStars[j].x, userStars[j].y);
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            const alpha = (1 - dist / 180) * 0.6;
            ctx.save();
            ctx.shadowColor = ACCENT;
            ctx.shadowBlur = 4;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(${ACCENT_RGB}, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      // ---- User-placed stars (glowing, with sparkle halo) ----
      userStars.forEach(s => {
        s.pulse += 0.04;
        const warped = getWarpedPos(s.x, s.y);
        const wx = warped.x;
        const wy = warped.y;
        const glowSize = 4 + Math.sin(s.pulse) * 1.5;

        ctx.save();

        // Outer halo glow
        const haloGrad = ctx.createRadialGradient(wx, wy, 0, wx, wy, 20);
        haloGrad.addColorStop(0, `rgba(${ACCENT_RGB}, 0.15)`);
        haloGrad.addColorStop(0.5, `rgba(${ACCENT_RGB}, 0.04)`);
        haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(wx, wy, 20, 0, Math.PI * 2);
        ctx.fill();

        // Cross-shaped diffraction spikes
        ctx.strokeStyle = `rgba(${ACCENT_RGB}, ${0.2 + Math.sin(s.pulse) * 0.1})`;
        ctx.lineWidth = 0.6;
        const spikeLen = glowSize * 4;
        ctx.beginPath();
        ctx.moveTo(wx - spikeLen, wy);
        ctx.lineTo(wx + spikeLen, wy);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(wx, wy - spikeLen);
        ctx.lineTo(wx, wy + spikeLen);
        ctx.stroke();

        // Orbiting sparkle particles
        s.sparkles.forEach(sp => {
          sp.phase += sp.speed;
          const sa = sp.angle + t * sp.speed * 2;
          const sd = sp.dist + Math.sin(sp.phase * 3) * 2;
          const spx = wx + Math.cos(sa) * sd;
          const spy = wy + Math.sin(sa) * sd;
          const spAlpha = 0.3 + Math.sin(sp.phase) * 0.2;
          ctx.beginPath();
          ctx.arc(spx, spy, sp.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${ACCENT_RGB}, ${spAlpha})`;
          ctx.fill();
        });

        // Main star body
        ctx.shadowColor = ACCENT;
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.arc(wx, wy, glowSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${ACCENT_RGB}, 0.2)`;
        ctx.fill();

        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(wx, wy, s.size, 0, Math.PI * 2);
        ctx.fillStyle = '#dceeff';
        ctx.fill();

        // Bright white core
        ctx.beginPath();
        ctx.arc(wx, wy, s.size * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        ctx.restore();
      });

      // ---- Shooting stars ----
      shootingStarsRef.current.forEach(ss => {
        ss.trail.push({ x: ss.x, y: ss.y });
        if (ss.trail.length > 25) ss.trail.shift();
        ss.x += ss.vx;
        ss.y += ss.vy;
        ss.life--;
        const lifeFrac = ss.life / ss.maxLife;

        // Trail
        for (let i = 0; i < ss.trail.length; i++) {
          const frac = i / ss.trail.length;
          const trailAlpha = frac * lifeFrac * ss.brightness * 0.7;
          const trailWidth = frac * 2.5;
          ctx.beginPath();
          ctx.arc(ss.trail[i].x, ss.trail[i].y, trailWidth, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(200, 230, 255, ${trailAlpha})`;
          ctx.fill();
        }

        // Head with glow
        ctx.save();
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(ss.x, ss.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${lifeFrac})`;
        ctx.fill();

        // Warm glow halo on the head
        const headGrad = ctx.createRadialGradient(ss.x, ss.y, 0, ss.x, ss.y, 8);
        headGrad.addColorStop(0, `rgba(200, 230, 255, ${lifeFrac * 0.4})`);
        headGrad.addColorStop(1, 'rgba(200, 230, 255, 0)');
        ctx.fillStyle = headGrad;
        ctx.beginPath();
        ctx.arc(ss.x, ss.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      shootingStarsRef.current = shootingStarsRef.current.filter(
        ss => ss.life > 0 && ss.x > -50 && ss.x < w + 50 && ss.y < h + 50
      );

      // ---- Vignette overlay ----
      const vignette = ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, w * 0.75);
      vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vignette.addColorStop(1, 'rgba(0, 0, 0, 0.35)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(shootingTimer);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('touchstart', handleTouch);
    };
  }, []);

  const clearAll = () => {
    starsRef.current = [];
    blackHolesRef.current = [];
    setStarCount(0);
    setBlackHoleCount(0);
  };

  const btnBase = {
    background: 'transparent',
    border: `1px solid ${ACCENT}`,
    color: ACCENT,
    padding: '6px 14px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13,
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
  };

  const btnActive = {
    ...btnBase,
    background: ACCENT,
    color: '#0a0e1a',
    fontWeight: 600,
  };

  return (
    <div style={{ position: 'relative' }}>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: 500,
          borderRadius: 12,
          cursor: 'crosshair',
          display: 'block',
          touchAction: 'none',
        }}
      />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 4px',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => switchMode('star')}
            style={mode === 'star' ? btnActive : btnBase}
          >
            Place Stars
          </button>
          <button
            onClick={() => switchMode('blackhole')}
            style={mode === 'blackhole' ? btnActive : btnBase}
          >
            Black Hole
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: '#8899aa', fontSize: 13 }}>
            {starCount} star{starCount !== 1 ? 's' : ''}
            {blackHoleCount > 0 &&
              ` / ${blackHoleCount} black hole${blackHoleCount !== 1 ? 's' : ''}`}
          </span>
          {(starCount > 0 || blackHoleCount > 0) && (
            <button onClick={clearAll} style={btnBase}>
              Clear All
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Constellations;
