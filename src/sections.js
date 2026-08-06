// Single source of truth for the one-page sections.
//
// The app runs behind a HashRouter, so a bare `#about` anchor is parsed by the
// router as the route "/about" — which is why in-page anchors used to land on
// the 404 screen. Every section therefore gets a real route ("#/about") and all
// navigation goes through <Link>, which keeps the links shareable and lets
// browsers open them in a new tab correctly.

export const SECTIONS = [
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'arcade', label: 'Arcade' },
  { id: 'techzone', label: 'Tech Zone' },
  { id: 'contact', label: 'Contact' },
];

export const SECTION_IDS = SECTIONS.map((s) => s.id);

// "hero" is the top of the page: routable, but not shown in the nav.
export const ROUTABLE_SECTIONS = ['hero', ...SECTION_IDS];

export const isSection = (value) => ROUTABLE_SECTIONS.includes(value);

// `html { scroll-behavior: smooth }` turns a plain 'auto' scroll into an
// animation, so the no-animation case has to ask for 'instant' explicitly.
export const scrollToSection = (id, behavior = 'smooth') => {
  if (typeof document === 'undefined') return;
  if (!id || id === 'hero') {
    window.scrollTo({ top: 0, left: 0, behavior });
    return;
  }
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior, block: 'start' });
};
