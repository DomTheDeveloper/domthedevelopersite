import React, { useEffect, useRef, useState } from 'react';
import SpaceRunner from './games/SpaceRunner';
import Pong from './games/Pong';

const games = [
  { id: 'space', name: 'Space Runner', component: SpaceRunner, desc: 'Dodge asteroids in deep space' },
  { id: 'pong', name: 'Neon Pong', component: Pong, desc: 'Classic pong with a glow-up' },
];

const Arcade = () => {
  const ref = useRef();
  const [visible, setVisible] = useState(false);
  const [activeGame, setActiveGame] = useState('space');

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const ActiveComponent = games.find(g => g.id === activeGame)?.component;

  return (
    <section id="arcade" className={`section arcade ${visible ? 'section--visible' : ''}`} ref={ref}>
      <div className="section__inner">
        <h2 className="section__title">
          <span className="section__title-tag">04.</span> Arcade
        </h2>
        <p className="arcade__subtitle">Take a break. Play a game.</p>
        <div className="arcade__tabs">
          {games.map(g => (
            <button
              key={g.id}
              className={`arcade__tab ${activeGame === g.id ? 'arcade__tab--active' : ''}`}
              onClick={() => setActiveGame(g.id)}
            >
              {g.name}
            </button>
          ))}
        </div>
        <div className="arcade__game-wrapper">
          <ActiveComponent key={activeGame} />
        </div>
        <p className="arcade__hint">
          {games.find(g => g.id === activeGame)?.desc}
        </p>
      </div>
    </section>
  );
};

export default Arcade;
