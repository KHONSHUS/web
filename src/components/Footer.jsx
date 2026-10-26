import React from 'react';
import PORTFOLIO from '../data.js';

export default function Footer() {
  const { footer, ui } = PORTFOLIO;
  const year = new Date().getFullYear();

  const handleBackToTop = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="site-footer mono">
      <div className="wrap footer-inner">
        <p>&copy; {year} {footer.name}</p>
        <a
          href="#top"
          className="back-to-top"
          id="back-to-top-btn"
          aria-label="Back to top"
          onClick={handleBackToTop}
        >
          <span>{ui.backToTop}</span>
          <span className="top-arrow" aria-hidden="true">↑</span>
        </a>
      </div>
    </footer>
  );
}
