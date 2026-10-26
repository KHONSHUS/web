import React, { useEffect, useRef } from 'react';
import PORTFOLIO from '../data.js';

const COLUMNS = 15;

function createProfiles(count) {
  return Array.from({ length: count }, (_, i) => ({
    base: 0.5 + (i % 3) * 0.1 + Math.random() * 0.15,
    amp: 0.2 + Math.random() * 0.14,
    freq: 0.008 + (i % 4) * 0.002,
    phase: i * 0.6 + Math.random(),
    speed: 0.55 + Math.random() * 0.3
  }));
}

function clamp01(n) {
  return Math.max(0, Math.min(1, n));
}

export default function About() {
  const { about, ui } = PORTFOLIO;
  const sectionRef = useRef(null);
  const topContainerRef = useRef(null);
  const bottomContainerRef = useRef(null);

  useEffect(() => {
    const aboutSec = sectionRef.current;
    const topContainer = topContainerRef.current;
    const bottomContainer = bottomContainerRef.current;
    if (!aboutSec || !topContainer || !bottomContainer) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    function buildColumns(container) {
      container.replaceChildren();
      for (let i = 0; i < COLUMNS; i++) {
        const col = document.createElement("div");
        col.className = "col";
        container.appendChild(col);
      }
      return [...container.querySelectorAll(".col")];
    }

    const topCols = buildColumns(topContainer);
    const bottomCols = buildColumns(bottomContainer);

    const topProfiles = createProfiles(COLUMNS);
    const bottomProfiles = createProfiles(COLUMNS);

    function applyColumns(container, cols, profiles, factor, sy) {
      if (factor <= 0.005) {
        container.style.visibility = "hidden";
        container.style.opacity = "0";
        for (let i = 0; i < cols.length; i++) {
          cols[i].style.transform = "scaleY(0)";
        }
      } else {
        container.style.visibility = "visible";
        container.style.opacity = "1";
        for (let i = 0; i < cols.length; i++) {
          const p = profiles[i];
          const wave = Math.sin(sy * p.freq + p.phase) * p.amp;
          const h = clamp01((p.base + wave * p.speed) * factor);
          cols[i].style.transform = "scaleY(" + h.toFixed(3) + ")";
        }
      }
    }

    function updateCols() {
      const rect = aboutSec.getBoundingClientRect();
      const vh = window.innerHeight;
      const sy = window.scrollY;

      const ap = clamp01(1 - (rect.top - vh * 0.15) / (vh * 0.75));
      aboutSec.style.setProperty("--ap", ap.toFixed(3));

      let topFactor = 0;
      const topStart = vh * 0.88;
      const topEnd = 60;
      if (sy > 25 && rect.top < topStart && rect.top > topEnd) {
        const t = (topStart - rect.top) / (topStart - topEnd);
        topFactor = Math.sin(t * Math.PI);
      }

      let bottomFactor = 0;
      const botStart = vh - 60;
      const botEnd = 60;
      if (rect.bottom < botStart && rect.bottom > botEnd) {
        const t = (botStart - rect.bottom) / (botStart - botEnd);
        bottomFactor = Math.sin(t * Math.PI);
      }

      applyColumns(topContainer, topCols, topProfiles, topFactor, sy);
      applyColumns(bottomContainer, bottomCols, bottomProfiles, bottomFactor, sy);
    }

    let ticking = false;
    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          ticking = false;
          updateCols();
        });
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    updateCols();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section id="about" ref={sectionRef} className="about-section">
      <div id="about-cols-top" ref={topContainerRef} className="about-cols-edge about-cols-top" aria-hidden="true" />

      <div className="wrap section">
        <div className="section-head">
          <h2>{about.heading}</h2>
          <span className="mono">{about.number}</span>
        </div>

        <div className="about-grid">
          <figure>
            <div id="about-photo">
              {about.photo ? (
                <div className="photo">
                  <img src={about.photo} alt={about.photoAlt} />
                </div>
              ) : (
                <div className="photo placeholder" role="img" aria-label={ui.photoPlaceholder}>
                  {ui.photoPlaceholder}
                </div>
              )}
            </div>
            <figcaption className="mono">{about.caption}</figcaption>
          </figure>

          <div>
            <p className="lede">{about.lede}</p>
            <p className="about-body">{about.body}</p>
            <div className="about-cols" id="about-cols">
              {about.columns.map((col, idx) => (
                <div key={idx}>
                  <p className="label mono">{col.label}</p>
                  <p>{col.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div id="about-cols-bottom" ref={bottomContainerRef} className="about-cols-edge about-cols-bottom" aria-hidden="true" />
    </section>
  );
}
