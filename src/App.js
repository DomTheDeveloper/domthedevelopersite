import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { HashRouter, Routes, Route, useParams } from 'react-router-dom';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import Arcade from './components/Arcade';
import TechZone from './components/TechZone';
import Contact from './components/Contact';
import Footer from './components/Footer';
import ParticleField from './components/ParticleField';
import ClickSpark from './components/ClickSpark';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';
import { isSection, scrollToSection } from './sections';
import './App.css';

const ProjectDetail = lazy(() => import('./components/ProjectDetail'));
const NotFound = lazy(() => import('./components/NotFound'));
const Videos = lazy(() => import('./components/Videos'));

const RouteLoader = () => (
  <div className="route-loader" role="status" aria-live="polite" aria-label="Loading">
    <div className="route-loader__pulse" />
    <span className="route-loader__label">Loading&hellip;</span>
  </div>
);

const Home = ({ section }) => {
  const [scrollY, setScrollY] = useState(0);
  const mounted = useRef(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Landing directly on "#/projects" jumps straight there; clicking through
  // from elsewhere in the app glides. Either way the URL stays shareable.
  useEffect(() => {
    const behavior = mounted.current ? 'smooth' : 'instant';
    mounted.current = true;
    requestAnimationFrame(() => scrollToSection(section, behavior));
  }, [section]);

  const focusMain = (e) => {
    e.preventDefault();
    const el = document.getElementById('main-content');
    if (!el) return;
    el.focus({ preventScroll: true });
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="App">
      <a href="#main-content" className="skip-link" onClick={focusMain}>Skip to content</a>
      <ParticleField />
      <ClickSpark />
      <Navbar />
      <main id="main-content" tabIndex={-1}>
        <Hero scrollY={scrollY} />
        <About />
        <Projects />
        <Arcade />
        <TechZone />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

// "/" and "/:section" resolve to the same component so moving between sections
// never tears down the page (and its canvases, games, and scroll position).
const HomeRoute = () => {
  const { section } = useParams();
  if (section !== undefined && !isSection(section)) return <NotFound />;
  return <Home section={section} />;
};

function App() {
  return (
    <HashRouter>
      <ErrorBoundary>
        <Suspense fallback={<RouteLoader />}>
          <Routes>
            <Route path="/" element={<HomeRoute />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/:section" element={<HomeRoute />} />
            <Route path="/project/:slug" element={<ProjectDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </HashRouter>
  );
}

export default App;
