import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { projects, projectIcons } from '../projects/projectsData';

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
          {projects.map((project, i) => (
            <Link
              key={project.slug}
              to={`/project/${project.slug}`}
              className="project-card project-card--link"
              style={{ animationDelay: `${i * 0.1}s`, '--accent': project.color }}
              aria-label={`View ${project.title} case study`}
            >
              <div className="project-card__glow" />
              <div className="project-card__content">
                <div className="project-card__icon">
                  {React.cloneElement(projectIcons[project.icon], { stroke: project.color })}
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
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
