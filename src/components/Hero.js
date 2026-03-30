import React, { useState, useEffect } from 'react';

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
      <div className="hero__content" style={{ transform: `translateY(${scrollY * 0.3}px)`, opacity: 1 - scrollY / 600 }}>
        <div className="hero__glitch-wrapper">
          <h1 className="hero__title">
            {text}
            <span className={`hero__cursor ${showCursor ? '' : 'hero__cursor--hidden'}`}>|</span>
          </h1>
        </div>
        <p className="hero__subtitle">
          <span className="hero__tag">&lt;code&gt;</span>
          Full-Stack Developer & Digital Craftsman
          <span className="hero__tag">&lt;/code&gt;</span>
        </p>
        <div className="hero__cta-row">
          <a href="#about" className="hero__cta">About Me</a>
          <a href="#contact" className="hero__cta hero__cta--outline">Get In Touch</a>
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
