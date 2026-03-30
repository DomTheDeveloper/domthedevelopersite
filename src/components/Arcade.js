import React, { useEffect, useRef, useState, lazy, Suspense } from 'react';

const SpaceRunner = lazy(() => import('./games/SpaceRunner'));
const Pong = lazy(() => import('./games/Pong'));
const Snake = lazy(() => import('./games/Snake'));
const Breakout = lazy(() => import('./games/Breakout'));
const AsteroidShooter = lazy(() => import('./games/AsteroidShooter'));
const MemoryMatch = lazy(() => import('./games/MemoryMatch'));
const FlappyRocket = lazy(() => import('./games/FlappyRocket'));
const Game2048 = lazy(() => import('./games/Game2048'));
const Minesweeper = lazy(() => import('./games/Minesweeper'));
const ReactionTime = lazy(() => import('./games/ReactionTime'));

const games = [
  { id: 'space', name: 'Space Runner', icon: '🚀', desc: 'Dodge asteroids in deep space. Click or Space to jump.', component: SpaceRunner },
  { id: 'pong', name: 'Neon Pong', icon: '🏓', desc: 'Classic pong with neon glow. Move your mouse to play.', component: Pong },
  { id: 'snake', name: 'Snake', icon: '🐍', desc: 'Eat, grow, survive. Arrow keys or WASD.', component: Snake },
  { id: 'breakout', name: 'Breakout', icon: '🧱', desc: 'Break all the bricks. Move mouse to control the paddle.', component: Breakout },
  { id: 'shooter', name: 'Asteroid Shooter', icon: '🔫', desc: 'Shoot down asteroids before they hit you. Click to fire.', component: AsteroidShooter },
  { id: 'memory', name: 'Memory Match', icon: '🧠', desc: 'Match all pairs with the fewest moves.', component: MemoryMatch },
  { id: 'flappy', name: 'Flappy Rocket', icon: '🪂', desc: 'Navigate through gaps. Click or Space to fly.', component: FlappyRocket },
  { id: '2048', name: '2048', icon: '🔢', desc: 'Slide and merge tiles to reach 2048. Arrow keys or WASD.', component: Game2048 },
  { id: 'mines', name: 'Minesweeper', icon: '💣', desc: 'Clear the board without hitting mines. Right-click to flag.', component: Minesweeper },
  { id: 'reaction', name: 'Reaction Test', icon: '⚡', desc: 'Test your reaction time. Click when the screen turns green.', component: ReactionTime },
];

const Loader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
    Loading...
  </div>
);

const Arcade = () => {
  const ref = useRef();
  const [visible, setVisible] = useState(false);
  const [activeId, setActiveId] = useState('space');

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.05 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const active = games.find(g => g.id === activeId);
  const ActiveComponent = active?.component;

  return (
    <section id="arcade" className={`section arcade ${visible ? 'section--visible' : ''}`} ref={ref}>
      <div className="section__inner">
        <h2 className="section__title">
          <span className="section__title-tag">03.</span> Arcade
        </h2>
        <p className="techzone__subtitle">Take a break. Play a game.</p>

        <div className="techzone__tabs-scroll">
          <div className="techzone__tabs">
            {games.map(g => (
              <button
                key={g.id}
                className={`techzone__tab ${activeId === g.id ? 'techzone__tab--active' : ''}`}
                onClick={() => setActiveId(g.id)}
              >
                <span className="techzone__tab-icon">{g.icon}</span>
                <span className="techzone__tab-name">{g.name}</span>
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

export default Arcade;
