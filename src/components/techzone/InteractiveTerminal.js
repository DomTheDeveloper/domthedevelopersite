import React, { useState, useRef, useEffect } from 'react';

const commands = {
  help: () => 'Available commands: help, about, skills, stack, socials, clear, date, whoami, echo <msg>, matrix, joke',
  about: () => 'Dom the Developer — Software Engineer & Computer Scientist.\nPassionate about building elegant solutions to complex problems.',
  whoami: () => 'Dom the Developer',
  skills: () => 'React | TypeScript | Node.js | Python | Go | PostgreSQL | Docker | AWS | Linux | Git',
  stack: () => '> Frontend:  React, Next.js, TypeScript, Tailwind\n> Backend:   Node.js, Python, Go\n> Database:  PostgreSQL, Redis, MongoDB\n> DevOps:    Docker, AWS, CI/CD\n> Tools:     Git, Linux, Vim',
  socials: () => '> GitHub:    github.com/DomTheDeveloper\n> X:         x.com/domthedeveloper\n> Instagram: instagram.com/domthedeveloper',
  date: () => new Date().toLocaleString(),
  joke: () => {
    const jokes = [
      'Why do programmers prefer dark mode? Because light attracts bugs.',
      'A SQL query walks into a bar, walks up to two tables and asks... "Can I join you?"',
      'There are only 10 types of people in the world: those who understand binary and those who don\'t.',
      '!false — it\'s funny because it\'s true.',
      'A programmer puts two glasses on his bedside table. One full, one empty. The full one in case he gets thirsty. The empty one in case he doesn\'t.',
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  },
  matrix: () => 'FOLLOW THE WHITE RABBIT...\n\n01001000 01100101 01101100 01101100 01101111\n01010111 01101111 01110010 01101100 01100100\n\n...Wake up, Neo.',
};

const InteractiveTerminal = () => {
  const [history, setHistory] = useState([
    { type: 'output', text: 'Welcome to DomOS v2.0 — Type "help" for available commands.' },
  ]);
  const [input, setInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const bodyRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [history]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    const newHistory = [...history, { type: 'input', text: trimmed }];
    setCmdHistory(prev => [...prev, trimmed]);
    setHistoryIndex(-1);

    if (trimmed === 'clear') {
      setHistory([]);
      setInput('');
      return;
    }

    const parts = trimmed.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');

    let output;
    if (cmd === 'echo') {
      output = args || '';
    } else if (commands[cmd]) {
      output = typeof commands[cmd] === 'function' ? commands[cmd]() : commands[cmd];
    } else {
      output = `command not found: ${cmd}. Type "help" for available commands.`;
    }

    newHistory.push({ type: 'output', text: output });
    setHistory(newHistory);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length > 0) {
        const newIndex = historyIndex === -1 ? cmdHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(cmdHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= cmdHistory.length) {
          setHistoryIndex(-1);
          setInput('');
        } else {
          setHistoryIndex(newIndex);
          setInput(cmdHistory[newIndex]);
        }
      }
    }
  };

  return (
    <div className="terminal terminal--interactive" onClick={() => inputRef.current?.focus()} style={{ overflow: 'hidden', maxWidth: '100%' }}>
      <div className="terminal__header">
        <span className="terminal__dot terminal__dot--red" />
        <span className="terminal__dot terminal__dot--yellow" />
        <span className="terminal__dot terminal__dot--green" />
        <span className="terminal__title">dom@dev:~$ — interactive</span>
      </div>
      <div className="terminal__body terminal__body--interactive" ref={bodyRef}>
        {history.map((entry, i) => (
          <div key={i} className={`terminal__line terminal__line--${entry.type}`}>
            {entry.type === 'input' && <span className="terminal__prompt">$</span>}
            <span style={{ whiteSpace: 'pre-wrap' }}>{entry.text}</span>
          </div>
        ))}
        <form onSubmit={handleSubmit} className="terminal__input-row">
          <span className="terminal__prompt" aria-hidden="true">$</span>
          <label className="visually-hidden" htmlFor="techzone-terminal-input">
            Terminal command — type help for a list
          </label>
          <input
            id="techzone-terminal-input"
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="terminal__input"
            autoComplete="off"
            spellCheck="false"
          />
        </form>
      </div>
    </div>
  );
};

export default InteractiveTerminal;
