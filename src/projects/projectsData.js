import React from 'react';

export const projectIcons = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <path d="M7 8h2" />
      <path d="M7 12h4" />
    </svg>
  ),
  terminal: (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M6 10l4 2-4 2" />
      <path d="M14 14h4" />
    </svg>
  ),
  brain: (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <circle cx="5" cy="6" r="2" />
      <circle cx="19" cy="6" r="2" />
      <circle cx="5" cy="18" r="2" />
      <circle cx="19" cy="18" r="2" />
      <path d="M9.5 10L6.5 7.5" />
      <path d="M14.5 10l3-2.5" />
      <path d="M9.5 14l-3 2.5" />
      <path d="M14.5 14l3 2.5" />
    </svg>
  ),
  chat: (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      <path d="M8 9h8" />
      <path d="M8 13h4" />
    </svg>
  ),
  server: (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="8" rx="2" />
      <rect x="2" y="14" width="20" height="8" rx="2" />
      <circle cx="6" cy="6" r="1" />
      <circle cx="6" cy="18" r="1" />
      <path d="M12 6h4" />
      <path d="M12 18h4" />
    </svg>
  ),
  brush: (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  ),
};

export const projects = [
  {
    slug: 'cloudsync-dashboard',
    title: 'CloudSync Dashboard',
    tagline: 'Real-time infrastructure observability at a glance.',
    description:
      'Real-time cloud infrastructure monitoring dashboard with live metrics, alerting, and beautiful data visualizations.',
    tags: ['React', 'Node.js', 'WebSocket', 'D3.js'],
    color: '#64c8ff',
    icon: 'dashboard',
    year: '2024',
    role: 'Lead Engineer',
    duration: '6 months',
    status: 'Production',
    demoUrl: '#',
    repoUrl: '#',
    overview:
      'CloudSync is a single pane of glass for distributed cloud infrastructure. Operators see CPU, memory, network, and request-level metrics streamed live from thousands of nodes, with anomaly detection surfaced as actionable alerts before customers feel anything.',
    problem:
      'A growing fleet of microservices generated millions of metrics per minute across three cloud providers. Existing tooling required tab-switching across five consoles and routinely lagged the actual incident by 90+ seconds.',
    solution:
      'A unified WebSocket-backed dashboard that aggregates time-series data, computes rolling baselines, and renders interactive D3 charts that stay smooth at 60fps even with 100k+ points on screen.',
    features: [
      { title: 'Live Streaming Metrics', desc: 'WebSocket pipeline pushes deltas to clients; UI updates with <100ms latency end-to-end.' },
      { title: 'Smart Alerts', desc: 'Anomaly detection on rolling z-scores routes alerts to PagerDuty, Slack, or webhooks based on severity.' },
      { title: 'Custom Dashboards', desc: 'Drag-and-drop widget composer with shareable JSON layouts and templated dashboards per service.' },
      { title: 'Drill-Down Tracing', desc: 'Click any spike to jump into traces, logs, and the responsible deploy in a single click.' },
    ],
    stack: [
      { name: 'React', why: 'Reactive UI primitives composed cleanly with the streaming data layer.' },
      { name: 'Node.js', why: 'Single language across the stack and great WebSocket libraries.' },
      { name: 'WebSocket', why: 'Bidirectional, low-overhead transport for sub-second metric pushes.' },
      { name: 'D3.js', why: 'Surgical control over rendering for high-density time-series charts.' },
    ],
    metrics: [
      { label: 'Metrics/sec', value: '2.4M' },
      { label: 'MTTR reduced', value: '63%' },
      { label: 'Active orgs', value: '120+' },
    ],
  },
  {
    slug: 'devflow-cli',
    title: 'DevFlow CLI',
    tagline: 'One command from idea to deployed.',
    description:
      'An intelligent CLI tool that automates development workflows, from scaffolding to deployment with a single command.',
    tags: ['Python', 'Click', 'Docker', 'CI/CD'],
    color: '#4facfe',
    icon: 'terminal',
    year: '2024',
    role: 'Creator & Maintainer',
    duration: 'Ongoing',
    status: 'Open Source',
    demoUrl: '#',
    repoUrl: '#',
    overview:
      'DevFlow is a polyglot CLI that absorbs the rituals of new-project setup. Scaffold a stack, wire CI, containerize, deploy to a chosen target — each through a friendly command that produces conventional, audit-friendly output.',
    problem:
      'Every new service started with the same week of plumbing: linting, formatting, Dockerfiles, CI pipelines, secrets, deploy targets. Teams diverged on conventions and onboarding drifted with each repo.',
    solution:
      'A plugin-based CLI with opinionated templates for common stacks. Each generator emits idiomatic config and pre-wired commands so engineers can ship a service end-to-end on day one.',
    features: [
      { title: 'Stack Scaffolds', desc: 'Idiomatic project layouts for FastAPI, Next.js, Go services, and more — each with tests, lint, and CI ready.' },
      { title: 'Container Pipeline', desc: 'Multi-stage Dockerfiles and Compose files generated from a single declarative manifest.' },
      { title: 'CI as a Plugin', desc: 'Drop-in GitHub Actions and GitLab CI workflows that match your scaffold and stay in sync.' },
      { title: 'Deploy Targets', desc: 'Push to Fly, Render, AWS, or your own Kubernetes from one consistent command.' },
    ],
    stack: [
      { name: 'Python', why: 'Mature CLI ecosystem and quick iteration on plugin APIs.' },
      { name: 'Click', why: 'Composable command structure with first-class help and shell completion.' },
      { name: 'Docker', why: 'Reproducible builds across local, CI, and production.' },
      { name: 'CI/CD', why: 'Generated pipelines keep convention and quality gates consistent.' },
    ],
    metrics: [
      { label: 'GitHub stars', value: '4.2k' },
      { label: 'Time-to-first-deploy', value: '< 10min' },
      { label: 'Templates shipped', value: '18' },
    ],
  },
  {
    slug: 'neuralnet-studio',
    title: 'NeuralNet Studio',
    tagline: 'Draw a neural network. Train it. Ship it.',
    description:
      'Visual neural network builder that lets you design, train, and deploy ML models through an intuitive drag-and-drop interface.',
    tags: ['TypeScript', 'TensorFlow.js', 'React', 'WebGL'],
    color: '#00f2fe',
    icon: 'brain',
    year: '2023',
    role: 'Founding Engineer',
    duration: '9 months',
    status: 'Beta',
    demoUrl: '#',
    repoUrl: '#',
    overview:
      'NeuralNet Studio turns model design into a visual conversation. Drag layers onto a canvas, point training data at it, watch loss curves move in real time — then export to TFJS, ONNX, or a hosted endpoint.',
    problem:
      'Teaching teams to prototype models meant teaching framework idioms first. The gap between "idea" and "training run" was steep enough that domain experts handed work off to ML engineers and lost iteration speed.',
    solution:
      'A drag-and-drop graph editor that compiles to TensorFlow.js, trains in-browser on small data and offloads to a GPU runner on big data, and exposes the underlying code for those who want to graduate to it.',
    features: [
      { title: 'Visual Graph Editor', desc: 'Layer palette, type-checked connections, and live shape inference as you build.' },
      { title: 'In-Browser Training', desc: 'Train small models entirely client-side; visualize gradients and activations live.' },
      { title: 'GPU Offload', desc: 'Larger jobs are streamed to a managed GPU pool and reported back to the same canvas.' },
      { title: 'Export Anywhere', desc: 'TFJS, ONNX, Python notebooks, or a one-click hosted inference endpoint.' },
    ],
    stack: [
      { name: 'TypeScript', why: 'Strong types catch malformed graphs before training even starts.' },
      { name: 'TensorFlow.js', why: 'Train and run real models inside the browser.' },
      { name: 'React', why: 'Composable canvas components and inspector panels.' },
      { name: 'WebGL', why: 'GPU-accelerated visualizations of activations and gradients.' },
    ],
    metrics: [
      { label: 'Models built', value: '12k+' },
      { label: 'Layer types', value: '40' },
      { label: 'Avg time-to-first-train', value: '4 min' },
    ],
  },
  {
    slug: 'quantumchat',
    title: 'QuantumChat',
    tagline: 'Private messaging that forgets, by design.',
    description:
      'End-to-end encrypted messaging platform with ephemeral messages, real-time translation, and zero-knowledge architecture.',
    tags: ['Next.js', 'PostgreSQL', 'Redis', 'WebRTC'],
    color: '#48d1cc',
    icon: 'chat',
    year: '2023',
    role: 'Full-Stack Engineer',
    duration: '7 months',
    status: 'Production',
    demoUrl: '#',
    repoUrl: '#',
    overview:
      'QuantumChat is an end-to-end encrypted messenger built around the idea that the server should know as little as possible. Messages are decrypted only on devices; metadata is minimized; live translation runs locally where it can.',
    problem:
      'Existing "secure" chat products leak metadata, retain unnecessary history, and tie identity to phone numbers. Cross-language teams also juggle external translation tools that defeat the privacy story.',
    solution:
      'Zero-knowledge architecture with per-device keys, sealed-sender envelopes, and ephemeral message policies enforced client-side. Translation runs in a sandbox on-device whenever the model fits.',
    features: [
      { title: 'E2E by Default', desc: 'Per-device key bundles, forward secrecy, and signed prekeys — no plaintext on the server.' },
      { title: 'Ephemeral Messages', desc: 'Choose disappearing windows from 5 minutes to 7 days; receipts respect the window.' },
      { title: 'Live Translation', desc: 'On-device translation with optional opt-in to a privacy-preserving cloud model.' },
      { title: 'WebRTC Calls', desc: 'Peer-to-peer audio and video with DTLS-SRTP, no media on the server.' },
    ],
    stack: [
      { name: 'Next.js', why: 'SSR for landing, edge functions for low-latency signaling.' },
      { name: 'PostgreSQL', why: 'Strict relational integrity for the small set of metadata we do keep.' },
      { name: 'Redis', why: 'Ephemeral queues and presence at scale.' },
      { name: 'WebRTC', why: 'Direct peer media; the server never sees plaintext.' },
    ],
    metrics: [
      { label: 'Daily messages', value: '8M+' },
      { label: 'Median latency', value: '120ms' },
      { label: 'Server-side plaintext', value: '0' },
    ],
  },
  {
    slug: 'hyperapi-gateway',
    title: 'HyperAPI Gateway',
    tagline: 'A gateway that disappears under load.',
    description:
      'High-performance API gateway with automatic rate limiting, caching, request transformation, and comprehensive analytics.',
    tags: ['Go', 'Redis', 'gRPC', 'Prometheus'],
    color: '#76e2f8',
    icon: 'server',
    year: '2024',
    role: 'Platform Engineer',
    duration: '5 months',
    status: 'Production',
    demoUrl: '#',
    repoUrl: '#',
    overview:
      'HyperAPI is the front door for a portfolio of internal services. It routes, throttles, caches, transforms, and reports — all while staying out of the way of the engineers it serves.',
    problem:
      'A patchwork of nginx configs, sidecar proxies, and bespoke middlewares meant rate-limits drifted, analytics were partial, and debugging crossed three repos. P99 latency floors were dominated by the gateway hop itself.',
    solution:
      'A single Go binary with a declarative route config, in-memory + Redis-backed caching, token-bucket limits, and a streaming OpenTelemetry pipeline. Hot-reloads config without dropping connections.',
    features: [
      { title: 'Declarative Routes', desc: 'Versioned YAML config; preview diffs in CI; reload live without dropped requests.' },
      { title: 'Adaptive Rate Limits', desc: 'Per-key, per-route, and per-tenant token buckets backed by Redis.' },
      { title: 'Edge Caching', desc: 'Surrogate-key aware cache with selective purge, ETag negotiation, and stale-while-revalidate.' },
      { title: 'Deep Telemetry', desc: 'Prometheus metrics, OTLP traces, and structured access logs out of the box.' },
    ],
    stack: [
      { name: 'Go', why: 'Predictable latency, easy single-binary deploys, and great net/http primitives.' },
      { name: 'Redis', why: 'Fast shared state for limits, cache, and feature flags.' },
      { name: 'gRPC', why: 'Strict contracts between gateway and upstreams.' },
      { name: 'Prometheus', why: 'Battle-tested metrics with a rich query language.' },
    ],
    metrics: [
      { label: 'Throughput', value: '180k rps' },
      { label: 'P99 overhead', value: '< 2ms' },
      { label: 'Configs hot-reloaded', value: '4.7k' },
    ],
  },
  {
    slug: 'pixelforge',
    title: 'PixelForge',
    tagline: 'A creative studio in your tab.',
    description:
      'Browser-based creative coding environment for generative art, shaders, and interactive visual experiments.',
    tags: ['WebGL', 'GLSL', 'Canvas', 'React'],
    color: '#5bc0eb',
    icon: 'brush',
    year: '2022',
    role: 'Creator',
    duration: 'Ongoing',
    status: 'Open Source',
    demoUrl: '#',
    repoUrl: '#',
    overview:
      'PixelForge is a creative coding playground that boots in the browser. Write a shader, sketch with Canvas, or wire up an interactive piece — then publish or remix in a click.',
    problem:
      'Creative coders bounced between local installs, scattered Gists, and brittle online editors. Sharing experiments meant zipping files; remixing meant reinventing setup.',
    solution:
      'A self-contained editor with live shader compilation, hot-reload, a fork-and-remix social layer, and an offline-capable runtime that means experiments survive the next reboot.',
    features: [
      { title: 'Live Shader Editor', desc: 'GLSL with inline diagnostics, uniform inspectors, and millisecond recompiles.' },
      { title: 'Canvas Sketches', desc: 'Lightweight JS sketch runtime with a built-in palette and timeline.' },
      { title: 'Fork & Remix', desc: 'Every sketch is shareable, versioned, and forkable; remixes track lineage.' },
      { title: 'Offline-First', desc: 'Service workers cache the editor and sketches so you can work on a plane.' },
    ],
    stack: [
      { name: 'WebGL', why: 'Direct GPU access for real-time shader work.' },
      { name: 'GLSL', why: 'The lingua franca of fragment and vertex programs.' },
      { name: 'Canvas', why: 'Simple, performant 2D for sketches and overlays.' },
      { name: 'React', why: 'Composable editor panes, inspectors, and routing.' },
    ],
    metrics: [
      { label: 'Sketches shared', value: '23k+' },
      { label: 'Active creators', value: '3.4k' },
      { label: 'Forks per month', value: '1.1k' },
    ],
  },
];

export const getProject = (slug) => projects.find((p) => p.slug === slug);
