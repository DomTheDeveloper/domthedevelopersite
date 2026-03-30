import React, { useState, useCallback, useRef, useEffect } from 'react';

const NOTES = ['C4','D4','E4','F4','G4','A4','B4','C5','D5','E5','F5','G5','A5','B5','C6','D6'];
const NOTE_FREQ = { C4:261.63,D4:293.66,E4:329.63,F4:349.23,G4:392,A4:440,B4:493.88,C5:523.25,D5:587.33,E5:659.25,F5:698.46,G5:783.99,A5:880,B5:987.77,C6:1046.5,D6:1174.66 };
const PAD_COLORS = ['#64c8ff','#4facfe','#00f2fe','#48d1cc','#76e2f8','#5bc0eb','#64c8ff','#4facfe','#00f2fe','#48d1cc','#76e2f8','#5bc0eb','#64c8ff','#4facfe','#00f2fe','#48d1cc'];
const WAVEFORMS = ['sine', 'square', 'triangle', 'sawtooth'];

const btnBase = {
  background: 'transparent',
  color: '#8892a8',
  border: '1px solid rgba(100,200,255,0.15)',
  borderRadius: '4px',
  padding: '0.3rem 0.6rem',
  fontFamily: 'var(--font-mono)',
  fontSize: '0.7rem',
  cursor: 'pointer',
};

const btnActive = {
  borderColor: '#64c8ff',
  color: '#64c8ff',
};

const btnRecording = {
  borderColor: '#ff6b6b',
  color: '#ff6b6b',
};

const SynthPad = () => {
  const [active, setActive] = useState(null);
  const [ripples, setRipples] = useState([]);
  const [waveform, setWaveform] = useState('sine');
  const [volume, setVolume] = useState(0.3);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recording, setRecording] = useState([]);
  const [playbackHighlight, setPlaybackHighlight] = useState(null);

  const audioCtxRef = useRef(null);
  const recordStartRef = useRef(null);
  const recordingRef = useRef([]);
  const playbackTimeoutsRef = useRef([]);
  const isRecordingRef = useRef(false);

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) audioCtxRef.current.close();
      playbackTimeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  const playNote = useCallback((note, index) => {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = waveform;
    osc.frequency.setValueAtTime(NOTE_FREQ[note], ctx.currentTime);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.8);

    if (isRecordingRef.current && recordStartRef.current !== null) {
      const timestamp = Date.now() - recordStartRef.current;
      recordingRef.current = [...recordingRef.current, { note, index, timestamp }];
      setRecording([...recordingRef.current]);
    }

    setActive(index);
    setRipples(prev => [...prev, { id: Date.now(), index }]);
    setTimeout(() => setActive(null), 200);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== Date.now())), 600);
  }, [waveform, volume]);

  const startRecording = useCallback(() => {
    playbackTimeoutsRef.current.forEach(clearTimeout);
    playbackTimeoutsRef.current = [];
    setIsPlaying(false);
    setPlaybackHighlight(null);

    recordingRef.current = [];
    setRecording([]);
    recordStartRef.current = Date.now();
    isRecordingRef.current = true;
    setIsRecording(true);
  }, []);

  const stopAll = useCallback(() => {
    if (isRecordingRef.current) {
      isRecordingRef.current = false;
      setIsRecording(false);
      setRecording([...recordingRef.current]);
    }
    playbackTimeoutsRef.current.forEach(clearTimeout);
    playbackTimeoutsRef.current = [];
    setIsPlaying(false);
    setPlaybackHighlight(null);
  }, []);

  const startPlayback = useCallback(() => {
    const seq = recordingRef.current;
    if (seq.length === 0) return;

    playbackTimeoutsRef.current.forEach(clearTimeout);
    playbackTimeoutsRef.current = [];

    if (isRecordingRef.current) {
      isRecordingRef.current = false;
      setIsRecording(false);
    }

    setIsPlaying(true);

    seq.forEach((event, i) => {
      const tid = setTimeout(() => {
        playNote(event.note, event.index);
        setPlaybackHighlight(event.index);
        setTimeout(() => setPlaybackHighlight(null), 200);

        if (i === seq.length - 1) {
          setTimeout(() => {
            setIsPlaying(false);
            setPlaybackHighlight(null);
          }, 300);
        }
      }, event.timestamp);
      playbackTimeoutsRef.current.push(tid);
    });
  }, [playNote]);

  const clearRecording = useCallback(() => {
    playbackTimeoutsRef.current.forEach(clearTimeout);
    playbackTimeoutsRef.current = [];
    recordingRef.current = [];
    recordStartRef.current = null;
    isRecordingRef.current = false;
    setRecording([]);
    setIsRecording(false);
    setIsPlaying(false);
    setPlaybackHighlight(null);
  }, []);

  const recordingDuration = recording.length > 0
    ? ((recording[recording.length - 1].timestamp) / 1000).toFixed(1)
    : '0.0';

  return (
    <div className="synth-pad" style={isRecording ? { boxShadow: '0 0 0 2px #ff6b6b', borderColor: '#ff6b6b' } : undefined}>
      {isRecording && (
        <div style={{
          position: 'absolute',
          top: '0.5rem',
          right: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem',
          color: '#ff6b6b',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.65rem',
        }}>
          <span style={{
            display: 'inline-block',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#ff6b6b',
            animation: 'synthPadPulse 1s ease-in-out infinite',
          }} />
          REC
          <style>{`@keyframes synthPadPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
        </div>
      )}

      <div className="synth-pad__grid">
        {NOTES.map((note, i) => (
          <button
            key={note}
            className={`synth-pad__key ${active === i ? 'synth-pad__key--active' : ''}`}
            style={{
              '--pad-color': PAD_COLORS[i],
              touchAction: 'none',
              ...(playbackHighlight === i ? { boxShadow: `0 0 12px ${PAD_COLORS[i]}, inset 0 0 8px ${PAD_COLORS[i]}` } : {}),
            }}
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

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.6rem', alignItems: 'center' }}>
        <button
          className="synth-pad__btn"
          style={{ ...btnBase, ...(isRecording ? btnRecording : {}) }}
          onClick={isRecording ? stopAll : startRecording}
        >
          {isRecording ? '[Stop Rec]' : '[Record]'}
        </button>
        <button
          className="synth-pad__btn"
          style={{ ...btnBase, ...(isPlaying ? btnActive : {}), ...(recording.length === 0 ? { opacity: 0.4, cursor: 'default' } : {}) }}
          onClick={startPlayback}
          disabled={recording.length === 0}
        >
          {isPlaying ? '[Playing...]' : '[Play]'}
        </button>
        <button
          className="synth-pad__btn"
          style={{ ...btnBase, ...(isPlaying || isRecording ? btnActive : {}) }}
          onClick={stopAll}
        >
          [Stop]
        </button>
        <button
          className="synth-pad__btn"
          style={{ ...btnBase, ...(recording.length === 0 ? { opacity: 0.4, cursor: 'default' } : {}) }}
          onClick={clearRecording}
          disabled={recording.length === 0}
        >
          [Clear]
        </button>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.65rem',
          color: '#8892a8',
          marginLeft: '0.3rem',
        }}>
          {recording.length} note{recording.length !== 1 ? 's' : ''} / {recordingDuration}s
        </span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#8892a8', marginRight: '0.2rem' }}>
          Wave:
        </span>
        {WAVEFORMS.map((w) => (
          <button
            key={w}
            className="synth-pad__btn"
            style={{ ...btnBase, ...(waveform === w ? btnActive : {}) }}
            onClick={() => setWaveform(w)}
          >
            {w}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', alignItems: 'center' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#8892a8' }}>
          Vol:
        </span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          style={{
            flex: 1,
            maxWidth: '120px',
            accentColor: '#64c8ff',
            cursor: 'pointer',
            height: '4px',
          }}
        />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#8892a8' }}>
          {Math.round(volume * 100)}%
        </span>
      </div>

      <p className="synth-pad__hint">Tap or click pads to play.</p>
    </div>
  );
};

export default SynthPad;
