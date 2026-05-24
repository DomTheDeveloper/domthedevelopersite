import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import Arcade from './components/Arcade';
import TechZone from './components/TechZone';
import Contact from './components/Contact';
import ParticleField from './components/ParticleField';
import ClickSpark from './components/ClickSpark';
import Navbar from './components/Navbar';
import ProjectDetail from './components/ProjectDetail';
import './App.css';

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
      <ParticleField />
      <ClickSpark />
      <Navbar />
      <Hero scrollY={scrollY} />
      <About />
      <Projects />
      <Arcade />
      <TechZone />
      <Contact />
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Dom the Developer. All rights reserved.</p>
      </footer>
    </div>
  );
};

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/project/:slug" element={<ProjectDetail />} />
        <Route path="*" element={<Navigate to="/" replace state={{ scrollTo: 'projects' }} />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
