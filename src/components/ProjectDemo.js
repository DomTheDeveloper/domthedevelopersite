import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import useReducedMotion from '../hooks/useReducedMotion';
import { MotionContext } from './demos/motion';

// One chunk per demo — a visitor reading one case study never downloads the
// other five.
const demos = {
  'cloudsync-dashboard': lazy(() => import('./demos/CloudSyncDemo')),
  'devflow-cli': lazy(() => import('./demos/DevFlowDemo')),
  'neuralnet-studio': lazy(() => import('./demos/NeuralNetDemo')),
  quantumchat: lazy(() => import('./demos/QuantumChatDemo')),
  'hyperapi-gateway': lazy(() => import('./demos/HyperApiDemo')),
  pixelforge: lazy(() => import('./demos/PixelForgeDemo')),
};

const DemoLoader = () => (
  <div className="demo demo--loading" role="status" aria-live="polite">
    <span className="demo__loading-label">booting demo…</span>
  </div>
);

const ProjectDemo = ({ slug }) => {
  const Demo = demos[slug];
  const wrapperRef = useRef(null);
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = wrapperRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => setVisible(e.isIntersecting)),
      { threshold: 0.15 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  if (!Demo) return null;
  const active = !reduced && visible;

  return (
    <div ref={wrapperRef} className="project-detail__demo-wrapper">
      <MotionContext.Provider value={active}>
        <Suspense fallback={<DemoLoader />}>
          <Demo />
        </Suspense>
      </MotionContext.Provider>
    </div>
  );
};

export default ProjectDemo;
