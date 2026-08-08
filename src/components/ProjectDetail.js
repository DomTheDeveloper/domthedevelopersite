import React, { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { getProject, projects, projectIcons } from '../projects/projectsData';
import Navbar from './Navbar';
import Footer from './Footer';
import ParticleField from './ParticleField';
import ClickSpark from './ClickSpark';
import ProjectDemo from './ProjectDemo';
import ErrorBoundary from './ErrorBoundary';

const setMeta = (name, content, attr = 'name') => {
  if (typeof document === 'undefined') return;
  let el = document.head.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

const ProjectDetail = () => {
  const { slug } = useParams();
  const project = getProject(slug);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    if (!project) return undefined;
    const prevTitle = document.title;
    document.title = `${project.title} · ${project.tagline} | Dom the Developer`;
    setMeta('description', `${project.title} — ${project.description}`);
    setMeta('og:title', `${project.title} · Dom the Developer`, 'property');
    setMeta('og:description', project.tagline, 'property');
    setMeta('og:type', 'article', 'property');
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', `${project.title} · Dom the Developer`);
    setMeta('twitter:description', project.tagline);
    setMeta('theme-color', project.color);
    return () => {
      document.title = prevTitle;
      setMeta('theme-color', '#0a0e17');
    };
  }, [project]);

  if (!project) {
    return <Navigate to="/projects" replace />;
  }

  const otherProjects = projects.filter(p => p.slug !== project.slug).slice(0, 3);

  // Sections number themselves in document order, so adding, reordering, or
  // conditionally hiding one never leaves a gap in the sequence.
  let section = 0;
  const num = () => `${String(++section).padStart(2, '0')}.`;

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
            <Link to="/projects" className="project-detail__back">
              &larr; All projects
            </Link>

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
                  <button
                    type="button"
                    className="project-detail__cta project-detail__cta--primary"
                    onClick={() => {
                      const el = document.getElementById('demo');
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                  >
                    Try the Demo &darr;
                  </button>
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
              <span className="section__title-tag">{num()}</span> Overview
            </h2>
            <p className="project-detail__body">{project.overview}</p>
          </section>

          <section id="demo" className="project-detail__block project-detail__demo-section">
            <h2 className="project-detail__h2">
              <span className="section__title-tag">{num()}</span> Live Demo
            </h2>
            <p className="project-detail__body project-detail__demo-lede">
              An interactive slice of {project.title} you can poke at right here.
            </p>
            <div className="project-detail__demo-frame">
              <ErrorBoundary inline label="This demo stopped working.">
                <ProjectDemo slug={project.slug} />
              </ErrorBoundary>
            </div>
          </section>

          <section className="project-detail__block project-detail__split">
            <div>
              <h2 className="project-detail__h2">
                <span className="section__title-tag">{num()}</span> Problem
              </h2>
              <p className="project-detail__body">{project.problem}</p>
            </div>
            <div>
              <h2 className="project-detail__h2">
                <span className="section__title-tag">{num()}</span> Solution
              </h2>
              <p className="project-detail__body">{project.solution}</p>
            </div>
          </section>

          {project.architecture && (
            <section className="project-detail__block">
              <h2 className="project-detail__h2">
                <span className="section__title-tag">{num()}</span> Architecture
              </h2>
              <ol className="project-detail__arch">
                {project.architecture.map((a, i) => (
                  <li key={a.name} className="project-detail__arch-item">
                    <span className="project-detail__arch-index" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                    <div>
                      <h3 className="project-detail__arch-name">{a.name}</h3>
                      <p className="project-detail__arch-role">{a.role}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <section className="project-detail__block">
            <h2 className="project-detail__h2">
              <span className="section__title-tag">{num()}</span> Key Features
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
              <span className="section__title-tag">{num()}</span> Tech Stack
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

          {project.challenges && (
            <section className="project-detail__block">
              <h2 className="project-detail__h2">
                <span className="section__title-tag">{num()}</span> Challenges &amp; Lessons
              </h2>
              <div className="project-detail__challenges">
                {project.challenges.map((c) => (
                  <div key={c.title} className="project-detail__challenge">
                    <h3 className="project-detail__challenge-title">{c.title}</h3>
                    <p className="project-detail__challenge-body">{c.body}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {project.timeline && (
            <section className="project-detail__block">
              <h2 className="project-detail__h2">
                <span className="section__title-tag">{num()}</span> How It Came Together
              </h2>
              <ol className="project-detail__timeline">
                {project.timeline.map((t) => (
                  <li key={t.phase} className="project-detail__timeline-item">
                    <span className="project-detail__timeline-marker" aria-hidden="true" />
                    <h3 className="project-detail__timeline-phase">{t.phase}</h3>
                    <p className="project-detail__timeline-detail">{t.detail}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {project.metrics && (
            <section className="project-detail__block">
              <h2 className="project-detail__h2">
                <span className="section__title-tag">{num()}</span> Impact
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
              <span className="section__title-tag">{num()}</span> Other Work
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

      <Footer />
    </div>
  );
};

export default ProjectDetail;
