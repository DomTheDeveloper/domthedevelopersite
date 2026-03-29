import React, { useEffect, useRef, useState } from 'react';

const projectsData = [
  {
    title: 'CloudSync Dashboard',
    description: 'Real-time cloud infrastructure monitoring dashboard with live metrics, alerting, and beautiful data visualizations.',
    tags: ['React', 'Node.js', 'WebSocket', 'D3.js'],
    color: '#64c8ff',
  },
  {
    title: 'DevFlow CLI',
    description: 'An intelligent CLI tool that automates development workflows — from scaffolding to deployment with a single command.',
    tags: ['Python', 'Click', 'Docker', 'CI/CD'],
    color: '#4facfe',
  },
  {
    title: 'NeuralNet Studio',
    description: 'Visual neural network builder that lets you design, train, and deploy ML models through an intuitive drag-and-drop interface.',
    tags: ['TypeScript', 'TensorFlow.js', 'React', 'WebGL'],
    color: '#00f2fe',
  },
  {
    title: 'QuantumChat',
    description: 'End-to-end encrypted messaging platform with ephemeral messages, real-time translation, and zero-knowledge architecture.',
    tags: ['Next.js', 'PostgreSQL', 'Redis', 'WebRTC'],
    color: '#48d1cc',
  },
  {
    title: 'HyperAPI Gateway',
    description: 'High-performance API gateway with automatic rate limiting, caching, request transformation, and comprehensive analytics.',
    tags: ['Go', 'Redis', 'gRPC', 'Prometheus'],
    color: '#76e2f8',
  },
  {
    title: 'PixelForge',
    description: 'Browser-based creative coding environment for generative art, shaders, and interactive visual experiments.',
    tags: ['WebGL', 'GLSL', 'Canvas', 'React'],
    color: '#5bc0eb',
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
          <span className="section__title-tag">03.</span> Projects
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
                  <svg viewBox="0 0 24 24" fill="none" stroke={project.color} strokeWidth="1.5">
                    <path d="M3 7l6-4 6 4 6-4v14l-6 4-6-4-6 4V7z" />
                    <path d="M9 3v14" />
                    <path d="M15 7v14" />
                  </svg>
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
