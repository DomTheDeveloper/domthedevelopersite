import React, { useEffect, useRef, useState } from 'react';

const skillsData = [
  { category: 'Frontend', items: [
    { name: 'React', level: 95 },
    { name: 'TypeScript', level: 90 },
    { name: 'Next.js', level: 85 },
    { name: 'CSS/Sass', level: 90 },
    { name: 'Tailwind', level: 88 },
  ]},
  { category: 'Backend', items: [
    { name: 'Node.js', level: 92 },
    { name: 'Python', level: 88 },
    { name: 'PostgreSQL', level: 85 },
    { name: 'GraphQL', level: 80 },
    { name: 'REST APIs', level: 95 },
  ]},
  { category: 'DevOps & Tools', items: [
    { name: 'Docker', level: 85 },
    { name: 'AWS', level: 82 },
    { name: 'Git', level: 95 },
    { name: 'CI/CD', level: 88 },
    { name: 'Linux', level: 85 },
  ]},
];

const Skills = () => {
  const ref = useRef();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="skills" className={`section skills ${visible ? 'section--visible' : ''}`} ref={ref}>
      <div className="section__inner">
        <h2 className="section__title">
          <span className="section__title-tag">02.</span> Skills & Tech
        </h2>
        <div className="skills__grid">
          {skillsData.map((group, gi) => (
            <div key={group.category} className="skills__category" style={{ animationDelay: `${gi * 0.15}s` }}>
              <h3 className="skills__category-title">{group.category}</h3>
              <div className="skills__items">
                {group.items.map((skill, si) => (
                  <div key={skill.name} className="skills__item" style={{ animationDelay: `${(gi * 5 + si) * 0.08}s` }}>
                    <div className="skills__item-header">
                      <span className="skills__item-name">{skill.name}</span>
                      <span className="skills__item-level">{skill.level}%</span>
                    </div>
                    <div className="skills__bar">
                      <div
                        className="skills__bar-fill"
                        style={{ width: visible ? `${skill.level}%` : '0%', transitionDelay: `${(gi * 5 + si) * 0.08}s` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
