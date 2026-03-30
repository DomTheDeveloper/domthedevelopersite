import React, { useState, useCallback, useRef, useEffect } from 'react';

const NOTES = ['C4','D4','E4','F4','G4','A4','B4','C5','D5','E5','F5','G5','A5','B5','C6','D6'];
const NOTE_FREQ = { C4:261.63,D4:293.66,E4:329.63,F4:349.23,G4:392,A4:440,B4:493.88,C5:523.25,D5:587.33,E5:659.25,F5:698.46,G5:783.99,A5:880,B5:987.77,C6:1046.5,D6:1174.66 };
const PAD_COLORS = ['#64c8ff','#4facfe','#00f2fe','#48d1cc','#76e2f8','#5bc0eb','#64c8ff','#4facfe','#00f2fe','#48d1cc','#76e2f8','#5bc0eb','#64c8ff','#4facfe','#00f2fe','#48d1cc'];

const SynthPad = () => {
  const [active, setActive] = useState(null);
  const [ripples, setRipples] = useState([]);
  const audioCtxRef = useRef(null);

  useEffect(() => {
    return () => { if (audioCtxRef.current) audioCtxRef.current.close(); };
  }, []);

  const playNote = useCallback((note, index) => {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(NOTE_FREQ[note], ctx.currentTime);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, ctx.currentTime);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.8);

    setActive(index);
    setRipples(prev => [...prev, { id: Date.now(), index }]);
    setTimeout(() => setActive(null), 200);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== Date.now())), 600);
  }, []);

  return (
    <div className="synth-pad">
      <div className="synth-pad__grid">
        {NOTES.map((note, i) => (
          <button
            key={note}
            className={`synth-pad__key ${active === i ? 'synth-pad__key--active' : ''}`}
            style={{ '--pad-color': PAD_COLORS[i], touchAction: 'none' }}
            onClick={() => playNote(note, i)}
            onMouseEnter={(e) => { if (e.buttons === 1) playNote(note, i); }}
            onTouchStart={(e) => { e.preventDefault(); playNote(note, i); }}
          >
            <span className="synth-pad__note">{note}</span>
            {ripples.filter(r => r.index === i).map(r => (
              <span key={r.id} className="synth-pad__ripple" />
            ))}
          </button>
        ))}
      </div>
      <p className="synth-pad__hint">Tap or click pads to play.</p>
    </div>
  );
};

export default SynthPad;
