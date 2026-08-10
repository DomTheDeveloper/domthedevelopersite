import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Hero = ({ scrollY }) => {
  const [text, setText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const fullText = 'Dom the Developer';

  useEffect(() => {
    let i = 0;
    const typing = setInterval(() => {
      setText(fullText.slice(0, i + 1));
      i++;
      if (i >= fullText.length) clearInterval(typing);
    }, 80);
    return () => clearInterval(typing);
  }, []);

  useEffect(() => {
    const blink = setInterval(() => setShowCursor(c => !c), 530);
    return () => clearInterval(blink);
  }, []);

  return (
    <section id="hero" className="hero">
      <div
        className="hero__content"
        style={{
          transform: `translateY(${scrollY * 0.3}px)`,
          opacity: Math.max(0, 1 - scrollY / 600),
          pointerEvents: scrollY > 600 ? 'none' : undefined,
        }}
      >
        <div className="hero__glitch-wrapper">
          <h1 className="hero__title">
            {text}
            <span className={`hero__cursor ${showCursor ? '' : 'hero__cursor--hidden'}`}>|</span>
          </h1>
        </div>
        <p className="hero__subtitle">
          <span className="hero__tag">&lt;code&gt;</span><br />
          Software Engineer <br className="hero__mobile-br" />&amp; Computer Scientist
          <br /><span className="hero__tag">&lt;/code&gt;</span>
        </p>
        <p className="hero__slogan">Building the future, one line at a time.</p>
        <div className="hero__cta-row">
          <Link to="/contact" className="hero__cta">Let's Chat</Link>
          <Link to="/projects" className="hero__cta hero__cta--outline">Portfolio</Link>
        </div>
        <div className="hero__scroll-indicator">
          <div className="hero__scroll-mouse">
            <div className="hero__scroll-wheel" />
          </div>
          <span>Scroll Down</span>
        </div>
      </div>
    </section>
  );
};

export default Hero;
