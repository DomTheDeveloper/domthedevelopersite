import React, { useEffect, useRef, useState } from 'react';
import InteractiveTerminal from './InteractiveTerminal';

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
              Hi there! I'm <strong>Dom</strong> — a passionate full-stack developer who loves
              turning complex problems into elegant, performant solutions. I thrive at the
              intersection of design and engineering, building experiences that are both
              beautiful and blazing fast.
            </p>
            <p>
              From crafting pixel-perfect UIs to architecting scalable backends, I bring
              ideas to life with clean code and modern technologies. When I'm not coding,
              you'll find me exploring new frameworks, contributing to open source, or
              diving deep into system design.
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
