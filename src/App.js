import React, { useEffect, useState } from 'react';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import Contact from './components/Contact';
import ParticleField from './components/ParticleField';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="App">
      <ParticleField />
      <Navbar />
      <Hero scrollY={scrollY} />
      <About />
      <Projects />
      <Contact />
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Dom the Developer. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
