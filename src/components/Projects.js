import React, { useEffect, useRef, useState } from 'react';

const icons = [
  // dashboard/monitor
  <svg key="0" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 8h2"/><path d="M7 12h4"/></svg>,
  // terminal/cli
  <svg key="1" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 10l4 2-4 2"/><path d="M14 14h4"/></svg>,
  // neural/brain
  <svg key="2" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><circle cx="5" cy="6" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="5" cy="18" r="2"/><circle cx="19" cy="18" r="2"/><path d="M9.5 10L6.5 7.5"/><path d="M14.5 10l3-2.5"/><path d="M9.5 14l-3 2.5"/><path d="M14.5 14l3 2.5"/></svg>,
  // chat/message
  <svg key="3" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/><path d="M8 9h8"/><path d="M8 13h4"/></svg>,
  // api/server
  <svg key="4" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><circle cx="6" cy="6" r="1"/><circle cx="6" cy="18" r="1"/><path d="M12 6h4"/><path d="M12 18h4"/></svg>,
  // creative/brush
  <svg key="5" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
];

const projectsData = [
  {
    title: 'CloudSync Dashboard',
    description: 'Real-time cloud infrastructure monitoring dashboard with live metrics, alerting, and beautiful data visualizations.',
    tags: ['React', 'Node.js', 'WebSocket', 'D3.js'],
    color: '#64c8ff',
    iconIdx: 0,
  },
  {
    title: 'DevFlow CLI',
    description: 'An intelligent CLI tool that automates development workflows, from scaffolding to deployment with a single command.',
    tags: ['Python', 'Click', 'Docker', 'CI/CD'],
    color: '#4facfe',
    iconIdx: 1,
  },
  {
    title: 'NeuralNet Studio',
    description: 'Visual neural network builder that lets you design, train, and deploy ML models through an intuitive drag-and-drop interface.',
    tags: ['TypeScript', 'TensorFlow.js', 'React', 'WebGL'],
    color: '#00f2fe',
    iconIdx: 2,
  },
  {
    title: 'QuantumChat',
    description: 'End-to-end encrypted messaging platform with ephemeral messages, real-time translation, and zero-knowledge architecture.',
    tags: ['Next.js', 'PostgreSQL', 'Redis', 'WebRTC'],
    color: '#48d1cc',
    iconIdx: 3,
  },
  {
    title: 'HyperAPI Gateway',
    description: 'High-performance API gateway with automatic rate limiting, caching, request transformation, and comprehensive analytics.',
    tags: ['Go', 'Redis', 'gRPC', 'Prometheus'],
    color: '#76e2f8',
    iconIdx: 4,
  },
  {
    title: 'PixelForge',
    description: 'Browser-based creative coding environment for generative art, shaders, and interactive visual experiments.',
    tags: ['WebGL', 'GLSL', 'Canvas', 'React'],
    color: '#5bc0eb',
    iconIdx: 5,
  },
];

const Projects = () => {
  const ref = useRef();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="projects" className={`section projects ${visible ? 'section--visible' : ''}`} ref={ref}>
      <div className="section__inner">
        <h2 className="section__title">
          <span className="section__title-tag">02.</span> Selected Projects
        </h2>
        <div className="projects__grid">
          {projectsData.map((project, i) => (
            <div
              key={project.title}
              className="project-card"
              style={{ animationDelay: `${i * 0.1}s`, '--accent': project.color }}
            >
              <div className="project-card__glow" />
              <div className="project-card__content">
                <div className="project-card__icon">
                  {React.cloneElement(icons[project.iconIdx], { stroke: project.color })}
                </div>
                <h3 className="project-card__title">{project.title}</h3>
                <p className="project-card__desc">{project.description}</p>
                <div className="project-card__tags">
                  {project.tags.map(tag => (
                    <span key={tag} className="project-card__tag">{tag}</span>
                  ))}
                </div>
                <div className="project-card__links">
                  <span className="project-card__link">View Project &rarr;</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
