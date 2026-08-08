import React, { useEffect, useRef, useState } from 'react';
import InteractiveTerminal from './techzone/InteractiveTerminal';

// Grouped from the stack this site already claims — the terminal's `stack`
// command and the tech listed on each case study. Edit here and the section,
// the tooltips, and the JSON-LD `knowsAbout` list all follow.
const SKILL_GROUPS = [
  {
    label: 'Frontend',
    items: ['React', 'TypeScript', 'Next.js', 'Tailwind', 'WebGL / Canvas', 'D3.js'],
  },
  {
    label: 'Backend',
    items: ['Node.js', 'Python', 'Go', 'gRPC', 'WebSocket', 'REST'],
  },
  {
    label: 'Data',
    items: ['PostgreSQL', 'Redis', 'MongoDB'],
  },
  {
    label: 'Infrastructure',
    items: ['Docker', 'AWS', 'Kubernetes', 'CI/CD', 'Prometheus', 'Linux'],
  },
];

const FOCUS = [
  {
    title: 'Systems that stay fast under load',
    body: 'Streaming pipelines, gateways, and dashboards where the interesting work is keeping p99 flat while throughput climbs.',
  },
  {
    title: 'Developer tooling',
    body: 'CLIs, scaffolds, and pipelines that remove the week of plumbing at the start of every project.',
  },
  {
    title: 'Interfaces with real craft',
    body: 'Canvas and WebGL work, considered motion, and the accessibility and performance details that separate a demo from a product.',
  },
];

const About = () => {
  const ref = useRef();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="about" className={`section about ${visible ? 'section--visible' : ''}`} ref={ref}>
      <div className="section__inner">
        <h2 className="section__title">
          <span className="section__title-tag">01.</span> About Me
        </h2>

        <div className="about__grid">
          <div className="about__text">
            <p>
              I'm <strong>Dom</strong>, a full-stack engineer who likes the problems that live
              between the layers &mdash; where a UI decision turns into a database decision, or a
              render budget turns into an architecture one.
            </p>
            <p>
              Most of my work is React and TypeScript on the front, Node, Python, and Go behind it,
              and whatever infrastructure the thing actually needs. I care about the parts people
              feel but rarely name: how fast it responds, how it behaves when something fails, and
              whether it still works for someone on a keyboard or a slow connection.
            </p>
            <p>
              Outside of work I'm usually building something small and unreasonable &mdash; the
              arcade and experiments further down this page are most of that.
            </p>
          </div>
          <div className="about__terminal">
            <InteractiveTerminal />
          </div>
        </div>

        <div className="about__skills">
          <h3 className="about__subhead">Toolkit</h3>
          <div className="about__skill-groups">
            {SKILL_GROUPS.map((group) => (
              <div key={group.label} className="about__skill-group">
                <h4 className="about__skill-label">{group.label}</h4>
                <ul className="about__skill-list">
                  {group.items.map((item) => (
                    <li key={item} className="about__skill">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="about__focus">
          <h3 className="about__subhead">What I like building</h3>
          <div className="about__focus-grid">
            {FOCUS.map((f) => (
              <div key={f.title} className="about__focus-item">
                <h4 className="about__focus-title">{f.title}</h4>
                <p className="about__focus-body">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
