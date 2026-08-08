import React, { useCallback, useEffect, useRef, useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import ParticleField from './ParticleField';
import ErrorBoundary from './ErrorBoundary';
import ReelCanvas from './ReelCanvas';
import useReducedMotion from '../hooks/useReducedMotion';
import { REELS } from '../reels/reels';
import { REEL_SECONDS } from '../reels/engine';

const Videos = () => {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [seek, setSeek] = useState(0);
  const feedRef = useRef(null);
  const slideRefs = useRef([]);
  const barRefs = useRef([]);

  useEffect(() => {
    const prev = document.title;
    document.title = 'Reels · Dom the Developer';
    return () => { document.title = prev; };
  }, []);

  // Whichever slide is most in view is the one that plays.
  useEffect(() => {
    const nodes = slideRefs.current.filter(Boolean);
    if (!nodes.length || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && e.intersectionRatio > 0.6) {
            const i = nodes.indexOf(e.target);
            if (i >= 0) setIndex(i);
          }
        });
      },
      { threshold: [0.6] }
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  const goTo = useCallback((i) => {
    const next = Math.max(0, Math.min(REELS.length - 1, i));
    const node = slideRefs.current[next];
    if (node) node.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setIndex(next);
    setPlaying(true);
  }, []);

  const handleEnded = useCallback(() => {
    if (index < REELS.length - 1) goTo(index + 1);
    else setPlaying(false);
  }, [index, goTo]);

  const replay = () => { setSeek((s) => s + 1); setPlaying(true); };

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === ' ') { e.preventDefault(); setPlaying((p) => !p); }
      else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); goTo(index + 1); }
      else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); goTo(index - 1); }
      else if (e.key.toLowerCase() === 'r') replay();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, goTo]);

  // Progress is written straight to the DOM — 60 setState calls a second would
  // re-render three canvases for nothing.
  const makeOnFrame = useCallback((i) => (p) => {
    const bar = barRefs.current[i];
    if (bar) bar.style.transform = `scaleX(${p})`;
  }, []);

  return (
    <div className="App videos-page">
      <ParticleField />
      <Navbar />

      <main className="videos" id="main-content" tabIndex={-1}>
        <header className="videos__head">
          <h1 className="videos__title">
            <span className="section__title-tag">&#9654;</span> Reels
          </h1>
          <p className="videos__lede">
            Three 30-second cuts, shot at 1080&times;1920. Every frame is drawn by code in your
            browser &mdash; there is no video file behind this.
          </p>
          <p className="videos__hint">
            {reduced
              ? 'Reduced motion is on, so these are showing as stills.'
              : 'Click a reel to pause · ↑↓ to move between them · R to replay'}
          </p>
        </header>

        <div className="videos__feed" ref={feedRef}>
          {REELS.map((reel, i) => (
            <section
              key={reel.id}
              className={`reel ${index === i ? 'reel--active' : ''}`}
              ref={(el) => { slideRefs.current[i] = el; }}
              aria-label={reel.title}
            >
              <div className="reel__frame" style={{ '--reel-accent': reel.accent }}>
                <div className="reel__bars">
                  {REELS.map((_, j) => (
                    <div key={j} className="reel__bar">
                      <div
                        className="reel__bar-fill"
                        ref={j === i ? (el) => { barRefs.current[i] = el; } : undefined}
                        style={j < i ? { transform: 'scaleX(1)' } : j > i ? { transform: 'scaleX(0)' } : undefined}
                      />
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="reel__surface"
                  onClick={() => (index === i ? setPlaying((p) => !p) : goTo(i))}
                  aria-label={index === i && playing ? `Pause ${reel.title}` : `Play ${reel.title}`}
                >
                  <ErrorBoundary inline label="This reel stopped working.">
                    <ReelCanvas
                      reel={reel}
                      active={index === i}
                      playing={playing}
                      reduced={reduced}
                      seekSignal={seek}
                      onFrame={makeOnFrame(i)}
                      onEnded={handleEnded}
                    />
                  </ErrorBoundary>

                  {index === i && !playing && !reduced && (
                    <span className="reel__pause-badge" aria-hidden="true">▶</span>
                  )}
                </button>

                <div className="reel__meta">
                  <span className="reel__index">{String(i + 1).padStart(2, '0')} / {String(REELS.length).padStart(2, '0')}</span>
                  <span className="reel__name">{reel.title}</span>
                  <span className="reel__blurb">{reel.blurb}</span>
                </div>
              </div>

              <div className="reel__side">
                <span className="reel__spec">1080 × 1920</span>
                <span className="reel__spec">9:16</span>
                <span className="reel__spec">{REEL_SECONDS}s</span>
                <button type="button" className="reel__side-btn" onClick={replay}>replay</button>
                {i < REELS.length - 1 && (
                  <button type="button" className="reel__side-btn" onClick={() => goTo(i + 1)}>next ↓</button>
                )}
              </div>
            </section>
          ))}
        </div>

        <p className="videos__foot">
          Built with the same canvas techniques as the Tech Zone experiments &mdash; a timeline of
          scenes, drawn at reel resolution and scaled to fit.
        </p>
      </main>

      <Footer />
    </div>
  );
};

export default Videos;
