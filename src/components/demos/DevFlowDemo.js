import React, { useEffect, useRef, useState } from 'react';

const TEMPLATES = ['fastapi', 'nextjs', 'go-service', 'rust-cli', 'express', 'django'];
const TARGETS = ['fly', 'render', 'aws', 'k8s'];

const BANNER = [
  { t: 'out', text: 'DevFlow CLI v2.4.0 — plugin-based project automation' },
  { t: 'dim', text: 'Type "help" for commands, or Tab to complete. ↑/↓ walks history.' },
];

let lineSeq = 0;
const mk = (t, text) => ({ id: ++lineSeq, t, text });

const DevFlowDemo = () => {
  const [lines, setLines] = useState(() => BANNER.map((l) => mk(l.t, l.text)));
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [busy, setBusy] = useState(false);
  const [cwd, setCwd] = useState('~/projects');
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
    if (endRef.current) endRef.current.scrollIntoView({ block: 'nearest' });
  }, [lines]);

  const append = (...items) => setLines((prev) => [...prev, ...items]);

  // Staged output — a real CLI doesn't dump everything in one frame.
  const stage = (steps) => {
    setBusy(true);
    let delay = 0;
    steps.forEach(([t, text, gap = 320]) => {
      delay += gap;
      timers.current.push(setTimeout(() => append(mk(t, text)), delay));
    });
    timers.current.push(setTimeout(() => { setBusy(false); inputRef.current?.focus(); }, delay + 120));
  };

  const COMMANDS = {
    help: () => append(
      mk('out', 'Commands:'),
      mk('dim', '  init <name> [--stack <s>]   scaffold a new project'),
      mk('dim', '  scaffold <stack>            apply a template in place'),
      mk('dim', '  deploy [target] [--dry]     build, push, and roll out'),
      mk('dim', '  rollback                    revert to the previous release'),
      mk('dim', '  status                      show environment health'),
      mk('dim', '  logs [service]              tail recent output'),
      mk('dim', '  plugins                     list installed generators'),
      mk('dim', '  doctor                      check the local toolchain'),
      mk('dim', '  templates                   list available stacks'),
      mk('dim', '  clear                       clear the screen'),
    ),

    templates: () => append(mk('out', `available stacks: ${TEMPLATES.join(', ')}`)),

    plugins: () => append(
      mk('out', 'NAME                VERSION   SOURCE'),
      mk('dim', 'devflow-core        2.4.0     builtin'),
      mk('dim', 'devflow-docker      1.9.2     builtin'),
      mk('dim', 'devflow-gha         1.4.0     builtin'),
      mk('dim', 'acme-internal       0.7.1     entry_point'),
    ),

    doctor: () => stage([
      ['out', '→ checking toolchain…', 200],
      ['ok', '✓ python 3.12.4'],
      ['ok', '✓ docker 27.1.1 (daemon reachable)'],
      ['ok', '✓ git 2.45.2'],
      ['warn', '! registry credentials expire in 6 days'],
      ['out', 'doctor: 3 ok, 1 warning'],
    ]),

    init: (args) => {
      const name = args.find((a) => !a.startsWith('--')) || 'my-app';
      const stackFlag = args.indexOf('--stack');
      const stack = stackFlag > -1 ? args[stackFlag + 1] : 'fastapi';
      if (!TEMPLATES.includes(stack)) {
        append(mk('err', `unknown stack: ${stack}`), mk('dim', `try one of: ${TEMPLATES.join(', ')}`));
        return;
      }
      stage([
        ['out', `→ resolving template "${stack}"…`, 200],
        ['ok', `✓ scaffolded ${name}/ (14 files)`],
        ['ok', '✓ wrote Dockerfile + compose.yaml'],
        ['ok', '✓ wrote .github/workflows/ci.yml'],
        ['ok', '✓ initialized git repo, first commit staged'],
        ['out', ''],
        ['ok', `ready → cd ${name} && devflow deploy`, 180],
      ]);
      setCwd(`~/projects/${name}`);
    },

    scaffold: (args) => {
      const stack = args[0] || 'fastapi';
      if (!TEMPLATES.includes(stack)) {
        append(mk('err', `unknown stack: ${stack}`), mk('dim', `try: ${TEMPLATES.join(', ')}`));
        return;
      }
      stage([
        ['out', `→ applying "${stack}" in place…`, 200],
        ['ok', `✓ 14 files written, 2 skipped (already present)`],
        ['dim', '  run `git diff` to review before committing'],
      ]);
    },

    deploy: (args) => {
      const dry = args.includes('--dry');
      const tgt = args.find((a) => !a.startsWith('--')) || 'fly';
      if (!TARGETS.includes(tgt)) {
        append(mk('err', `unknown target: ${tgt}`), mk('dim', `targets: ${TARGETS.join(', ')}`));
        return;
      }
      if (dry) {
        stage([
          ['out', `→ plan for ${tgt} (no changes will be applied)`, 200],
          ['dim', '  1. build image        api:sha-9f2c1ab'],
          ['dim', '  2. push to registry   ghcr.io/dom/api'],
          ['dim', `  3. roll out           ${tgt}/prod · 3 replicas`],
          ['dim', '  4. health check       /healthz × 3'],
          ['out', 'dry run: 4 steps, 0 applied'],
        ]);
        return;
      }
      stage([
        ['out', '→ building image…', 200],
        ['dim', '  [1/4] base layer          cached'],
        ['dim', '  [2/4] dependencies        18.2s'],
        ['dim', '  [3/4] application         4.1s'],
        ['dim', '  [4/4] export              2.8s'],
        ['out', '→ pushing ghcr.io/dom/api:sha-9f2c1ab…'],
        ['out', `→ rolling out to ${tgt}/prod…`],
        ['dim', '  replica 1/3 healthy'],
        ['dim', '  replica 2/3 healthy'],
        ['dim', '  replica 3/3 healthy'],
        ['ok', `✓ live at https://api.${tgt}.dev — took 47s`],
      ]);
    },

    rollback: () => stage([
      ['out', '→ previous release: sha-7b0e4dd (deployed 3h ago)', 200],
      ['out', '→ shifting traffic…'],
      ['ok', '✓ rolled back — 3/3 replicas on sha-7b0e4dd'],
    ]),

    status: () => append(
      mk('out', 'env: prod · region: iad · 3 services'),
      mk('ok', '  api        healthy   sha-9f2c1ab   3/3 replicas'),
      mk('ok', '  worker     healthy   sha-9f2c1ab   2/2 replicas'),
      mk('warn', '  scheduler  degraded  sha-7b0e4dd   1/2 replicas'),
    ),

    logs: (args) => {
      const svc = args[0] || 'api';
      stage([
        ['dim', `— tailing ${svc} —`, 180],
        ['dim', `12:04:11 ${svc} GET /v1/health 200 1.2ms`],
        ['dim', `12:04:11 ${svc} GET /v1/users 200 14.8ms`],
        ['warn', `12:04:12 ${svc} POST /v1/orders 429 rate limited`],
        ['dim', `12:04:12 ${svc} GET /v1/search 200 31.4ms`],
      ]);
    },
  };

  const run = (raw) => {
    const cmd = raw.trim();
    append(mk('cmd', cmd));
    if (!cmd) return;
    setHistory((h) => [cmd, ...h.filter((c) => c !== cmd)].slice(0, 30));
    const [head, ...rest] = cmd.split(/\s+/);
    if (head === 'clear') { setLines([]); return; }
    const fn = COMMANDS[head];
    if (!fn) {
      const guess = Object.keys(COMMANDS).find((c) => c.startsWith(head[0]));
      append(
        mk('err', `unknown command: ${head}`),
        mk('dim', guess ? `did you mean "${guess}"? try "help"` : 'try "help"'),
      );
      return;
    }
    fn(rest);
  };

  const complete = () => {
    const parts = input.split(/\s+/);
    const pool = parts.length <= 1
      ? Object.keys(COMMANDS).concat('clear')
      : parts[0] === 'deploy' ? TARGETS
        : (parts[0] === 'scaffold' || parts[0] === 'init') ? TEMPLATES
          : [];
    const frag = parts[parts.length - 1];
    const hits = pool.filter((c) => c.startsWith(frag));
    if (hits.length === 1) {
      parts[parts.length - 1] = hits[0];
      setInput(parts.join(' ') + ' ');
    } else if (hits.length > 1) {
      append(mk('dim', hits.join('  ')));
    }
  };

  const onKey = (e) => {
    if (e.key === 'Enter') {
      if (busy) return;
      run(input);
      setInput('');
      setHistIdx(-1);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      complete();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(histIdx + 1, history.length - 1);
      if (next >= 0) { setHistIdx(next); setInput(history[next]); }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = histIdx - 1;
      setHistIdx(next);
      setInput(next >= 0 ? history[next] : '');
    }
  };

  return (
    <div className="demo demo--devflow">
      <div className="demo__topbar">
        <span className="demo__dot" style={{ background: '#ff5f57' }} />
        <span className="demo__dot" style={{ background: '#febc2e' }} />
        <span className="demo__dot" style={{ background: '#28c840' }} />
        <span className="demo__topbar-right">devflow · {cwd}</span>
      </div>

      <div className="demo__term" onClick={() => inputRef.current?.focus()}>
        {lines.map((l) => (
          <div key={l.id} className={`demo__term-line demo__term-line--${l.t}`}>
            {l.t === 'cmd' ? <><span className="demo__term-prompt">$</span> {l.text}</> : l.text}
          </div>
        ))}
        <div className="demo__term-input-row">
          <span className="demo__term-prompt" aria-hidden="true">$</span>
          <label className="visually-hidden" htmlFor="devflow-input">DevFlow command</label>
          <input
            id="devflow-input"
            ref={inputRef}
            className="demo__term-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder={busy ? 'working…' : 'try: deploy --dry'}
            disabled={busy}
            autoComplete="off"
            spellCheck="false"
          />
        </div>
        <div ref={endRef} />
      </div>

      <div className="demo__controls demo__controls--wrap">
        {['help', 'init api --stack go-service', 'deploy --dry', 'doctor', 'status', 'plugins'].map((c) => (
          <button
            key={c}
            type="button"
            className="demo__chip"
            disabled={busy}
            onClick={() => { run(c); setInput(''); }}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DevFlowDemo;
