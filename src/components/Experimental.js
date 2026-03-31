import React, { useEffect, useRef, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';

/* helpers */
const rand = (a, b) => a + Math.random() * (b - a);
const randInt = (a, b) => Math.floor(rand(a, b));

/* ══════════════════════════════════════════════
   WEATHER OVERLAY - rain or snow over the page
   ══════════════════════════════════════════════ */
const WeatherOverlay = ({ type, onStop }) => {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);

    const count = type === 'rain' ? 400 : 200;
    particles.current = Array.from({ length: count }, () => ({
      x: rand(0, w),
      y: rand(-h, 0),
      speed: type === 'rain' ? rand(12, 22) : rand(1, 3),
      size: type === 'rain' ? rand(1, 2.5) : rand(2, 5),
      drift: type === 'snow' ? rand(-0.5, 0.5) : 0,
      opacity: rand(0.3, 1),
      wobbleOffset: rand(0, Math.PI * 2),
    }));

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles.current) {
        p.y += p.speed;
        p.x += p.drift + (type === 'snow' ? Math.sin(p.y * 0.01 + p.wobbleOffset) * 0.3 : 0);
        if (p.y > h + 20) {
          p.y = -20;
          p.x = rand(0, w);
        }
        if (type === 'rain') {
          ctx.strokeStyle = `rgba(100, 150, 255, ${p.opacity})`;
          ctx.lineWidth = p.size * 0.6;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + 0.5, p.y + 14 + p.speed);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * 0.8})`;
          ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
          ctx.shadowBlur = 4;
          ctx.fill();
          ctx.shadowBlur = 0;
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
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 99990,
      }}
    />
  );
};

/* ══════════════════════════════════════════════
   ALIEN ABDUCTION - CRAZY edition
   ══════════════════════════════════════════════ */
const ALIEN_QUOTES = [
  'NICE CSS', 'WE COME FOR YOUR DATA', 'YOUR CODE IS OURS',
  'TAKE ME TO YOUR SERVER', 'DEPLOYING PROBES...', 'RESISTANCE IS FUTILE',
  'YOUR PIXELS BELONG TO US', 'BEEP BOOP BOOP',
];

const AlienAbduction = ({ onDone }) => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);

    // 8+ UFOs from different directions
    const ufos = Array.from({ length: 10 }, (_, i) => {
      const fromLeft = i % 4 === 0;
      const fromRight = i % 4 === 1;
      const fromTop = i % 4 === 2;
      const fromBottom = i % 4 === 3;
      return {
        x: fromLeft ? -120 : fromRight ? w + 120 : rand(50, w - 50),
        y: fromTop ? -120 : fromBottom ? h + 120 : rand(-200, -60),
        targetX: rand(100, w - 100),
        targetY: rand(60, h * 0.35),
        size: rand(35, 80),
        speed: rand(1.5, 3),
        wobble: rand(0, Math.PI * 2),
        beamOn: false,
        beamPulse: 0,
      };
    });

    // 20+ aliens
    const aliens = Array.from({ length: 24 }, () => ({
      x: rand(20, w - 20),
      y: h + rand(20, 200),
      targetY: rand(h * 0.25, h * 0.85),
      size: rand(14, 30),
      speed: rand(0.5, 2),
      frame: 0,
      color: ['#4f4', '#4ff', '#f4f', '#ff4', '#f84', '#84f', '#8ff', '#ff8'][randInt(0, 8)],
      walkDir: Math.random() > 0.5 ? 1 : -1,
      speechTimer: rand(2, 10),
      speech: '',
      speechVisible: 0,
    }));

    // Stars for space background
    const stars = Array.from({ length: 200 }, () => ({
      x: rand(0, w), y: rand(0, h), size: rand(0.5, 2.5), twinkle: rand(0, Math.PI * 2),
    }));

    let time = 0;
    let phase = 0; // 0=enter, 1=abduct, 2=peak, 3=exit
    let phaseTimer = 0;
    const origTransform = document.body.style.transform;
    const origFilter = document.body.style.filter;
    let shakeAmount = 0;

    const drawPixelAlien = (x, y, s, color, frame) => {
      const p = s / 8;
      ctx.fillStyle = color;
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
            ctx.fillRect(x - s / 2 + col * p, y - s / 2 + row * p, p + 0.5, p + 0.5);
          }
        }
      }
      ctx.fillStyle = '#000';
      ctx.fillRect(x - s / 2 + 2 * p, y - s / 2 + 2 * p, p, p);
      ctx.fillRect(x - s / 2 + 5 * p, y - s / 2 + 2 * p, p, p);
      ctx.fillStyle = '#fff';
      ctx.fillRect(x - s / 2 + 2 * p, y - s / 2 + 2 * p, p * 0.4, p * 0.4);
      ctx.fillRect(x - s / 2 + 5 * p, y - s / 2 + 2 * p, p * 0.4, p * 0.4);
    };

    const drawUFO = (ufo) => {
      const { x, y, size } = ufo;
      // dome
      ctx.fillStyle = 'rgba(180, 255, 200, 0.6)';
      ctx.beginPath();
      ctx.ellipse(x, y - size * 0.15, size * 0.35, size * 0.3, 0, Math.PI, 0);
      ctx.fill();
      // body
      const grad = ctx.createLinearGradient(x - size / 2, y, x + size / 2, y);
      grad.addColorStop(0, '#666');
      grad.addColorStop(0.5, '#ccc');
      grad.addColorStop(1, '#666');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(x, y, size * 0.6, size * 0.18, 0, 0, Math.PI * 2);
      ctx.fill();
      // rim lights
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + time * 3;
        const lx = x + Math.cos(angle) * size * 0.5;
        const ly = y + Math.sin(angle) * size * 0.08;
        ctx.fillStyle = `hsl(${(time * 100 + i * 45) % 360}, 100%, 60%)`;
        ctx.beginPath();
        ctx.arc(lx, ly, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      // tractor beam with scan lines
      if (ufo.beamOn) {
        ufo.beamPulse += 0.05;
        const beamAlpha = 0.15 + Math.sin(ufo.beamPulse) * 0.1;
        const grad2 = ctx.createLinearGradient(x, y, x, h);
        grad2.addColorStop(0, `rgba(100, 255, 150, ${beamAlpha + 0.15})`);
        grad2.addColorStop(1, `rgba(100, 255, 150, 0)`);
        ctx.fillStyle = grad2;
        ctx.beginPath();
        ctx.moveTo(x - size * 0.3, y + size * 0.15);
        ctx.lineTo(x - size * 1.0, h);
        ctx.lineTo(x + size * 1.0, h);
        ctx.lineTo(x + size * 0.3, y + size * 0.15);
        ctx.closePath();
        ctx.fill();
        // scan lines
        ctx.strokeStyle = `rgba(100, 255, 150, ${beamAlpha * 0.5})`;
        ctx.lineWidth = 1;
        for (let sl = 0; sl < 12; sl++) {
          const slY = y + ((time * 80 + sl * 40) % (h - y));
          if (slY > y && slY < h) {
            const ratio = (slY - y) / (h - y);
            const slW = size * 0.3 + ratio * size * 0.7;
            ctx.beginPath();
            ctx.moveTo(x - slW, slY);
            ctx.lineTo(x + slW, slY);
            ctx.stroke();
          }
        }
      }
    };

    const draw = () => {
      time += 0.016;
      phaseTimer += 0.016;
      ctx.clearRect(0, 0, w, h);

      // Phase transitions
      if (phase === 0 && phaseTimer > 2.5) { phase = 1; phaseTimer = 0; }
      if (phase === 1 && phaseTimer > 4) { phase = 2; phaseTimer = 0; }
      if (phase === 2 && phaseTimer > 3) { phase = 3; phaseTimer = 0; }
      if (phase === 3 && phaseTimer > 2.5) {
        document.body.style.transform = origTransform || '';
        document.body.style.filter = origFilter || '';
        onDone();
        return;
      }

      // Space background during peak
      if (phase >= 1) {
        const bgAlpha = phase === 2 ? Math.min(0.4, phaseTimer * 0.15) : (phase === 3 ? Math.max(0, 0.4 - phaseTimer * 0.2) : Math.min(0.2, phaseTimer * 0.05));
        ctx.fillStyle = `rgba(0, 5, 15, ${bgAlpha})`;
        ctx.fillRect(0, 0, w, h);
        for (const star of stars) {
          star.twinkle += 0.03;
          const a = (0.3 + Math.sin(star.twinkle) * 0.3) * (bgAlpha * 3);
          ctx.fillStyle = `rgba(255, 255, 255, ${a})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Green tint during peak
      if (phase === 2) {
        ctx.fillStyle = `rgba(0, 255, 50, ${0.03 + Math.sin(time * 4) * 0.02})`;
        ctx.fillRect(0, 0, w, h);
      }

      // UFOs
      for (const ufo of ufos) {
        ufo.wobble += 0.02;
        if (phase === 0) {
          ufo.x += (ufo.targetX - ufo.x) * 0.025;
          ufo.y += (ufo.targetY - ufo.y) * 0.025;
        } else if (phase === 1 || phase === 2) {
          ufo.beamOn = true;
          ufo.x += Math.sin(ufo.wobble) * 1.2;
          ufo.y += Math.cos(ufo.wobble * 0.7) * 0.4;
        } else {
          ufo.beamOn = false;
          ufo.y -= 6;
          ufo.x += Math.sin(ufo.wobble) * 2;
        }
        drawUFO(ufo);
      }

      // Aliens
      for (const alien of aliens) {
        if (phase === 0 || phase === 1) {
          alien.y += (alien.targetY - alien.y) * 0.018;
          alien.x += alien.walkDir * 0.5 + Math.sin(time * 2 + alien.x) * 0.3;
          if (alien.x < 10 || alien.x > w - 10) alien.walkDir *= -1;
        } else if (phase === 2) {
          alien.x += Math.sin(time * 3 + alien.x * 0.01) * 1.5;
          alien.y += Math.cos(time * 2 + alien.y * 0.01) * 0.8;
        } else {
          alien.y -= 4;
        }
        alien.frame = Math.floor(time * 4);
        drawPixelAlien(alien.x, alien.y, alien.size, alien.color, alien.frame);

        // Speech bubbles
        alien.speechTimer -= 0.016;
        if (alien.speechTimer <= 0 && alien.speechVisible <= 0) {
          alien.speech = ALIEN_QUOTES[randInt(0, ALIEN_QUOTES.length)];
          alien.speechVisible = 2.5;
          alien.speechTimer = rand(4, 12);
        }
        if (alien.speechVisible > 0) {
          alien.speechVisible -= 0.016;
          const bubbleAlpha = Math.min(1, alien.speechVisible);
          ctx.save();
          ctx.font = 'bold 10px monospace';
          const tw = ctx.measureText(alien.speech).width + 12;
          const bx = alien.x - tw / 2;
          const by = alien.y - alien.size - 18;
          ctx.fillStyle = `rgba(0, 0, 0, ${bubbleAlpha * 0.8})`;
          ctx.strokeStyle = `rgba(100, 255, 150, ${bubbleAlpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(bx, by - 16, tw, 20, 4);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = `rgba(100, 255, 150, ${bubbleAlpha})`;
          ctx.textAlign = 'center';
          ctx.fillText(alien.speech, alien.x, by - 2);
          ctx.restore();
        }
      }

      // Glitch effect: RGB offset on body
      if (phase === 1 || phase === 2) {
        const glitchIntensity = phase === 2 ? 4 : 2;
        if (Math.random() < 0.15) {
          const rx = (Math.random() - 0.5) * glitchIntensity;
          const ry = (Math.random() - 0.5) * glitchIntensity;
          document.body.style.filter = `drop-shadow(${rx}px 0 0 rgba(255,0,0,0.3)) drop-shadow(${-rx}px ${ry}px 0 rgba(0,255,0,0.3)) drop-shadow(0 ${-ry}px 0 rgba(0,0,255,0.3))`;
        }
      } else {
        document.body.style.filter = origFilter || '';
      }

      // Page shake + tilt
      if (phase >= 1 && phase <= 2) {
        shakeAmount = Math.min(shakeAmount + 0.15, phase === 2 ? 10 : 5);
        const sx = (Math.random() - 0.5) * shakeAmount;
        const sy = (Math.random() - 0.5) * shakeAmount;
        const rot = (Math.random() - 0.5) * (phase === 2 ? 1.5 : 0.5);
        document.body.style.transform = `translate(${sx}px, ${sy}px) rotate(${rot}deg)`;
      } else if (phase === 3) {
        shakeAmount = Math.max(0, shakeAmount - 0.3);
        const sx = (Math.random() - 0.5) * shakeAmount;
        const sy = (Math.random() - 0.5) * shakeAmount;
        document.body.style.transform = `translate(${sx}px, ${sy}px)`;
      } else {
        document.body.style.transform = origTransform || '';
      }

      // Abduction text
      if (phase === 1 || phase === 2) {
        const msgs = phase === 2
          ? 'MAXIMUM ABDUCTION POWER ENGAGED'
          : 'ABDUCTING WEBSITE DATA...';
        ctx.font = `bold ${14 + Math.sin(time * 5) * 3}px monospace`;
        ctx.fillStyle = `rgba(100, 255, 150, ${0.5 + Math.sin(time * 3) * 0.3})`;
        ctx.textAlign = 'center';
        ctx.fillText(msgs, w / 2, h - 40);
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      document.body.style.transform = origTransform || '';
      document.body.style.filter = origFilter || '';
      window.removeEventListener('resize', resize);
    };
  }, [onDone]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 99990,
      }}
    />
  );
};

/* ══════════════════════════════════════════════
   DESTRUCT MODAL - custom confirm dialogs
   ══════════════════════════════════════════════ */
const DestructModal = ({ stage, confirmText, onConfirmTextChange, onAbort, onInitiate, onExecute }) => {
  const modalOverlay = {
    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
    background: 'rgba(0, 0, 0, 0.85)', zIndex: 99995,
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    fontFamily: 'monospace',
  };

  const scanlineOverlay = {
    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
    background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)',
    pointerEvents: 'none', zIndex: 1,
  };

  const panelBase = {
    position: 'relative', border: '2px solid #ff2222', borderRadius: 8,
    background: 'linear-gradient(180deg, #1a0000 0%, #0a0a0a 100%)',
    padding: '2rem 2.5rem', maxWidth: 480, width: '90%',
    boxShadow: '0 0 40px rgba(255, 0, 0, 0.3), inset 0 0 60px rgba(255, 0, 0, 0.05)',
    zIndex: 2,
  };

  const titleStyle = {
    color: '#ff2222', fontSize: '1.3rem', fontWeight: 'bold', textAlign: 'center',
    marginBottom: '1.2rem', textShadow: '0 0 10px rgba(255, 0, 0, 0.5)',
    letterSpacing: '0.1em',
  };

  const warningTriangles = {
    fontSize: '1.5rem', display: 'flex', justifyContent: 'center',
    gap: '0.8rem', marginBottom: '0.8rem',
    animation: 'none',
  };

  const textStyle = {
    color: '#cc8888', fontSize: '0.85rem', textAlign: 'center',
    lineHeight: 1.6, marginBottom: '1.5rem',
  };

  const btnRow = {
    display: 'flex', justifyContent: 'center', gap: '1rem',
  };

  const abortBtn = {
    fontFamily: 'monospace', fontSize: '0.85rem', padding: '0.7rem 1.5rem',
    background: '#333', color: '#aaa', border: '1px solid #555',
    borderRadius: 4, cursor: 'pointer',
  };

  const initiateBtn = {
    fontFamily: 'monospace', fontSize: '0.85rem', padding: '0.7rem 1.5rem',
    background: '#440000', color: '#ff4444', border: '1px solid #ff2222',
    borderRadius: 4, cursor: 'pointer',
    boxShadow: '0 0 15px rgba(255, 0, 0, 0.4)',
    animation: 'pulse-red 1.5s ease-in-out infinite',
  };

  const inputStyle = {
    fontFamily: 'monospace', fontSize: '1rem', padding: '0.6rem 1rem',
    background: '#111', color: '#ff4444', border: '1px solid #ff2222',
    borderRadius: 4, width: '100%', textAlign: 'center',
    outline: 'none', marginBottom: '1rem', boxSizing: 'border-box',
    letterSpacing: '0.2em',
  };

  const executeBtn = {
    fontFamily: 'monospace', fontSize: '0.9rem', padding: '0.8rem 2rem',
    background: confirmText === 'DESTROY' ? '#660000' : '#222',
    color: confirmText === 'DESTROY' ? '#ff2222' : '#555',
    border: `1px solid ${confirmText === 'DESTROY' ? '#ff2222' : '#444'}`,
    borderRadius: 4,
    cursor: confirmText === 'DESTROY' ? 'pointer' : 'not-allowed',
    boxShadow: confirmText === 'DESTROY' ? '0 0 25px rgba(255, 0, 0, 0.6)' : 'none',
    width: '100%',
  };

  return (
    <div style={modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) onAbort(); }}>
      <style>{`
        @keyframes pulse-red {
          0%, 100% { box-shadow: 0 0 15px rgba(255, 0, 0, 0.4); }
          50% { box-shadow: 0 0 30px rgba(255, 0, 0, 0.8); }
        }
      `}</style>
      <div style={panelBase}>
        <div style={scanlineOverlay} />
        {stage === 1 ? (
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={warningTriangles}>
              <span style={{ color: '#ff4444' }}>&#9888;</span>
              <span style={{ color: '#ff4444' }}>&#9888;</span>
            </div>
            <div style={titleStyle}>SELF DESTRUCT SEQUENCE</div>
            <p style={textStyle}>
              WARNING: This action will obliterate the entire website.
              All systems will be destroyed.
            </p>
            <div style={btnRow}>
              <button style={abortBtn} onClick={onAbort}>ABORT MISSION</button>
              <button style={initiateBtn} onClick={onInitiate}>INITIATE SEQUENCE</button>
            </div>
          </div>
        ) : (
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ ...titleStyle, color: '#ff0000', fontSize: '1.4rem' }}>
              FINAL AUTHORIZATION REQUIRED
            </div>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '2rem' }}>&#128272;</span>
            </div>
            <p style={{ ...textStyle, color: '#ff6666' }}>
              Type <span style={{ color: '#ff2222', fontWeight: 'bold', letterSpacing: '0.15em' }}>DESTROY</span> to confirm:
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => onConfirmTextChange(e.target.value)}
              style={inputStyle}
              autoFocus
              placeholder="_ _ _ _ _ _ _"
            />
            <button
              style={executeBtn}
              onClick={onExecute}
              disabled={confirmText !== 'DESTROY'}
            >
              EXECUTE
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════
   SELF DESTRUCT - explosions, audio, destruction
   ══════════════════════════════════════════════ */
const SelfDestruct = ({ onRestore }) => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const audioRef = useRef(null);
  const [whiteOut, setWhiteOut] = useState(false);

  useEffect(() => {
    if (whiteOut) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    // Web Audio API setup
    let audioCtx = null;
    let rumbleOsc = null;
    let rumbleGain = null;
    let alarmInterval = null;
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      audioRef.current = audioCtx;

      // Rumble: low 40Hz oscillator
      rumbleOsc = audioCtx.createOscillator();
      rumbleGain = audioCtx.createGain();
      rumbleOsc.type = 'sine';
      rumbleOsc.frequency.value = 40;
      rumbleGain.gain.setValueAtTime(0.0, audioCtx.currentTime);
      rumbleGain.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 8);
      rumbleOsc.connect(rumbleGain);
      rumbleGain.connect(audioCtx.destination);
      rumbleOsc.start();

      // Alarm beeps
      let alarmHigh = true;
      alarmInterval = setInterval(() => {
        if (!audioCtx || audioCtx.state === 'closed') return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.value = alarmHigh ? 800 : 600;
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
        alarmHigh = !alarmHigh;
      }, 400);
    } catch (_e) {
      // Audio not supported, continue without
    }

    const makeExplosionSound = () => {
      if (!audioCtx || audioCtx.state === 'closed') return;
      try {
        const bufferSize = audioCtx.sampleRate * 0.3;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        const bpFilter = audioCtx.createBiquadFilter();
        bpFilter.type = 'bandpass';
        bpFilter.frequency.value = 200;
        bpFilter.Q.value = 0.5;
        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
        source.connect(bpFilter);
        bpFilter.connect(gain);
        gain.connect(audioCtx.destination);
        source.start();
      } catch (_e) {
        // ignore audio errors
      }
    };

    const explosions = [];
    let time = 0;
    let done = false;

    const spawnExplosion = (x, y, big) => {
      const count = big ? 60 : randInt(35, 50);
      const parts = Array.from({ length: count }, () => ({
        x, y,
        vx: (Math.random() - 0.5) * (big ? 20 : rand(5, 16)),
        vy: (Math.random() - 0.5) * (big ? 20 : rand(5, 16)),
        r: big ? rand(4, 14) : rand(2, 10),
        life: 1,
        decay: rand(0.008, 0.025),
        color: `hsl(${randInt(0, 45)}, 100%, ${randInt(40, 70)}%)`,
      }));
      explosions.push(...parts);
      makeExplosionSound();
    };

    // Schedule 60+ explosions over 10s
    const timers = [];
    const scheduleExplosion = (delay) => {
      timers.push(setTimeout(() => {
        if (!done) spawnExplosion(rand(30, w - 30), rand(30, h - 30), false);
      }, delay));
    };
    for (let i = 0; i < 65; i++) {
      scheduleExplosion(i * 150 + rand(0, 80));
    }

    // Massive central explosion at ~8s
    timers.push(setTimeout(() => {
      if (!done) {
        spawnExplosion(w / 2, h / 2, true);
        spawnExplosion(w / 2 + rand(-50, 50), h / 2 + rand(-50, 50), true);
      }
    }, 8000));

    const origTransform = document.body.style.transform;
    let shake = 0;

    // Screen cracks
    const cracks = [];
    for (let i = 0; i < 18; i++) {
      timers.push(setTimeout(() => {
        const cx = rand(0, w);
        const cy = rand(0, h);
        const segs = randInt(5, 12);
        const pts = [{ x: cx, y: cy }];
        for (let s = 0; s < segs; s++) {
          const prev = pts[pts.length - 1];
          pts.push({ x: prev.x + rand(-100, 100), y: prev.y + rand(-100, 100) });
        }
        cracks.push({ pts, opacity: 1, width: rand(1, 3) });
      }, 800 + i * 500));
    }

    // Siren flash
    let sirenOn = false;
    const sirenInterval = setInterval(() => { sirenOn = !sirenOn; }, 250);

    // Shockwave ring at ~8s
    let shockwave = null;
    timers.push(setTimeout(() => {
      shockwave = { x: w / 2, y: h / 2, radius: 0, maxRadius: Math.max(w, h), opacity: 1 };
    }, 8000));

    const draw = () => {
      if (done) return;
      time += 0.016;
      ctx.clearRect(0, 0, w, h);

      // Red siren flash
      if (sirenOn && time < 9.5) {
        ctx.fillStyle = `rgba(255, 0, 0, ${Math.min(0.15, 0.03 + time * 0.012)})`;
        ctx.fillRect(0, 0, w, h);
      }

      // Draw cracks
      for (const crack of cracks) {
        ctx.strokeStyle = `rgba(255, 100, 50, ${crack.opacity})`;
        ctx.lineWidth = crack.width;
        ctx.beginPath();
        ctx.moveTo(crack.pts[0].x, crack.pts[0].y);
        for (let i = 1; i < crack.pts.length; i++) {
          ctx.lineTo(crack.pts[i].x, crack.pts[i].y);
        }
        ctx.stroke();
        ctx.strokeStyle = `rgba(255, 200, 100, ${crack.opacity * 0.3})`;
        ctx.lineWidth = crack.width + 5;
        ctx.stroke();
      }

      // Explosions
      for (let i = explosions.length - 1; i >= 0; i--) {
        const p = explosions[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.97;
        p.vy *= 0.97;
        p.vy += 0.05; // gravity
        p.life -= p.decay;
        if (p.life <= 0) { explosions.splice(i, 1); continue; }
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 200, 50, 0.3)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * p.life * 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Shockwave ring
      if (shockwave) {
        shockwave.radius += 15;
        shockwave.opacity = Math.max(0, 1 - shockwave.radius / shockwave.maxRadius);
        if (shockwave.opacity > 0) {
          ctx.strokeStyle = `rgba(255, 255, 200, ${shockwave.opacity})`;
          ctx.lineWidth = 4 + shockwave.radius * 0.02;
          ctx.beginPath();
          ctx.arc(shockwave.x, shockwave.y, shockwave.radius, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Countdown text
      const remaining = Math.max(0, 10 - time);
      if (remaining > 0.5) {
        ctx.font = 'bold 22px monospace';
        ctx.fillStyle = `rgba(255, ${Math.max(0, 100 - time * 10)}, 0, 0.9)`;
        ctx.textAlign = 'center';
        ctx.fillText(`CORE MELTDOWN IN ${remaining.toFixed(1)}s`, w / 2, 50);
      }

      // Page shake - intensifies, up to 20px
      if (time > 0.5) {
        shake = Math.min(time * 2, 20);
        const sx = (Math.random() - 0.5) * shake;
        const sy = (Math.random() - 0.5) * shake;
        const rot = (Math.random() - 0.5) * (shake * 0.08);
        document.body.style.transform = `translate(${sx}px, ${sy}px) rotate(${rot}deg)`;
      }

      // White flash near end
      if (time > 9) {
        const flashAlpha = Math.min(1, (time - 9) * 1.0);
        ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
        ctx.fillRect(0, 0, w, h);
      }

      if (time > 10.5) {
        done = true;
        document.body.style.transform = origTransform || '';
        // Stop audio
        try {
          if (rumbleOsc) rumbleOsc.stop();
          if (audioCtx) audioCtx.close();
        } catch (_e) { /* ignore */ }
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
      if (alarmInterval) clearInterval(alarmInterval);
      timers.forEach(t => clearTimeout(t));
      document.body.style.transform = origTransform || '';
      try {
        if (rumbleOsc) rumbleOsc.stop();
        if (audioCtx && audioCtx.state !== 'closed') audioCtx.close();
      } catch (_e) { /* ignore */ }
    };
  }, [whiteOut]);

  if (whiteOut) {
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: '#fff', zIndex: 99999,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        fontFamily: 'monospace',
      }}>
        <h1 style={{
          color: '#111', fontSize: 'clamp(1.2rem, 4vw, 2.2rem)',
          fontWeight: 700, marginBottom: '0.5rem', textAlign: 'center', padding: '0 1rem',
        }}>
          Dom the Developer
        </h1>
        <p style={{ color: '#555', fontSize: '0.95rem', marginBottom: '2rem' }}>
          <a href="mailto:dom@domthedeveloper.com" style={{ color: '#555', textDecoration: 'underline' }}>
            contact me
          </a>
        </p>
        <button
          onClick={onRestore}
          style={{
            fontFamily: 'monospace', fontSize: '0.85rem', padding: '0.6rem 1.6rem',
            background: '#111', color: '#fff', border: 'none', borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          (refresh)
        </button>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        pointerEvents: 'none', zIndex: 99998,
      }}
    />
  );
};

/* ══════════════════════════════════════════════
   MAIN EXPERIMENTAL COMPONENT
   ══════════════════════════════════════════════ */
const Experimental = () => {
  const [weather, setWeather] = useState(null);
  const [abducting, setAbducting] = useState(false);
  const [showDestructModal, setShowDestructModal] = useState(0);
  const [destructing, setDestructing] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const stopWeather = useCallback(() => setWeather(null), []);
  const stopAbduction = useCallback(() => setAbducting(false), []);

  const handleDestruct = () => {
    setShowDestructModal(1);
    setConfirmText('');
  };

  const handleAbort = () => {
    setShowDestructModal(0);
    setConfirmText('');
  };

  const handleInitiate = () => {
    setShowDestructModal(2);
    setConfirmText('');
  };

  const handleExecute = () => {
    if (confirmText !== 'DESTROY') return;
    setShowDestructModal(0);
    setConfirmText('');
    setDestructing(true);
  };

  const handleRestore = () => {
    setDestructing(false);
  };

  return (
    <div style={{ width: '100%' }}>
      <div className="experimental__grid">
        {/* WEATHER */}
        <div className="experimental__card">
          <div className="experimental__card-icon">{weather === 'snow' ? '\u2744' : '\uD83C\uDF27'}</div>
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
              {weather === 'rain' ? 'Stop Rain' : '\uD83C\uDF27 Rain'}
            </button>
            <button
              className="experimental__btn experimental__btn--snow"
              onClick={() => setWeather(weather === 'snow' ? null : 'snow')}
              disabled={abducting || destructing}
            >
              {weather === 'snow' ? 'Stop Snow' : '\u2744 Snow'}
            </button>
          </div>
        </div>

        {/* ALIEN ABDUCTION */}
        <div className="experimental__card">
          <div className="experimental__card-icon">{'\uD83D\uDC7E'}</div>
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
              {abducting ? 'Abducting...' : '\uD83D\uDC7E Abduct'}
            </button>
          </div>
        </div>

        {/* SELF DESTRUCT */}
        <div className="experimental__card experimental__card--danger">
          <div className="experimental__card-icon">{'\uD83D\uDCA3'}</div>
          <h3 className="experimental__card-title">Self Destruct</h3>
          <p className="experimental__card-desc">
            Blow up the entire website. You have been warned.
          </p>
          <div className="experimental__card-actions">
            <button
              className="experimental__btn experimental__btn--destruct"
              onClick={handleDestruct}
              disabled={abducting || destructing}
            >
              {'\uD83D\uDC80'} Self Destruct
            </button>
          </div>
        </div>
      </div>

      {/* Portals for overlays */}
      {weather && ReactDOM.createPortal(
        <WeatherOverlay type={weather} onStop={stopWeather} />,
        document.body
      )}
      {abducting && ReactDOM.createPortal(
        <AlienAbduction onDone={stopAbduction} />,
        document.body
      )}
      {showDestructModal > 0 && ReactDOM.createPortal(
        <DestructModal
          stage={showDestructModal}
          confirmText={confirmText}
          onConfirmTextChange={setConfirmText}
          onAbort={handleAbort}
          onInitiate={handleInitiate}
          onExecute={handleExecute}
        />,
        document.body
      )}
      {destructing && ReactDOM.createPortal(
        <SelfDestruct onRestore={handleRestore} />,
        document.body
      )}
    </div>
  );
};

export default Experimental;
