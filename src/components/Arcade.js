import React, { useEffect, useRef, useState, lazy, Suspense } from 'react';
import ErrorBoundary from './ErrorBoundary';

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

const isMobile = () => /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth < 768;

const games = [
  { id: 'space', name: 'Space Runner', icon: '>', mDesc: 'Tap to jump over asteroids.', dDesc: 'Press Space or click to jump over asteroids.', component: SpaceRunner },
  { id: 'pong', name: 'Neon Pong', icon: '|', mDesc: 'Drag to move your paddle.', dDesc: 'Move your mouse to control the paddle.', component: Pong },
  { id: 'snake', name: 'Snake', icon: '~', mDesc: 'Swipe to change direction.', dDesc: 'Arrow keys or WASD to move.', component: Snake },
  { id: 'breakout', name: 'Breakout', icon: '#', mDesc: 'Drag to move the paddle.', dDesc: 'Move your mouse to control the paddle.', component: Breakout },
  { id: 'shooter', name: 'Asteroids', icon: '^', mDesc: 'Drag to aim. Tap to shoot.', dDesc: 'Move mouse to aim. Click to fire.', component: AsteroidShooter },
  { id: 'memory', name: 'Memory', icon: '?', mDesc: 'Tap cards to flip and match pairs.', dDesc: 'Click cards to flip and match pairs.', component: MemoryMatch },
  { id: 'flappy', name: 'Flappy Rocket', icon: '/', mDesc: 'Tap to fly through gaps.', dDesc: 'Click or press Space to fly.', component: FlappyRocket },
  { id: '2048', name: '2048', icon: '+', mDesc: 'Swipe to slide and merge tiles.', dDesc: 'Arrow keys or WASD to slide tiles.', component: Game2048 },
  { id: 'mines', name: 'Minesweeper', icon: '*', mDesc: 'Tap to reveal. Long-press to flag.', dDesc: 'Click to reveal. Right-click to flag.', component: Minesweeper },
  { id: 'reaction', name: 'Reaction', icon: '!', mDesc: 'Tap when the screen turns green.', dDesc: 'Click when the screen turns green.', component: ReactionTime },
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
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    setMobile(isMobile());
    const handleResize = () => setMobile(isMobile());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
                type="button"
                className={`techzone__tab ${activeId === g.id ? 'techzone__tab--active' : ''}`}
                aria-pressed={activeId === g.id}
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
            <ErrorBoundary key={activeId} inline label={`${active?.name || 'This game'} stopped working.`}>
              <Suspense fallback={<Loader />}>
                {ActiveComponent && <ActiveComponent />}
              </Suspense>
            </ErrorBoundary>
          </div>
          <p className="techzone__desc">{mobile ? active?.mDesc : active?.dDesc}</p>
        </div>
      </div>
    </section>
  );
};

export default Arcade;
