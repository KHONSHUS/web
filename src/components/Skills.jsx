import React, { useEffect, useRef } from 'react';
import PORTFOLIO from '../data.js';

function clamp01(n) {
  return Math.max(0, Math.min(1, n));
}

export default function Skills() {
  const { skills } = PORTFOLIO;
  const sectionRef = useRef(null);

  useEffect(() => {
    const skillsSec = sectionRef.current;
    if (!skillsSec) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    function updateSkills() {
      const secRect = skillsSec.getBoundingClientRect();
      const vh = window.innerHeight;

      const triggerStart = vh * 0.95;
      const triggerEnd = vh * 0.50;

      const sp = clamp01((triggerStart - secRect.top) / (triggerStart - triggerEnd));
      skillsSec.style.setProperty("--sp", sp.toFixed(3));
    }

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          ticking = false;
          updateSkills();
        });
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    updateSkills();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section id="skills" ref={sectionRef} className="skills-section">
      <div className="wrap section">
        <div className="skills-title-area">
          <div className="skills-title-row">
            <h2 className="skills-giant-title">{skills.heading}</h2>
            <span className="skills-badge mono">{skills.number}</span>
          </div>
        </div>
        <div className="skills-panel-full">
          <div className="skills" id="skills-grid">
            {skills.groups.map((group, idx) => (
              <div key={group.label + idx} className="skills-col reveal-on-scroll">
                <p className="label mono">{group.label}</p>
                <ul>
                  {group.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
