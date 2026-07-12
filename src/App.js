import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import Arcade from './components/Arcade';
import TechZone from './components/TechZone';
import Contact from './components/Contact';
import ParticleField from './components/ParticleField';
import ClickSpark from './components/ClickSpark';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

const ProjectDetail = lazy(() => import('./components/ProjectDetail'));
const NotFound = lazy(() => import('./components/NotFound'));

const RouteLoader = () => (
  <div className="route-loader" role="status" aria-live="polite" aria-label="Loading">
    <div className="route-loader__pulse" />
    <span className="route-loader__label">Loading&hellip;</span>
  </div>
);

const ScrollManager = () => {
  const location = useLocation();
  const prevKey = useRef(location.key);
  useEffect(() => {
    if (location.key !== prevKey.current) {
      prevKey.current = location.key;
      const target = location.state && location.state.scrollTo;
      if (!target) {
        window.scrollTo({ top: 0, left: 0 });
      }
    }
  }, [location]);
  return null;
};

const Home = () => {
  const [scrollY, setScrollY] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const target = location.state && location.state.scrollTo;
    if (target) {
      requestAnimationFrame(() => {
        const el = document.getElementById(target);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, [location]);

  return (
    <div className="App">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <ParticleField />
      <ClickSpark />
      <Navbar />
      <main id="main-content">
        <Hero scrollY={scrollY} />
        <About />
        <Projects />
        <Arcade />
        <TechZone />
        <Contact />
      </main>
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Dom the Developer. All rights reserved.</p>
      </footer>
    </div>
  );
};

function App() {
  return (
    <HashRouter>
      <ErrorBoundary>
        <ScrollManager />
        <Suspense fallback={<RouteLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/project/:slug" element={<ProjectDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </HashRouter>
  );
}

export default App;
