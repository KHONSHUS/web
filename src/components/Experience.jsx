import React from 'react';
import PORTFOLIO from '../data.js';

export default function Experience() {
  const { experience } = PORTFOLIO;

  return (
    <section id="experience" className="experience-section">
      <div className="wrap section">
        <div className="section-head">
          <h2>{experience.heading}</h2>
          <span className="mono">{experience.number}</span>
        </div>
        <ol className="exp" id="exp-list">
          {experience.items.map((item, idx) => (
            <li key={item.title + idx} className="exp-item reveal-on-scroll">
              <p className="when mono">{item.year}</p>
              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
