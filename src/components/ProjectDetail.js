import React, { useEffect } from 'react';
import { Link, Navigate, useParams, useNavigate } from 'react-router-dom';
import { getProject, projects, projectIcons } from '../projects/projectsData';
import Navbar from './Navbar';
import ParticleField from './ParticleField';
import ClickSpark from './ClickSpark';
import ProjectDemo from './ProjectDemo';

const ProjectDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const project = getProject(slug);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    if (project) {
      document.title = `${project.title} | Dom the Developer`;
    }
    return () => {
      document.title = 'Dom the Developer | Portfolio';
    };
  }, [project, slug]);

  if (!project) {
    return <Navigate to="/" replace state={{ scrollTo: 'projects' }} />;
  }

  const goToProjects = (e) => {
    e.preventDefault();
    navigate('/', { state: { scrollTo: 'projects' } });
  };

  const otherProjects = projects.filter(p => p.slug !== project.slug).slice(0, 3);

  return (
    <div className="App">
      <ParticleField />
      <ClickSpark />
      <Navbar />

      <main
        className="project-detail"
        style={{ '--accent': project.color }}
      >
        <div className="project-detail__hero">
          <div className="project-detail__hero-glow" />
          <div className="project-detail__inner">
            <a href="/" className="project-detail__back" onClick={goToProjects}>
              &larr; All projects
            </a>

            <div className="project-detail__hero-grid">
              <div className="project-detail__hero-text">
                <div className="project-detail__meta-row">
                  <span className="project-detail__meta-pill">{project.year}</span>
                  <span className="project-detail__meta-pill">{project.status}</span>
                </div>
                <h1 className="project-detail__title">{project.title}</h1>
                <p className="project-detail__tagline">{project.tagline}</p>
                <div className="project-detail__tags">
                  {project.tags.map(tag => (
                    <span key={tag} className="project-card__tag">{tag}</span>
                  ))}
                </div>
                <div className="project-detail__cta-row">
                  <a
                    href="#demo"
                    className="project-detail__cta project-detail__cta--primary"
                    onClick={(e) => {
                      e.preventDefault();
                      const el = document.getElementById('demo');
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                  >
                    Try the Demo &darr;
                  </a>
                </div>
              </div>

              <div className="project-detail__hero-art" aria-hidden="true">
                <div className="project-detail__art-frame">
                  <div className="project-detail__art-grid" />
                  <div className="project-detail__art-icon">
                    {React.cloneElement(projectIcons[project.icon], { stroke: project.color })}
                  </div>
                  <div className="project-detail__art-pulse" />
                </div>
              </div>
            </div>

            <dl className="project-detail__facts">
              <div className="project-detail__fact">
                <dt>Role</dt><dd>{project.role}</dd>
              </div>
              <div className="project-detail__fact">
                <dt>Duration</dt><dd>{project.duration}</dd>
              </div>
              <div className="project-detail__fact">
                <dt>Stack</dt><dd>{project.tags.join(' · ')}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="project-detail__inner">
          <section className="project-detail__block">
            <h2 className="project-detail__h2">
              <span className="section__title-tag">01.</span> Overview
            </h2>
            <p className="project-detail__body">{project.overview}</p>
          </section>

          <section id="demo" className="project-detail__block project-detail__demo-section">
            <h2 className="project-detail__h2">
              <span className="section__title-tag">02.</span> Live Demo
            </h2>
            <p className="project-detail__body project-detail__demo-lede">
              An interactive slice of {project.title} you can poke at right here.
            </p>
            <div className="project-detail__demo-frame">
              <ProjectDemo slug={project.slug} />
            </div>
          </section>

          <section className="project-detail__block project-detail__split">
            <div>
              <h2 className="project-detail__h2">
                <span className="section__title-tag">03.</span> Problem
              </h2>
              <p className="project-detail__body">{project.problem}</p>
            </div>
            <div>
              <h2 className="project-detail__h2">
                <span className="section__title-tag">04.</span> Solution
              </h2>
              <p className="project-detail__body">{project.solution}</p>
            </div>
          </section>

          <section className="project-detail__block">
            <h2 className="project-detail__h2">
              <span className="section__title-tag">05.</span> Key Features
            </h2>
            <div className="project-detail__features">
              {project.features.map((f) => (
                <div key={f.title} className="project-detail__feature">
                  <h3 className="project-detail__feature-title">{f.title}</h3>
                  <p className="project-detail__feature-desc">{f.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="project-detail__block">
            <h2 className="project-detail__h2">
              <span className="section__title-tag">06.</span> Tech Stack
            </h2>
            <div className="project-detail__stack">
              {project.stack.map((s) => (
                <div key={s.name} className="project-detail__stack-item">
                  <div className="project-detail__stack-name">{s.name}</div>
                  <div className="project-detail__stack-why">{s.why}</div>
                </div>
              ))}
            </div>
          </section>

          {project.metrics && (
            <section className="project-detail__block">
              <h2 className="project-detail__h2">
                <span className="section__title-tag">07.</span> Impact
              </h2>
              <div className="project-detail__metrics">
                {project.metrics.map((m) => (
                  <div key={m.label} className="project-detail__metric">
                    <div className="project-detail__metric-value">{m.value}</div>
                    <div className="project-detail__metric-label">{m.label}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="project-detail__block project-detail__next">
            <h2 className="project-detail__h2">
              <span className="section__title-tag">08.</span> Other Work
            </h2>
            <div className="project-detail__next-grid">
              {otherProjects.map((p) => (
                <Link
                  key={p.slug}
                  to={`/project/${p.slug}`}
                  className="project-card project-card--link project-card--mini"
                  style={{ '--accent': p.color }}
                >
                  <div className="project-card__glow" />
                  <div className="project-card__content">
                    <div className="project-card__icon">
                      {React.cloneElement(projectIcons[p.icon], { stroke: p.color })}
                    </div>
                    <h3 className="project-card__title">{p.title}</h3>
                    <p className="project-card__desc">{p.tagline}</p>
                    <span className="project-card__link">View Project &rarr;</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Dom the Developer. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default ProjectDetail;
