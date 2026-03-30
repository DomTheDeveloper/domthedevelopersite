import React, { useState, useEffect, useRef, useCallback } from 'react';

const ReactionTime = () => {
  const [state, setState] = useState('waiting'); // waiting, ready, go, result
  const [time, setTime] = useState(0);
  const [times, setTimes] = useState([]);
  const startRef = useRef(0);
  const timerRef = useRef(null);

  const startRound = useCallback(() => {
    setState('ready');
    const delay = 1500 + Math.random() * 3000;
    timerRef.current = setTimeout(() => {
      startRef.current = Date.now();
      setState('go');
    }, delay);
  }, []);

  const handleClick = () => {
    if (state === 'waiting') { startRound(); return; }
    if (state === 'ready') {
      clearTimeout(timerRef.current);
      setState('waiting');
      return;
    }
    if (state === 'go') {
      const elapsed = Date.now() - startRef.current;
      setTime(elapsed);
      setTimes(prev => [...prev.slice(-4), elapsed]);
      setState('result');
      return;
    }
    if (state === 'result') { startRound(); }
  };

  useEffect(() => { return () => clearTimeout(timerRef.current); }, []);

  const avg = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
  const best = times.length > 0 ? Math.min(...times) : 0;

  const bgColors = { waiting: '#0d1220', ready: '#1a1520', go: '#0d2010', result: '#0d1220' };
  const messages = {
    waiting: { title: 'REACTION TEST', sub: 'Click to start. When the screen turns green, click!' },
    ready: { title: 'WAIT FOR IT...', sub: 'Click when the screen changes...' },
    go: { title: 'CLICK NOW!', sub: '' },
    result: { title: `${time}ms`, sub: 'Click to try again' },
  };

  return (
    <div className="reaction" style={{ background: bgColors[state] }} onClick={handleClick}>
      <div className="reaction__content">
        <h3 className="reaction__title" style={{ color: state === 'go' ? '#28c840' : state === 'ready' ? '#ff6b6b' : '#64c8ff' }}>
          {messages[state].title}
        </h3>
        <p className="reaction__sub">{messages[state].sub}</p>
        {state === 'ready' && <p style={{ color: '#ff6b6b', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', marginTop: '0.5rem' }}>Don't click yet!</p>}
        {times.length > 0 && state !== 'ready' && state !== 'go' && (
          <div className="reaction__stats">
            <span>Avg: {avg}ms</span>
            <span>Best: {best}ms</span>
            <span>Tries: {times.length}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReactionTime;
