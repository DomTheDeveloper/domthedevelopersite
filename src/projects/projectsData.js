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
    architecture: [
      { name: 'Ingest gateway', role: 'Terminates agent WebSockets, validates and batches samples, and fans them into the aggregation tier. Backpressure is applied per connection so one noisy host cannot starve the fleet.' },
      { name: 'Rolling aggregator', role: 'Keeps per-series ring buffers at 1s, 10s, and 60s resolutions so a query never scans raw samples. Baselines and z-scores are computed here, once, rather than per viewer.' },
      { name: 'Fan-out hub', role: 'Maps subscriptions (org → dashboard → series) onto sockets and pushes only the deltas a given client is actually rendering.' },
      { name: 'Render layer', role: 'React owns layout and interaction; D3 owns the canvas. Charts render outside the React tree so a 100k-point redraw never touches the reconciler.' },
    ],
    challenges: [
      { title: 'React could not keep up with the stream', body: 'Pushing 2.4M samples/sec through component state was hopeless — the reconciler was the bottleneck, not the network. Charts moved to imperative canvas rendering with React reduced to mounting the node and handing over a ref. Frame time went from 90ms to under 8ms.' },
      { title: 'Alert storms buried the actual incident', body: 'One bad deploy could fire 400 alerts in a minute and hide the one that mattered. A correlation window now groups alerts sharing a deploy id or service, so on-call sees a single incident with 400 signals instead of 400 incidents.' },
      { title: 'Clocks disagreed across providers', body: 'Agents on three clouds drifted by up to eight seconds, which made cross-provider comparison meaningless. Samples are stamped on receipt at the gateway and reconciled against each agent\'s monotonic clock.' },
    ],
    timeline: [
      { phase: 'Discovery', detail: 'Shadowed on-call for three weeks and logged every tab an operator opened during an incident.' },
      { phase: 'Prototype', detail: 'One service, one chart, real WebSocket data — proving the render budget before building anything around it.' },
      { phase: 'Build', detail: 'Ingest, aggregation, alerting, and the dashboard composer, shipped behind a flag to two internal teams.' },
      { phase: 'Rollout', detail: 'Migrated 120 orgs off the legacy consoles over two months and decommissioned three of the five.' },
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
    architecture: [
      { name: 'Command core', role: 'A thin Click app that resolves config and dispatches — nothing else. Every real capability is a plugin, which keeps the core testable and the surface honest.' },
      { name: 'Plugin registry', role: 'Generators register through entry points, so a team can ship an internal template package without forking DevFlow.' },
      { name: 'Template engine', role: 'Jinja templates plus a manifest describing prompts, defaults, and post-generate hooks. Rendering is a pure function of manifest and answers, which makes generated output diffable in tests.' },
      { name: 'Doctor', role: 'A preflight that checks toolchain versions, Docker availability, and registry credentials so commands fail before they start rather than halfway through.' },
    ],
    challenges: [
      { title: 'Templates rotted faster than they shipped', body: 'Generated projects drifted from their template within a month. Golden-file tests now regenerate every template in CI and diff the result, so a breaking upstream change fails the build instead of someone\'s afternoon.' },
      { title: 'Opinionated fought usable', body: 'Early versions asked twelve questions before writing a file. Cutting it to one — the stack — and making everything else a flag with a sane default roughly doubled adoption.' },
      { title: 'Partial failures left wreckage', body: 'A failed deploy could strand a half-pushed image and a dangling registry tag. Commands are staged into a plan and applied with a rollback for every step that mutates remote state.' },
    ],
    timeline: [
      { phase: 'Scratch the itch', detail: 'Written over a weekend to stop hand-copying the same Dockerfile between services.' },
      { phase: 'Plugin rewrite', detail: 'Rebuilt the core around entry points once a third team wanted templates of their own.' },
      { phase: 'Open sourced', detail: 'Published with six templates and a contribution guide; the community added five more in the first quarter.' },
      { phase: 'Ongoing', detail: '18 templates, monthly releases, and a deprecation policy that has held for two years.' },
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
    architecture: [
      { name: 'Graph model', role: 'A typed IR describing layers, shapes, and connections. The canvas, the compiler, and the exporter all read from it, so there is exactly one definition of what a model is.' },
      { name: 'Shape inference', role: 'Runs on every edit and propagates shapes forward, so an invalid connection is refused while you are drawing it rather than an hour into a training run.' },
      { name: 'Compiler', role: 'Lowers the IR to a TensorFlow.js model or to Python source. Both paths share the same traversal, which is why they cannot disagree.' },
      { name: 'Training runtime', role: 'In-browser via TFJS for small models; larger jobs are serialized to a GPU worker pool that reports metrics back over the same channel.' },
    ],
    challenges: [
      { title: 'The browser froze during training', body: 'Training on the main thread locked the UI on anything past a toy model. Moving to a Web Worker with transferable tensors and a throttled metrics channel kept the canvas at 60fps through a full run.' },
      { title: 'People built models that could not train', body: 'The editor happily accepted graphs that exploded at the first backward pass. Shape inference and a preflight validator now catch dimension mismatches, dead branches, and unreachable outputs before the run button enables.' },
      { title: 'Exports drifted from the browser', body: 'Exported Python did not always reproduce in-browser results. Generating both from the same IR traversal fixed it; a parity test trains 20 reference graphs on both paths and compares losses on every release.' },
    ],
    timeline: [
      { phase: 'Spike', detail: 'Two weeks proving TensorFlow.js could train something non-trivial inside a tab.' },
      { phase: 'Editor', detail: 'Canvas, layer palette, and live shape inference — the parts that make the idea feel real.' },
      { phase: 'Runtime split', detail: 'Worker-based local training, then the GPU offload path for jobs that outgrew the browser.' },
      { phase: 'Beta', detail: 'Opened to 12k builders; export targets and the hosted endpoint came directly out of what they asked for.' },
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
    architecture: [
      { name: 'Key service', role: 'Stores public prekey bundles and nothing else. It can hand out the material needed to start a session and is close to useless to whoever steals it.' },
      { name: 'Envelope relay', role: 'Accepts sealed envelopes addressed by an opaque recipient token, so the server can route a message without learning who sent it.' },
      { name: 'Ephemeral store', role: 'Redis holds undelivered envelopes under a TTL matching the sender\'s policy. Expiry is enforced by the store, not by client goodwill.' },
      { name: 'Signaling edge', role: 'Edge functions broker WebRTC offers and ICE candidates. Once peers connect, media never touches our infrastructure again.' },
    ],
    challenges: [
      { title: 'Multi-device broke the threat model', body: 'A second device meant either sharing a key or losing history — both unacceptable. Per-device keys with sender-side fan-out (one envelope per device) kept the guarantees and cost only bandwidth.' },
      { title: 'Disappearing messages that did not disappear', body: 'Screenshots aside, early builds left plaintext sitting in IndexedDB after expiry. Bodies now live in memory with a per-session encrypted spill file that is dropped when the window closes.' },
      { title: 'Translation fought the entire premise', body: 'Shipping text to a translation API would have undone the product. A quantized on-device model covers the eight most common language pairs; anything else is an explicit, per-message opt-in.' },
    ],
    timeline: [
      { phase: 'Threat model', detail: 'Wrote down exactly what the server is allowed to learn before writing any code. That document settled most later arguments.' },
      { phase: 'Crypto core', detail: 'Prekeys, sealed sender, and forward secrecy — reviewed by an external auditor before a UI existed.' },
      { phase: 'Product', detail: 'Clients, ephemeral policies, translation, and peer-to-peer calls.' },
      { phase: 'Production', detail: '8M messages a day, with zero plaintext at rest on the server.' },
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
    architecture: [
      { name: 'Route table', role: 'Compiled from YAML into a radix tree at load. Lookups are allocation-free, which is most of the reason p99 overhead fits under 2ms.' },
      { name: 'Filter chain', role: 'Auth, rate limit, cache, transform, and telemetry as ordered middleware. Each filter is independently benchmarked and can be disabled per route.' },
      { name: 'Limiter', role: 'Token buckets in process with a Redis reconciliation loop, so a burst is absorbed locally and fairness across replicas is eventually correct.' },
      { name: 'Telemetry pipeline', role: 'Prometheus counters, OTLP spans, and structured access logs all emitted from one hook, so they cannot tell three different stories about the same request.' },
    ],
    challenges: [
      { title: 'Config reloads dropped connections', body: 'The first version rebound the listener on every reload. An atomic pointer swap of the route table replaced it: in-flight requests finish on the old config, new ones pick up the new one, nobody notices.' },
      { title: 'Redis was a single point of failure', body: 'A Redis blip took the gateway down with it. Limits now degrade to local-only buckets and the cache falls through to origin, so an outage costs accuracy instead of availability.' },
      { title: 'Cache invalidation was too coarse', body: 'Purging by URL left stale data behind and evicted plenty that was still good. Surrogate keys tagged at response time mean one entity change purges exactly the entries that referenced it.' },
    ],
    timeline: [
      { phase: 'Audit', detail: 'Catalogued every nginx config, sidecar, and bespoke middleware the platform was running. Found eleven different rate-limit implementations.' },
      { phase: 'Core', detail: 'Router, filter chain, and the benchmark harness that gated every change after it.' },
      { phase: 'Migration', detail: 'Moved services across one at a time behind a shadow-traffic comparison.' },
      { phase: 'Steady state', detail: '180k rps in production, with config changes shipped by service teams instead of the platform team.' },
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
    architecture: [
      { name: 'Sketch runtime', role: 'A sandboxed, origin-isolated iframe with a fixed message API. User code cannot reach the parent, which is what makes sharing safe by default.' },
      { name: 'Shader pipeline', role: 'Compiles on a debounced worker and surfaces GLSL errors inline, with line numbers mapped back to the editor rather than to generated source.' },
      { name: 'Content store', role: 'Sketches are immutable versions with a parent pointer, so forking is a cheap write and lineage is a query rather than a guess.' },
      { name: 'Offline layer', role: 'A service worker caches the editor shell and every sketch you have opened, with a write queue that reconciles when you come back online.' },
    ],
    challenges: [
      { title: 'Bad shaders locked the tab', body: 'An infinite loop in user GLSL froze the whole page, including the editor you would use to fix it. Compilation moved behind a worker with a watchdog, and the runtime now drops its context deliberately instead of hanging.' },
      { title: 'Sharing leaked the parent page', body: 'Early sketches ran in the main frame and could reach app state — fine for one author, not for a gallery. The runtime was rewritten as an origin-isolated iframe with an explicit message API.' },
      { title: 'Remixes lost their history', body: 'Forks were flat copies, so credit vanished after a single hop. Immutable versions with parent pointers made lineage free and gave the browse page something honest to show.' },
    ],
    timeline: [
      { phase: 'Weekend hack', detail: 'A single shader editor with a hot-reload loop, built to scratch an itch.' },
      { phase: 'Sandbox', detail: 'Reworked the runtime for isolation once other people started sharing sketches.' },
      { phase: 'Social', detail: 'Forking, lineage, and a browse page that surfaces remixes alongside originals.' },
      { phase: 'Ongoing', detail: '23k sketches, 3.4k creators, and a monthly community jam.' },
    ],
    metrics: [
      { label: 'Sketches shared', value: '23k+' },
      { label: 'Active creators', value: '3.4k' },
      { label: 'Forks per month', value: '1.1k' },
    ],
  },
];

export const getProject = (slug) => projects.find((p) => p.slug === slug);
