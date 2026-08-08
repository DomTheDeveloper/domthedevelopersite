import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SECTIONS, SECTION_IDS, scrollToSection } from '../sections';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const location = useLocation();
  // Section highlighting only means anything on the one-page route.
  const onHome = !location.pathname.startsWith('/project') && location.pathname !== '/videos';

  // Close the mobile menu whenever the route changes.
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKeyDown = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  // Highlight whichever section is currently under the reader's eye.
  useEffect(() => {
    const els = SECTION_IDS
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    const onScroll = () => {
      setScrolled(window.scrollY > 50);
      if (!els.length) { setActiveId(null); return; }
      const marker = window.scrollY + window.innerHeight * 0.35;
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      let current = null;
      els.forEach((el) => {
        const top = el.getBoundingClientRect().top + window.scrollY;
        if (top <= marker) current = el.id;
      });
      setActiveId(atBottom ? els[els.length - 1].id : current);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [location.pathname]);

  // Re-clicking the section you are already on should still take you there.
  const handleLinkClick = useCallback((to, id) => {
    setMenuOpen(false);
    if (location.pathname === to) scrollToSection(id);
  }, [location.pathname]);

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`} aria-label="Primary">
      <div className="navbar__inner">
        <Link
          to="/"
          className="navbar__logo"
          aria-label="Dom the Developer — home"
          onClick={() => handleLinkClick('/', 'hero')}
        >
          <span className="navbar__logo-bracket">&lt;</span>
          Dom
          <span className="navbar__logo-bracket">/&gt;</span>
        </Link>
        <button
          type="button"
          className={`navbar__burger ${menuOpen ? 'navbar__burger--open' : ''}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="navbar-links"
        >
          <span /><span /><span />
        </button>
        <ul id="navbar-links" className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`}>
          {SECTIONS.map(({ id, label }) => (
            <li key={id}>
              <Link
                to={`/${id}`}
                className={onHome && activeId === id ? 'navbar__link--active' : undefined}
                aria-current={onHome && activeId === id ? 'true' : undefined}
                onClick={() => handleLinkClick(`/${id}`, id)}
              >
                {label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              to="/videos"
              className={`navbar__link--page ${location.pathname === '/videos' ? 'navbar__link--active' : ''}`}
              aria-current={location.pathname === '/videos' ? 'page' : undefined}
              onClick={() => setMenuOpen(false)}
            >
              Reels
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
