import React, { useEffect, useRef, useState } from 'react';
import InteractiveTerminal from './techzone/InteractiveTerminal';

const About = () => {
  const ref = useRef();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="about" className={`section about ${visible ? 'section--visible' : ''}`} ref={ref}>
      <div className="section__inner">
        <h2 className="section__title">
          <span className="section__title-tag">01.</span> About Me
        </h2>
        <div className="about__grid">
          <div className="about__text">
            <p>
              I'm <strong>Dom</strong>, a full-stack developer who loves
              turning complex problems into clean, fast solutions. I like working
              across the whole stack, from UI to infrastructure, and I care a lot
              about the details.
            </p>
            <p>
              I spend most of my time building with React, Node, and Python.
              Outside of work I'm usually picking up new tools, reading about
              system design, or contributing to open source projects.
            </p>
          </div>
          <div className="about__terminal">
            <InteractiveTerminal />
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
