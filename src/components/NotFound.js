import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import ParticleField from './ParticleField';
import ClickSpark from './ClickSpark';

const NotFound = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const prev = document.title;
    document.title = '404 · Not Found | Dom the Developer';
    return () => { document.title = prev; };
  }, []);

  return (
    <div className="App">
      <ParticleField />
      <ClickSpark />
      <Navbar />
      <main className="project-detail project-detail--missing" role="main">
        <div className="project-detail__inner">
          <p className="project-detail__eyebrow">404</p>
          <h1 className="project-detail__title">Page not found</h1>
          <p className="project-detail__lede">
            That URL doesn&apos;t lead anywhere I&apos;ve built &mdash; yet.
          </p>
          <div className="project-detail__cta-row">
            <button
              type="button"
              className="project-detail__cta project-detail__cta--primary"
              onClick={() => navigate('/', { state: { scrollTo: 'projects' } })}
            >
              &larr; See projects
            </button>
            <button
              type="button"
              className="project-detail__cta project-detail__cta--ghost"
              onClick={() => navigate('/')}
            >
              Home
            </button>
          </div>
        </div>
      </main>
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Dom the Developer. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default NotFound;
