import React, { useEffect, useRef, useState } from 'react';

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
              Hey there! I'm <strong>Dom</strong> — a passionate full-stack developer who loves
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
            <div className="terminal">
              <div className="terminal__header">
                <span className="terminal__dot terminal__dot--red" />
                <span className="terminal__dot terminal__dot--yellow" />
                <span className="terminal__dot terminal__dot--green" />
                <span className="terminal__title">dom@dev:~$</span>
              </div>
              <div className="terminal__body">
                <p><span className="terminal__prompt">$</span> whoami</p>
                <p className="terminal__output">Dom the Developer</p>
                <p><span className="terminal__prompt">$</span> cat passion.txt</p>
                <p className="terminal__output">Building things that matter.</p>
                <p><span className="terminal__prompt">$</span> echo $STACK</p>
                <p className="terminal__output">React | Node | Python | Cloud</p>
                <p><span className="terminal__prompt">$</span> <span className="terminal__cursor">_</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
