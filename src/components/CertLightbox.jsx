import React, { useEffect, useRef } from 'react';
import PORTFOLIO from '../data.js';

export default function CertLightbox({ cert, onClose }) {
  const closeBtnRef = useRef(null);
  const { ui } = PORTFOLIO;

  useEffect(() => {
    if (!cert) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    if (closeBtnRef.current) {
      closeBtnRef.current.focus();
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [cert, onClose]);

  if (!cert) return null;

  return (
    <div
      id="cert-lightbox"
      className="cert-lightbox is-open"
      role="dialog"
      aria-modal="true"
      aria-label="Certificate preview"
    >
      <div
        id="cert-lightbox-backdrop"
        className="cert-lightbox-backdrop"
        onClick={onClose}
      />
      <div className="cert-lightbox-panel">
        <button
          id="cert-lightbox-close"
          ref={closeBtnRef}
          className="cert-lightbox-close"
          type="button"
          aria-label="Close certificate preview"
          onClick={onClose}
        >
          &times;
        </button>

        <div className="cert-lightbox-body" id="cert-lightbox-body">
          {cert.image ? (
            <img src={cert.image} alt={cert.title} />
          ) : (
            <div dangerouslySetInnerHTML={{ __html: cert.svgHtml }} />
          )}
        </div>

        <div className="cert-lightbox-foot mono">
          <div>
            <h3 id="cert-lightbox-title" className="cert-lightbox-title">{cert.title}</h3>
            <p id="cert-lightbox-issuer" className="cert-lightbox-issuer">
              {(cert.issuer ? `${cert.issuer} · ` : "") + (cert.year || "")}
            </p>
          </div>
          <span className="cert-lightbox-esc">{ui.lightboxHint}</span>
        </div>
      </div>
    </div>
  );
}
