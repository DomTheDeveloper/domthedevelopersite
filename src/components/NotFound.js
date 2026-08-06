import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ParticleField from './ParticleField';
import ClickSpark from './ClickSpark';

const NotFound = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
    const prev = document.title;
    document.title = '404 · Not Found | Dom the Developer';
    return () => { document.title = prev; };
  }, []);

  return (
    <div className="App">
      <ParticleField />
      <ClickSpark />
      <Navbar />
      <main className="project-detail project-detail--missing">
        <div className="project-detail__inner">
          <p className="project-detail__eyebrow">404</p>
          <h1 className="project-detail__title">Page not found</h1>
          <p className="project-detail__lede">
            That URL doesn&apos;t lead anywhere I&apos;ve built &mdash; yet.
          </p>
          <div className="project-detail__cta-row">
            <Link to="/projects" className="project-detail__cta project-detail__cta--primary">
              &larr; See projects
            </Link>
            <Link to="/" className="project-detail__cta project-detail__cta--ghost">
              Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
