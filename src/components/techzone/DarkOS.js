import React, { useRef, useEffect, useState } from 'react';

const DarkOS = () => {
  const [openWindow, setOpenWindow] = useState(null);
  const [notepadText, setNotepadText] = useState('// Welcome to DarkOS Notepad\n// Start typing...\n');
  const [termOutput, setTermOutput] = useState(['DarkOS Terminal v1.0', 'Type a command...']);
  const [termInput, setTermInput] = useState('');
  const [time, setTime] = useState(new Date());
  const [windowPos, setWindowPos] = useState({ x: 20, y: 20 });
  const dragRef = useRef({ dragging: false, offsetX: 0, offsetY: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const apps = [
    { id: 'computer', name: 'My Computer', icon: '💻' },
    { id: 'notepad', name: 'Notepad', icon: '📝' },
    { id: 'terminal', name: 'Terminal', icon: '⬛' },
    { id: 'browser', name: 'Browser', icon: '🌐' },
    { id: 'music', name: 'Music', icon: '🎵' },
    { id: 'trash', name: 'Recycle Bin', icon: '🗑️' },
  ];

  const handleTermSubmit = (e) => {
    e.preventDefault();
    const cmd = termInput.trim().toLowerCase();
    let output = `> ${termInput}`;
    const responses = {
      help: 'Commands: help, ls, pwd, date, whoami, clear, echo <msg>, neofetch',
      ls: 'Desktop/  Documents/  Downloads/  Music/  secret_projects/',
      pwd: '/home/dom',
      date: new Date().toLocaleString(),
      whoami: 'dom',
      neofetch: `     ╔══════╗     dom@darkos\n     ║DarkOS║     OS: DarkOS 2.0\n     ╚══════╝     Shell: darksh\n                   CPU: Quantum i9\n                   RAM: 128GB\n                   Theme: Neon Blue`,
    };
    if (cmd === 'clear') { setTermOutput([]); setTermInput(''); return; }
    const base = cmd.split(' ')[0];
    const resp = base === 'echo' ? cmd.slice(5) : (responses[base] || `command not found: ${base}`);
    setTermOutput(prev => [...prev, output, resp]);
    setTermInput('');
  };

  const startDrag = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    dragRef.current = { dragging: true, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top };
  };

  useEffect(() => {
    const onMove = (e) => {
      if (!dragRef.current.dragging || !containerRef.current) return;
      const cr = containerRef.current.getBoundingClientRect();
      setWindowPos({
        x: Math.max(0, e.clientX - cr.left - dragRef.current.offsetX),
        y: Math.max(0, e.clientY - cr.top - dragRef.current.offsetY),
      });
    };
    const onUp = () => { dragRef.current.dragging = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, []);

  const renderWindowContent = () => {
    switch (openWindow) {
      case 'computer':
        return (
          <div className="darkos-file-grid">
            {['System (C:)', 'Data (D:)', 'Projects (E:)', 'Backup (F:)'].map(d => (
              <div key={d} className="darkos-file-item">
                <span className="darkos-file-icon">💾</span>
                <span className="darkos-file-name">{d}</span>
              </div>
            ))}
          </div>
        );
      case 'notepad':
        return <textarea className="darkos-notepad" value={notepadText} onChange={e => setNotepadText(e.target.value)} spellCheck={false} />;
      case 'terminal':
        return (
          <div className="darkos-term">
            <div className="darkos-term-output">
              {termOutput.map((line, i) => <div key={i} style={{ whiteSpace: 'pre-wrap' }}>{line}</div>)}
            </div>
            <form onSubmit={handleTermSubmit} className="darkos-term-input-row">
              <span style={{ color: '#64c8ff' }}>$</span>
              <input value={termInput} onChange={e => setTermInput(e.target.value)} className="darkos-term-input" autoComplete="off" spellCheck={false} />
            </form>
          </div>
        );
      case 'browser':
        return (
          <div className="darkos-browser">
            <div className="darkos-browser-bar">
              <span className="darkos-browser-url">https://domthedeveloper.com</span>
            </div>
            <div className="darkos-browser-content">
              <p style={{ color: '#64c8ff', fontWeight: 700, fontSize: '1.1rem' }}>&lt;Dom/&gt;</p>
              <p style={{ color: '#8892a8', fontSize: '0.8rem', marginTop: 8 }}>Software Engineer & Computer Scientist</p>
              <p style={{ color: '#515c72', fontSize: '0.7rem', marginTop: 12 }}>You're already here. 🚀</p>
            </div>
          </div>
        );
      case 'music':
        return (
          <div className="darkos-music">
            <div style={{ color: '#64c8ff', fontSize: '2rem', marginBottom: 8 }}>🎵</div>
            <p style={{ color: '#e4eaf5', fontSize: '0.85rem' }}>Now Playing</p>
            <p style={{ color: '#8892a8', fontSize: '0.75rem' }}>Lo-fi Beats to Code To</p>
            <div className="darkos-music-bar">
              <div className="darkos-music-progress" />
            </div>
            <div className="darkos-music-controls">
              <span>⏮</span><span>▶</span><span>⏭</span>
            </div>
          </div>
        );
      case 'trash':
        return (
          <div style={{ padding: 20, textAlign: 'center', color: '#515c72', fontSize: '0.85rem' }}>
            <p>🗑️</p>
            <p style={{ marginTop: 8 }}>Recycle Bin is empty.</p>
            <p style={{ fontSize: '0.7rem', marginTop: 4 }}>Dom writes clean code.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="darkos" ref={containerRef}>
      <div className="darkos-desktop">
        <div className="darkos-icons">
          {apps.map(app => (
            <button key={app.id} className="darkos-icon" onClick={() => { setOpenWindow(app.id); setWindowPos({ x: 20 + Math.random() * 40, y: 20 + Math.random() * 20 }); }}>
              <span className="darkos-icon-img">{app.icon}</span>
              <span className="darkos-icon-label">{app.name}</span>
            </button>
          ))}
        </div>

        {openWindow && (
          <div className="darkos-window" style={{ left: windowPos.x, top: windowPos.y }}>
            <div className="darkos-window-titlebar" onMouseDown={startDrag}>
              <span className="darkos-window-title">
                {apps.find(a => a.id === openWindow)?.icon} {apps.find(a => a.id === openWindow)?.name}
              </span>
              <div className="darkos-window-btns">
                <span className="darkos-window-btn darkos-window-btn--min">─</span>
                <span className="darkos-window-btn darkos-window-btn--max">□</span>
                <span className="darkos-window-btn darkos-window-btn--close" onClick={() => setOpenWindow(null)}>✕</span>
              </div>
            </div>
            <div className="darkos-window-body">
              {renderWindowContent()}
            </div>
          </div>
        )}
      </div>

      <div className="darkos-taskbar">
        <button className="darkos-start">⚡ Start</button>
        <div className="darkos-taskbar-apps">
          {openWindow && (
            <span className="darkos-taskbar-item darkos-taskbar-item--active">
              {apps.find(a => a.id === openWindow)?.icon} {apps.find(a => a.id === openWindow)?.name}
            </span>
          )}
        </div>
        <span className="darkos-clock">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    </div>
  );
};

export default DarkOS;
