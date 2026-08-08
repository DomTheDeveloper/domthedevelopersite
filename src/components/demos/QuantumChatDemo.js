import React, { useEffect, useRef, useState } from 'react';
import { useActive } from './motion';

/* A toy stream cipher — enough to show that what the relay sees is not the
   message, without pretending to be real crypto. */
const deriveKey = () => Array.from({ length: 8 }, () => Math.floor(Math.random() * 256));

const encrypt = (text, key) => {
  const out = [];
  for (let i = 0; i < text.length; i++) {
    out.push((text.charCodeAt(i) ^ key[i % key.length] ^ (i * 31 & 0xff)) & 0xff);
  }
  return out;
};

const hex = (bytes, max = 28) =>
  bytes.slice(0, max).map((b) => b.toString(16).padStart(2, '0')).join(' ') + (bytes.length > max ? ' …' : '');

const fingerprint = (key) => key.map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 12);

const REPLIES = [
  'ack — sealed envelope received',
  'decrypted locally, nothing hit the disk',
  'rotating my prekey now',
  'that one expired before I opened it',
  'reading on device 2, fanned out fine',
];

const TTLS = [5, 15, 60];

let msgSeq = 0;

const QuantumChatDemo = () => {
  const active = useActive();
  const [key, setKey] = useState(deriveKey);
  const [ttl, setTtl] = useState(15);
  const [serverView, setServerView] = useState(false);
  const [draft, setDraft] = useState('');
  const [msgs, setMsgs] = useState(() => [
    { id: ++msgSeq, who: 'them', text: 'Did the keys rotate?', left: 12, ttl: 12, cipher: null },
    { id: ++msgSeq, who: 'me', text: 'Auto-rotated at 02:00 UTC.', left: 9, ttl: 9, cipher: null },
  ]);
  const feedRef = useRef(null);
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // Materialize ciphertext for the seeded messages once the key exists.
  useEffect(() => {
    setMsgs((prev) => prev.map((m) => (m.cipher ? m : { ...m, cipher: encrypt(m.text, key) })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!active) return undefined;
    const id = setInterval(() => {
      setMsgs((prev) => prev.map((m) => ({ ...m, left: m.left - 1 })).filter((m) => m.left > 0));
    }, 1000);
    return () => clearInterval(id);
  }, [active]);

  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [msgs]);

  const push = (who, text) =>
    setMsgs((prev) => [...prev, { id: ++msgSeq, who, text, left: ttl, ttl, cipher: encrypt(text, key) }].slice(-8));

  const send = () => {
    const t = draft.trim();
    if (!t) return;
    push('me', t);
    setDraft('');
    timers.current.push(setTimeout(() => {
      push('them', REPLIES[Math.floor(Math.random() * REPLIES.length)]);
    }, 800 + Math.random() * 700));
  };

  const rotate = () => {
    setKey(deriveKey());
    // Forward secrecy: history encrypted under the old key is unreadable now.
    setMsgs((prev) => prev.map((m) => ({ ...m, stale: true })));
  };

  return (
    <div className="demo demo--chat">
      <div className="demo__topbar">
        <span className={`demo__dot ${active ? 'demo__dot--live' : ''}`} /> e2e · 1 peer · 2 devices
        <span className="demo__topbar-right">key {fingerprint(key)}</span>
      </div>

      <div className="demo__toggle-row">
        <button
          type="button"
          className={`demo__toggle ${serverView ? 'demo__toggle--on' : ''}`}
          aria-pressed={serverView}
          onClick={() => setServerView((v) => !v)}
        >
          {serverView ? 'Server view: on' : 'Server view: off'}
        </button>
        <span className="demo__toggle-hint">
          {serverView ? 'exactly what the relay stores' : 'what the two devices see'}
        </span>
      </div>

      <div className="demo__chat-feed" ref={feedRef}>
        {msgs.map((m) => (
          <div key={m.id} className={`demo__chat-msg demo__chat-msg--${serverView ? 'server' : m.who}`}>
            {serverView ? (
              <>
                <div className="demo__chat-cipher-full">{hex(m.cipher || [])}</div>
                <div className="demo__chat-meta">
                  envelope {String(m.id).padStart(4, '0')} · {(m.cipher || []).length}B · recipient token 0x{fingerprint(key).slice(0, 6)}
                </div>
              </>
            ) : (
              <>
                <div className={`demo__chat-text ${m.stale ? 'demo__chat-text--stale' : ''}`}>
                  {m.stale ? '⌀ unreadable — key rotated' : m.text}
                </div>
                <div className="demo__chat-ttl">
                  <span className="demo__chat-ttl-bar" style={{ width: `${(m.left / m.ttl) * 100}%` }} />
                  disappears in {m.left}s
                </div>
              </>
            )}
          </div>
        ))}
        {msgs.length === 0 && <div className="demo__chat-empty">every message has self-destructed.</div>}
      </div>

      <div className="demo__chat-input-row">
        <label className="visually-hidden" htmlFor="chat-input">Encrypted message</label>
        <input
          id="chat-input"
          className="demo__term-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="type — it is encrypted before it leaves"
          autoComplete="off"
        />
        <button type="button" onClick={send} className="demo__chat-send">send</button>
      </div>

      {draft.trim() && (
        <div className="demo__cipher-preview">
          <span className="demo__cipher-preview-label">on the wire</span>
          <code>{hex(encrypt(draft.trim(), key), 20)}</code>
        </div>
      )}

      <div className="demo__controls demo__controls--wrap">
        <div className="demo__seg" role="group" aria-label="Disappear after">
          <span className="demo__seg-label">ttl</span>
          {TTLS.map((t) => (
            <button
              key={t}
              type="button"
              className={`demo__seg-btn ${ttl === t ? 'demo__seg-btn--active' : ''}`}
              aria-pressed={ttl === t}
              onClick={() => setTtl(t)}
            >
              {t}s
            </button>
          ))}
        </div>
        <button type="button" className="demo__btn" onClick={rotate}>Rotate keys</button>
        <button type="button" className="demo__btn" onClick={() => setMsgs([])}>Burn thread</button>
      </div>
    </div>
  );
};

export default QuantumChatDemo;
