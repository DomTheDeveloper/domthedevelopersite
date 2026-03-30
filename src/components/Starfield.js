import React, { useEffect, useRef, useState } from 'react';
import Constellations from './Constellations';

const Starfield = () => {
  const ref = useRef();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="starfield" className={`section starfield ${visible ? 'section--visible' : ''}`} ref={ref}>
      <div className="section__inner">
        <h2 className="section__title">
          <span className="section__title-tag">05.</span> Create Constellations
        </h2>
        <p className="starfield__subtitle">
          Click anywhere on the canvas to place stars. Nearby stars automatically connect to form constellations. Shooting stars appear randomly.
        </p>
        <Constellations />
      </div>
    </section>
  );
};

export default Starfield;
