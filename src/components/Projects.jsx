import React, { useRef } from 'react';
import PORTFOLIO from '../data.js';

export default function Projects({ onShowToast }) {
  const { projects, ui } = PORTFOLIO;

  const handleMouseMove = (e) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || window.innerWidth < 860) return;
    const shot = e.currentTarget;
    const rect = shot.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotX = ((y - cy) / cy) * -4.5;
    const rotY = ((x - cx) / cx) * 4.5;

    shot.style.transform = `perspective(800px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateY(-4px)`;
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.transform = "";
  };

  const handleLinkClick = (e, url, label) => {
    if (!url || url === "#") {
      e.preventDefault();
      onShowToast(label);
    }
  };

  return (
    <section id="projects" className="projects-section">
      <div className="wrap section">
        <div className="section-head">
          <h2>{projects.heading}</h2>
          <span className="mono">{projects.number}</span>
        </div>

        <div className="projects" id="projects-list">
          {projects.items.map((p, idx) => (
            <article key={p.title + idx} className="project reveal-on-scroll">
              <figure>
                <div
                  className={`project-shot ${!p.image ? "placeholder" : ""}`}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  role={!p.image ? "img" : undefined}
                  aria-label={!p.image ? ui.projectPlaceholder : undefined}
                >
                  {p.image ? (
                    <img src={p.image} alt={p.title} />
                  ) : (
                    ui.projectPlaceholder
                  )}
                </div>
                <figcaption className="mono">{p.title}</figcaption>
              </figure>

              <div className="project-body">
                <h3>{p.title}</h3>
                <p>{p.description}</p>
                <dl className="meta">
                  <div>
                    <dt className="mono">{ui.role}</dt>
                    <dd>{p.role}</dd>
                  </div>
                  <div>
                    <dt className="mono">{ui.stack}</dt>
                    <dd>{p.stack}</dd>
                  </div>
                </dl>
                <div className="links mono">
                  <a
                    href={p.github || "#"}
                    target={p.github ? "_blank" : undefined}
                    rel={p.github ? "noopener" : undefined}
                    onClick={(e) => handleLinkClick(e, p.github, ui.github)}
                  >
                    {ui.github} <span className="link-arrow" aria-hidden="true">↗</span>
                  </a>
                  <a
                    href={p.demo || "#"}
                    target={p.demo ? "_blank" : undefined}
                    rel={p.demo ? "noopener" : undefined}
                    onClick={(e) => handleLinkClick(e, p.demo, ui.demo)}
                  >
                    {ui.demo} <span className="link-arrow" aria-hidden="true">↗</span>
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
