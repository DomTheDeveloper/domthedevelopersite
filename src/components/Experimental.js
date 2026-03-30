import React, { useEffect, useRef, useState, useCallback } from 'react';

/* ── helpers ── */
const rand = (a, b) => a + Math.random() * (b - a);
const randInt = (a, b) => Math.floor(rand(a, b));

/* ══════════════════════════════════════════════
   WEATHER OVERLAY – rain or snow over the page
   ══════════════════════════════════════════════ */
const WeatherOverlay = ({ type, onStop }) => {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = document.documentElement.scrollHeight);

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = document.documentElement.scrollHeight;
    };
    window.addEventListener('resize', resize);

    const count = type === 'rain' ? 400 : 200;
    particles.current = Array.from({ length: count }, () => ({
      x: rand(0, w),
      y: rand(-h, h),
      speed: type === 'rain' ? rand(12, 22) : rand(1, 3),
      size: type === 'rain' ? rand(1, 2.5) : rand(2, 5),
      drift: type === 'snow' ? rand(-0.5, 0.5) : 0,
      opacity: rand(0.3, 1),
    }));

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const scrollY = window.scrollY;
      for (const p of particles.current) {
        p.y += p.speed;
        p.x += p.drift;
        if (p.y > scrollY + window.innerHeight + 20) {
          p.y = scrollY - 20;
          p.x = rand(0, w);
        }
        if (type === 'rain') {
          ctx.strokeStyle = `rgba(174, 194, 224, ${p.opacity})`;
          ctx.lineWidth = p.size * 0.5;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x, p.y + 12 + p.speed);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
          ctx.fill();
        }
      }
      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);

    const timer = setTimeout(onStop, 15000);
    return () => {
      cancelAnimationFrame(animRef.current);
      clearTimeout(timer);
      window.removeEventListener('resize', resize);
    };
  }, [type, onStop]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute', top: 0, left: 0, width: '100%',
        height: '100%', pointerEvents: 'none', zIndex: 9998,
      }}
    />
  );
};

/* ══════════════════════════════════════════════
   ALIEN ABDUCTION – pixelated aliens & UFOs
   ══════════════════════════════════════════════ */
const AlienAbduction = ({ onDone }) => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    window.addEventListener('resize', resize);

    const ufos = Array.from({ length: 5 }, () => ({
      x: rand(-100, w + 100), y: rand(-200, -60),
      targetY: rand(80, h * 0.4),
      size: rand(40, 70), speed: rand(1, 2.5),
      wobble: rand(0, Math.PI * 2), beamOn: false, beamTimer: 0,
    }));

    const aliens = Array.from({ length: 12 }, () => ({
      x: rand(20, w - 20), y: h + rand(20, 100),
      targetY: rand(h * 0.3, h * 0.8),
      size: rand(16, 28), speed: rand(0.5, 1.5),
      frame: 0, color: ['#4f4', '#4ff', '#f4f', '#ff4'][randInt(0, 4)],
    }));

    let time = 0;
    let phase = 0; // 0=enter, 1=abduct, 2=exit
    let phaseTimer = 0;
    // Shake the page
    const origTransform = document.body.style.transform;
    let shakeAmount = 0;

    const drawPixelAlien = (x, y, s, color, frame) => {
      const p = s / 8;
      ctx.fillStyle = color;
      // body
      const bodyPattern = [
        [0,0,1,1,1,1,0,0],
        [0,1,1,1,1,1,1,0],
        [1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1],
        [0,1,0,1,1,0,1,0],
        [0,0,1,0,0,1,0,0],
        frame % 2 === 0 ? [0,1,0,0,0,0,1,0] : [1,0,0,0,0,0,0,1],
      ];
      for (let row = 0; row < bodyPattern.length; row++) {
        for (let col = 0; col < 8; col++) {
          if (bodyPattern[row][col]) {
            ctx.fillRect(x - s/2 + col * p, y - s/2 + row * p, p + 0.5, p + 0.5);
          }
        }
      }
      // eyes
      ctx.fillStyle = '#000';
      ctx.fillRect(x - s/2 + 2*p, y - s/2 + 2*p, p, p);
      ctx.fillRect(x - s/2 + 5*p, y - s/2 + 2*p, p, p);
      // eye shine
      ctx.fillStyle = '#fff';
      ctx.fillRect(x - s/2 + 2*p, y - s/2 + 2*p, p*0.4, p*0.4);
      ctx.fillRect(x - s/2 + 5*p, y - s/2 + 2*p, p*0.4, p*0.4);
    };

    const drawUFO = (ufo) => {
      const { x, y, size } = ufo;
      // dome
      ctx.fillStyle = 'rgba(180, 255, 200, 0.6)';
      ctx.beginPath();
      ctx.ellipse(x, y - size * 0.15, size * 0.35, size * 0.3, 0, Math.PI, 0);
      ctx.fill();
      // body
      const grad = ctx.createLinearGradient(x - size/2, y, x + size/2, y);
      grad.addColorStop(0, '#666');
      grad.addColorStop(0.5, '#ccc');
      grad.addColorStop(1, '#666');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(x, y, size * 0.6, size * 0.18, 0, 0, Math.PI * 2);
      ctx.fill();
      // rim lights
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + time * 3;
        const lx = x + Math.cos(angle) * size * 0.5;
        const ly = y + Math.sin(angle) * size * 0.08;
        ctx.fillStyle = `hsl(${(time * 100 + i * 60) % 360}, 100%, 60%)`;
        ctx.beginPath();
        ctx.arc(lx, ly, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      // tractor beam
      if (ufo.beamOn) {
        const grad2 = ctx.createLinearGradient(x, y, x, h);
        grad2.addColorStop(0, 'rgba(100, 255, 150, 0.3)');
        grad2.addColorStop(1, 'rgba(100, 255, 150, 0)');
        ctx.fillStyle = grad2;
        ctx.beginPath();
        ctx.moveTo(x - size * 0.3, y + size * 0.15);
        ctx.lineTo(x - size * 0.8, h);
        ctx.lineTo(x + size * 0.8, h);
        ctx.lineTo(x + size * 0.3, y + size * 0.15);
        ctx.closePath();
        ctx.fill();
      }
    };

    const draw = () => {
      time += 0.016;
      phaseTimer += 0.016;
      ctx.clearRect(0, 0, w, h);

      // Phase transitions
      if (phase === 0 && phaseTimer > 2) { phase = 1; phaseTimer = 0; }
      if (phase === 1 && phaseTimer > 5) { phase = 2; phaseTimer = 0; }
      if (phase === 2 && phaseTimer > 3) {
        document.body.style.transform = origTransform;
        onDone();
        return;
      }

      // UFOs
      for (const ufo of ufos) {
        ufo.wobble += 0.02;
        if (phase === 0) {
          ufo.y += (ufo.targetY - ufo.y) * 0.02;
        } else if (phase === 1) {
          ufo.beamOn = true;
          ufo.x += Math.sin(ufo.wobble) * 0.5;
        } else {
          ufo.beamOn = false;
          ufo.y -= 4;
        }
        drawUFO(ufo);
      }

      // Aliens
      for (const alien of aliens) {
        if (phase === 0 || phase === 1) {
          alien.y += (alien.targetY - alien.y) * 0.015;
          alien.x += Math.sin(time * 2 + alien.x) * 0.3;
        } else {
          alien.y -= 3;
        }
        alien.frame = Math.floor(time * 3);
        drawPixelAlien(alien.x, alien.y, alien.size, alien.color, alien.frame);
      }

      // Page shake during abduction
      if (phase === 1) {
        shakeAmount = Math.min(shakeAmount + 0.1, 4);
        const sx = (Math.random() - 0.5) * shakeAmount;
        const sy = (Math.random() - 0.5) * shakeAmount;
        document.body.style.transform = `translate(${sx}px, ${sy}px)`;
      } else {
        document.body.style.transform = origTransform || '';
      }

      // Flying saucer text
      if (phase === 1) {
        ctx.font = `bold ${14 + Math.sin(time * 5) * 2}px monospace`;
        ctx.fillStyle = `rgba(100, 255, 150, ${0.5 + Math.sin(time * 3) * 0.3})`;
        ctx.textAlign = 'center';
        ctx.fillText('ABDUCTING WEBSITE DATA...', w / 2, h - 40);
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      document.body.style.transform = origTransform || '';
      window.removeEventListener('resize', resize);
    };
  }, [onDone]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 9999,
      }}
    />
  );
};

/* ══════════════════════════════════════════════
   SELF DESTRUCT – explosions → white page
   ══════════════════════════════════════════════ */
const SelfDestruct = ({ onRestore }) => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const [whiteOut, setWhiteOut] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const explosions = [];
    let time = 0;
    let whiteOpacity = 0;
    let done = false;

    const spawnExplosion = (x, y) => {
      const parts = Array.from({ length: 30 }, () => ({
        x, y,
        vx: (Math.random() - 0.5) * rand(4, 14),
        vy: (Math.random() - 0.5) * rand(4, 14),
        r: rand(3, 10),
        life: 1,
        decay: rand(0.01, 0.03),
        color: `hsl(${randInt(0, 40)}, 100%, ${randInt(45, 70)}%)`,
      }));
      explosions.push(...parts);
    };

    // Schedule random explosions over 9 seconds
    const timers = [];
    for (let i = 0; i < 40; i++) {
      timers.push(setTimeout(() => {
        spawnExplosion(rand(50, w - 50), rand(50, h - 50));
      }, i * 225 + rand(0, 100)));
    }

    // Page shake
    const origTransform = document.body.style.transform;
    let shake = 0;

    // Screen crack lines
    const cracks = [];
    for (let i = 0; i < 12; i++) {
      timers.push(setTimeout(() => {
        const cx = rand(0, w), cy = rand(0, h);
        const segs = randInt(4, 10);
        const pts = [{ x: cx, y: cy }];
        for (let s = 0; s < segs; s++) {
          const prev = pts[pts.length - 1];
          pts.push({ x: prev.x + rand(-80, 80), y: prev.y + rand(-80, 80) });
        }
        cracks.push({ pts, opacity: 1 });
      }, 1000 + i * 600));
    }

    // Warning sirens - red flash
    let sirenOn = false;
    const sirenInterval = setInterval(() => { sirenOn = !sirenOn; }, 300);

    const draw = () => {
      if (done) return;
      time += 0.016;
      ctx.clearRect(0, 0, w, h);

      // Red siren flash
      if (sirenOn && time < 9) {
        ctx.fillStyle = `rgba(255, 0, 0, ${0.05 + time * 0.01})`;
        ctx.fillRect(0, 0, w, h);
      }

      // Draw cracks
      for (const crack of cracks) {
        ctx.strokeStyle = `rgba(255, 100, 50, ${crack.opacity})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(crack.pts[0].x, crack.pts[0].y);
        for (let i = 1; i < crack.pts.length; i++) {
          ctx.lineTo(crack.pts[i].x, crack.pts[i].y);
        }
        ctx.stroke();
        // glow
        ctx.strokeStyle = `rgba(255, 200, 100, ${crack.opacity * 0.3})`;
        ctx.lineWidth = 6;
        ctx.stroke();
      }

      // Explosions
      for (let i = explosions.length - 1; i >= 0; i--) {
        const p = explosions[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.97;
        p.vy *= 0.97;
        p.life -= p.decay;
        if (p.life <= 0) { explosions.splice(i, 1); continue; }
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
        ctx.fill();
        // glow
        ctx.fillStyle = 'rgba(255, 200, 50, 0.3)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * p.life * 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Countdown text
      const remaining = Math.max(0, 10 - time);
      if (remaining > 1) {
        ctx.font = 'bold 20px monospace';
        ctx.fillStyle = `rgba(255, ${Math.max(0, 100 - time * 10)}, 0, 0.8)`;
        ctx.textAlign = 'center';
        ctx.fillText(`SYSTEM FAILURE IN ${remaining.toFixed(1)}s`, w / 2, 40);
      }

      // Shake
      if (time > 1) {
        shake = Math.min(time * 1.5, 15);
        const sx = (Math.random() - 0.5) * shake;
        const sy = (Math.random() - 0.5) * shake;
        document.body.style.transform = `translate(${sx}px, ${sy}px)`;
      }

      // White out in final second
      if (time > 9) {
        whiteOpacity = Math.min(1, (time - 9));
        ctx.fillStyle = `rgba(255, 255, 255, ${whiteOpacity})`;
        ctx.fillRect(0, 0, w, h);
      }

      if (time > 10.5) {
        done = true;
        document.body.style.transform = origTransform || '';
        setWhiteOut(true);
        return;
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      done = true;
      cancelAnimationFrame(animRef.current);
      clearInterval(sirenInterval);
      timers.forEach(t => clearTimeout(t));
      document.body.style.transform = origTransform || '';
    };
  }, []);

  if (whiteOut) {
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: '#fff', zIndex: 99999,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        fontFamily: 'monospace',
      }}>
        <h1 style={{ color: '#111', fontSize: 'clamp(1.2rem, 4vw, 2.2rem)', fontWeight: 700, marginBottom: '0.5rem', textAlign: 'center', padding: '0 1rem' }}>
          Dom the Developer
        </h1>
        <p style={{ color: '#555', fontSize: '0.95rem', marginBottom: '2rem' }}>
          <a href="mailto:dom@domthedeveloper.com" style={{ color: '#555', textDecoration: 'underline' }}>contact me</a>
        </p>
        <button
          onClick={onRestore}
          style={{
            fontFamily: 'monospace', fontSize: '0.85rem', padding: '0.6rem 1.6rem',
            background: '#111', color: '#fff', border: 'none', borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          refresh
        </button>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 99998,
      }}
    />
  );
};

/* ══════════════════════════════════════════════
   EXPERIMENTAL SECTION
   ══════════════════════════════════════════════ */
const Experimental = () => {
  const ref = useRef();
  const [visible, setVisible] = useState(false);
  const [weather, setWeather] = useState(null);       // 'rain' | 'snow' | null
  const [abducting, setAbducting] = useState(false);
  const [destructing, setDestructing] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.05 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const stopWeather = useCallback(() => setWeather(null), []);
  const stopAbduction = useCallback(() => setAbducting(false), []);

  const handleDestruct = () => {
    const confirmed = window.confirm(
      '⚠️ WARNING: SELF DESTRUCT SEQUENCE ⚠️\n\n' +
      'This will obliterate the entire website.\n\n' +
      'Are you absolutely sure?'
    );
    if (confirmed) {
      const reallyConfirmed = window.confirm(
        '🔴 FINAL WARNING 🔴\n\n' +
        'There is no going back.\n\n' +
        'Initiate self destruct?'
      );
      if (reallyConfirmed) setDestructing(true);
    }
  };

  const handleRestore = () => {
    setDestructing(false);
  };

  return (
    <>
      <section
        id="experimental"
        className={`section experimental ${visible ? 'section--visible' : ''}`}
        ref={ref}
      >
        <div className="section__inner">
          <h2 className="section__title">
            <span className="section__title-tag experimental__tag">05.</span>{' '}
            <span className="experimental__title-text">Experimental</span>
          </h2>
          <p className="experimental__subtitle">
            Dangerous buttons. Proceed at your own risk.
          </p>

          <div className="experimental__grid">
            {/* WEATHER */}
            <div className="experimental__card">
              <div className="experimental__card-icon">{weather === 'snow' ? '❄' : '🌧'}</div>
              <h3 className="experimental__card-title">Weather Machine</h3>
              <p className="experimental__card-desc">
                Make it rain or snow across the entire website.
              </p>
              <div className="experimental__card-actions">
                <button
                  className="experimental__btn experimental__btn--rain"
                  onClick={() => setWeather(weather === 'rain' ? null : 'rain')}
                  disabled={abducting || destructing}
                >
                  {weather === 'rain' ? 'Stop Rain' : '🌧 Rain'}
                </button>
                <button
                  className="experimental__btn experimental__btn--snow"
                  onClick={() => setWeather(weather === 'snow' ? null : 'snow')}
                  disabled={abducting || destructing}
                >
                  {weather === 'snow' ? 'Stop Snow' : '❄ Snow'}
                </button>
              </div>
            </div>

            {/* ALIEN ABDUCTION */}
            <div className="experimental__card">
              <div className="experimental__card-icon">👾</div>
              <h3 className="experimental__card-title">Alien Abduction</h3>
              <p className="experimental__card-desc">
                Pixelated aliens and UFOs invade and abduct the website.
              </p>
              <div className="experimental__card-actions">
                <button
                  className="experimental__btn experimental__btn--alien"
                  onClick={() => setAbducting(true)}
                  disabled={abducting || destructing}
                >
                  {abducting ? 'Abducting...' : '👾 Abduct'}
                </button>
              </div>
            </div>

            {/* SELF DESTRUCT */}
            <div className="experimental__card experimental__card--danger">
              <div className="experimental__card-icon">💣</div>
              <h3 className="experimental__card-title">Self Destruct</h3>
              <p className="experimental__card-desc">
                Blow up the entire website. You've been warned.
              </p>
              <div className="experimental__card-actions">
                <button
                  className="experimental__btn experimental__btn--destruct"
                  onClick={handleDestruct}
                  disabled={abducting || destructing}
                >
                  💀 Self Destruct
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OVERLAYS – rendered outside section so they cover the whole page */}
      {weather && <WeatherOverlay type={weather} onStop={stopWeather} />}
      {abducting && <AlienAbduction onDone={stopAbduction} />}
      {destructing && <SelfDestruct onRestore={handleRestore} />}
    </>
  );
};

export default Experimental;
