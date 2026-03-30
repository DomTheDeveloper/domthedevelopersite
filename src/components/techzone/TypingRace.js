import React, { useRef, useState } from 'react';

const TypingRace = () => {
  const phrases = [
    'const dev = new Developer("Dom");',
    'git commit -m "ship it"',
    'npm run build && npm run deploy',
    'while (alive) { code(); sleep(); repeat(); }',
    'docker compose up --build -d',
    'SELECT * FROM projects WHERE awesome = true;',
    'export default function App() { return <Magic />; }',
    'sudo rm -rf /bugs --no-preserve-root',
  ];

  const [phrase, setPhrase] = useState('');
  const [input, setInput] = useState('');
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [bestWpm, setBestWpm] = useState(0);
  const inputRef = useRef(null);

  const startRace = () => {
    const p = phrases[Math.floor(Math.random() * phrases.length)];
    setPhrase(p);
    setInput('');
    setStarted(true);
    setFinished(false);
    setStartTime(Date.now());
    setWpm(0);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleInput = (e) => {
    if (finished) return;
    const val = e.target.value;
    setInput(val);

    // calculate accuracy
    let correct = 0;
    for (let i = 0; i < val.length; i++) {
      if (val[i] === phrase[i]) correct++;
    }
    setAccuracy(val.length > 0 ? Math.round((correct / val.length) * 100) : 100);

    if (val === phrase) {
      const elapsed = (Date.now() - startTime) / 1000 / 60;
      const words = phrase.split(' ').length;
      const w = Math.round(words / elapsed);
      setWpm(w);
      setBestWpm(prev => Math.max(prev, w));
      setFinished(true);
    }
  };

  return (
    <div className="typing-race">
      {!started ? (
        <div className="typing-race__start">
          <p style={{ color: '#8892a8', marginBottom: '1rem', fontSize: '0.9rem' }}>Test your typing speed with code snippets</p>
          <button className="arcade__tab arcade__tab--active" onClick={startRace}>Start Race</button>
        </div>
      ) : (
        <>
          <div className="typing-race__phrase">
            {phrase.split('').map((char, i) => {
              let cls = 'typing-race__char';
              if (i < input.length) {
                cls += input[i] === char ? ' typing-race__char--correct' : ' typing-race__char--wrong';
              } else if (i === input.length) {
                cls += ' typing-race__char--current';
              }
              return <span key={i} className={cls}>{char}</span>;
            })}
          </div>
          <input
            ref={inputRef}
            value={input}
            onChange={handleInput}
            className="typing-race__input"
            spellCheck={false}
            autoComplete="off"
            disabled={finished}
          />
          <div className="typing-race__stats">
            <span>Accuracy: {accuracy}%</span>
            {finished && <span className="typing-race__wpm">{wpm} WPM</span>}
            {bestWpm > 0 && <span>Best: {bestWpm} WPM</span>}
          </div>
          {finished && (
            <button className="arcade__tab arcade__tab--active" onClick={startRace} style={{ marginTop: '0.8rem' }}>
              Next Race
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default TypingRace;
