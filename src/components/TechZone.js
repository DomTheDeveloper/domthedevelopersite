import React, { useEffect, useRef, useState, lazy, Suspense } from 'react';

const Constellations = lazy(() => import('./techzone/Constellations'));
const InteractiveTerminal = lazy(() => import('./techzone/InteractiveTerminal'));
const DarkOS = lazy(() => import('./techzone/DarkOS'));
const CitySimulator = lazy(() => import('./techzone/CitySimulator'));
const MatrixRain = lazy(() => import('./techzone/MatrixRain'));
const PixelArt = lazy(() => import('./techzone/PixelArt'));
const SynthPad = lazy(() => import('./techzone/SynthPad'));
const GravitySim = lazy(() => import('./techzone/GravitySim'));
const TypingRace = lazy(() => import('./techzone/TypingRace'));
const ParticlePlayground = lazy(() => import('./techzone/ParticlePlayground'));

const items = [
  { id: 'constellations', name: 'Constellations', icon: '✦', desc: 'Click to place stars. Nearby stars auto-connect. Watch for shooting stars.', component: Constellations },
  { id: 'terminal', name: 'Space Terminal', icon: '>', desc: 'A fully interactive terminal. Type "help" for commands.', component: InteractiveTerminal },
  { id: 'darkos', name: 'DarkOS', icon: '⊞', desc: 'A mini desktop OS. Open apps, drag windows, explore.', component: DarkOS },
  { id: 'city', name: 'City Builder', icon: '▓', desc: 'Build a neon cityscape. Place residential, commercial, or parks.', component: CitySimulator },
  { id: 'gravity', name: 'Gravity Lab', icon: '◉', desc: 'Click to spawn bodies orbiting a central star. Watch gravity do its thing.', component: GravitySim },
  { id: 'matrix', name: 'Matrix Rain', icon: '⋮', desc: 'Digital rain with mouse interaction. Move your cursor through the code.', component: MatrixRain },
  { id: 'pixel', name: 'Pixel Canvas', icon: '▦', desc: 'Draw pixel art on a 16x16 grid. Pick colors and paint.', component: PixelArt },
  { id: 'synth', name: 'Synth Pad', icon: '♪', desc: 'Play musical notes. Click or drag across pads for melodies.', component: SynthPad },
  { id: 'typing', name: 'Typing Race', icon: '⌨', desc: 'Test your typing speed with code snippets.', component: TypingRace },
  { id: 'particles', name: 'Particle Lab', icon: '✸', desc: 'Attract, repel, vortex, or explode 300 particles. Hold click to interact.', component: ParticlePlayground },
];

const Loader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
    Loading...
  </div>
);

const TechZone = () => {
  const ref = useRef();
  const [visible, setVisible] = useState(false);
  const [activeId, setActiveId] = useState('constellations');

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.05 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const active = items.find(i => i.id === activeId);
  const ActiveComponent = active?.component;

  return (
    <section id="techzone" className={`section techzone ${visible ? 'section--visible' : ''}`} ref={ref}>
      <div className="section__inner">
        <h2 className="section__title">
          <span className="section__title-tag">04.</span> Tech Zone
        </h2>
        <p className="techzone__subtitle">Interactive experiments and creative tools. Pick one and play.</p>

        <div className="techzone__tabs-scroll">
          <div className="techzone__tabs">
            {items.map(item => (
              <button
                key={item.id}
                className={`techzone__tab ${activeId === item.id ? 'techzone__tab--active' : ''}`}
                onClick={() => setActiveId(item.id)}
              >
                <span className="techzone__tab-icon">{item.icon}</span>
                <span className="techzone__tab-name">{item.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="techzone__content">
          <div className="techzone__content-inner">
            <Suspense fallback={<Loader />}>
              {ActiveComponent && <ActiveComponent key={activeId} />}
            </Suspense>
          </div>
          <p className="techzone__desc">{active?.desc}</p>
        </div>
      </div>
    </section>
  );
};

export default TechZone;
