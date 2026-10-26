import React, { useState, useEffect, useRef } from 'react';
import PORTFOLIO from '../data.js';

function esc(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapText(text, max, maxLines) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  words.forEach(function (w) {
    if (line && (line + " " + w).length > max) {
      lines.push(line);
      line = w;
    } else {
      line = line ? line + " " + w : w;
    }
  });
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    lines.length = maxLines;
    lines[maxLines - 1] += "…";
  }
  return lines;
}

function buildCertSvg(c, certLabel) {
  const lines = wrapText(c.title || certLabel, 30, 3);
  const size = lines.length > 2 ? 26 : 30;
  const lead = size * 1.2;
  const startY = 215 - ((lines.length - 1) * lead) / 2;
  const lastY = startY + (lines.length - 1) * lead;
  const tspans = lines
    .map((l, k) => `<tspan x="400" dy="${k === 0 ? 0 : lead}">${esc(l)}</tspan>`)
    .join("");

  return (
    `<svg viewBox="0 0 800 500" class="cert-svg" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${esc(c.title)}">` +
    `<rect width="800" height="500" fill="#0e121a"/>` +
    `<rect x="24" y="24" width="752" height="452" fill="none" stroke="#d4af37" stroke-width="2" opacity="0.65"/>` +
    `<rect x="32" y="32" width="736" height="436" fill="none" stroke="#d4af37" stroke-width="1" stroke-dasharray="6,4" opacity="0.4"/>` +
    `<path d="M24 64 V24 H64 M776 64 V24 H736 M24 436 V476 H64 M776 436 V476 H736" fill="none" stroke="#d4af37" stroke-width="3"/>` +
    `<text x="400" y="96" text-anchor="middle" fill="#d4af37" font-family="'DM Mono', monospace" font-size="13" letter-spacing="5">${esc(String(certLabel).toUpperCase())}</text>` +
    `<text x="400" y="${startY}" text-anchor="middle" fill="#ffffff" font-family="'Bricolage Grotesque', sans-serif" font-weight="800" font-size="${size}">${tspans}</text>` +
    `<line x1="260" y1="${lastY + 34}" x2="540" y2="${lastY + 34}" stroke="#d4af37" stroke-width="1" opacity="0.5"/>` +
    `<text x="400" y="${lastY + 70}" text-anchor="middle" fill="#9ba8bc" font-family="'Instrument Sans', sans-serif" font-size="16">${esc(c.issuer || "")}</text>` +
    `<text x="400" y="430" text-anchor="middle" fill="#d4af37" font-family="'DM Mono', monospace" font-size="14" letter-spacing="4">${esc(c.year || "")}</text>` +
    `</svg>`
  );
}

export default function Achievements({ onSelectCert }) {
  const { achievements, ui } = PORTFOLIO;
  const items = achievements.items || [];
  const speed = achievements.speed || 60;

  const trackRef = useRef(null);
  const [reps, setReps] = useState(2);

  useEffect(() => {
    if (!items.length) return;

    function calculateReps() {
      const track = trackRef.current;
      if (!track || !track.firstElementChild) return;
      const firstGroupWidth = track.firstElementChild.getBoundingClientRect().width;
      if (firstGroupWidth > 0) {
        // Compute speed duration
        track.style.setProperty("--achv-duration", (firstGroupWidth / speed).toFixed(1) + "s");
      }
    }

    calculateReps();
    window.addEventListener("resize", calculateReps);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(calculateReps);
    }

    return () => window.removeEventListener("resize", calculateReps);
  }, [items, speed, reps]);

  if (!items.length) return null;

  const handleCardClick = (c) => {
    const svgHtml = buildCertSvg(c, ui.certLabel);
    onSelectCert({ ...c, svgHtml });
  };

  const renderCard = (c, i, isInteractive) => {
    const n = String(i + 1).padStart(2, "0");
    const svgHtml = buildCertSvg(c, ui.certLabel);

    return (
      <article
        key={i}
        className="achv-card"
        tabIndex={isInteractive ? 0 : -1}
        role="button"
        aria-haspopup="dialog"
        aria-hidden={isInteractive ? "false" : "true"}
        aria-label={c.title}
        onClick={() => handleCardClick(c)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleCardClick(c);
          }
        }}
      >
        <div className="achv-card-inner">
          <div className="achv-card-top">
            <span className="when mono">{c.year}</span>
            <span className="cert-pill mono">{ui.certLabel} § {n}</span>
          </div>
          <div className="achv-card-content">
            <div className="cert-icon-seal" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6">
                <circle cx="12" cy="9" r="6" />
                <path d="M8.5 14.5L7 22l5-3 5 3-1.5-7.5" />
              </svg>
            </div>
            <h3 className="achv-card-title">{c.title}</h3>
            <p className="achv-card-issuer mono">{c.issuer}</p>
          </div>
          <div className="achv-card-foot mono">
            <span>{ui.certHover}</span>
            <span className="achv-arrow" aria-hidden="true">↗</span>
          </div>
        </div>

        <div className="achv-cert-preview">
          <div
            className="cert-svg-frame"
            dangerouslySetInnerHTML={{ __html: svgHtml }}
          />
          {c.image && (
            <img
              src={c.image}
              alt={c.title}
              className="cert-img"
              draggable={false}
              onLoad={(e) => { e.currentTarget.style.opacity = "1"; }}
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          )}
          <div className="achv-cert-overlay">
            <span className="cert-overlay-tag mono">
              {ui.certLandscape} {c.year ? `· ${c.year}` : ""}
            </span>
            <p className="cert-overlay-name">{c.title}</p>
            <span className="cert-overlay-sub mono">
              {(c.issuer ? `${c.issuer} · ` : "") + ui.certExpand}
            </span>
          </div>
        </div>
      </article>
    );
  };

  // Repeated sets to guarantee seamless scrolling
  const setArr = Array.from({ length: Math.max(2, reps) });

  return (
    <section id="achievements" className="achievements-section">
      <div className="wrap section">
        <div className="section-head">
          <h2>{achievements.heading}</h2>
          <span className="mono">{achievements.number}</span>
        </div>
      </div>

      <div className="achv-marquee-wrap" aria-label="Certificates and achievements carousel">
        <div className="achv-marquee">
          <div className="achv-track" id="achv-track" ref={trackRef}>
            <div className="achv-group">
              {setArr.map((_, sIdx) =>
                items.map((c, i) => renderCard(c, i, sIdx === 0))
              )}
            </div>
            <div className="achv-group" aria-hidden="true">
              {setArr.map((_, sIdx) =>
                items.map((c, i) => renderCard(c, i, false))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
