import React, { useState, useEffect, useRef } from 'react';
import PORTFOLIO from '../data.js';

const NAV_SHOW_AFTER = 150;

export default function Header({ currentTheme, onToggleTheme }) {
  const [visible, setVisible] = useState(false);
  const [scrollPercent, setScrollPercent] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [themePop, setThemePop] = useState(false);
  const headerRef = useRef(null);

  const { nav, site, ui } = PORTFOLIO;

  useEffect(() => {
    const handleScroll = () => {
      const sy = window.scrollY;
      const isVis = sy > NAV_SHOW_AFTER;
      setVisible(isVis);
      if (!isVis) setMenuOpen(false);

      const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
      const pct = scrollTotal > 0 ? (sy / scrollTotal) * 100 : 0;
      setScrollPercent(Math.min(100, Math.max(0, pct)));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Section observer for active nav highlighting
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;

    const sectionElements = nav
      .map((n) => document.querySelector(n.href))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection("#" + entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );

    sectionElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [nav]);

  // Close menu on Escape key or click outside
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };

    const handleClickOutside = (e) => {
      if (menuOpen && headerRef.current && !headerRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleKey);
    document.addEventListener("pointerdown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, [menuOpen]);

  const handleThemeClick = () => {
    onToggleTheme();
    setThemePop(true);
    setTimeout(() => setThemePop(false), 220);
  };

  return (
    <>
      <a className="skip-link" href="#main">{ui.skipToContent}</a>

      <header id="site-header" ref={headerRef} className={`site-header ${visible ? "visible" : ""}`}>
        <div
          id="scroll-progress"
          className="scroll-progress"
          style={{ width: `${scrollPercent}%` }}
          aria-hidden="true"
        />

        <div className="wrap header-inner">
          <a className="brand" href="#top">{site.brand}</a>

          <nav id="nav" className={`nav mono ${menuOpen ? "open" : ""}`} aria-label="Main">
            <ul id="nav-list">
              {nav.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className={activeSection === item.href ? "active" : ""}
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="header-actions mono">
            <button
              id="theme-toggle"
              className={`text-btn ${themePop ? "theme-toggle-pop" : ""}`}
              type="button"
              aria-label={currentTheme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
              onClick={handleThemeClick}
            >
              {currentTheme === "dark" ? ui.light : ui.dark}
            </button>

            <button
              id="menu-toggle"
              className="text-btn menu-btn"
              type="button"
              aria-expanded={menuOpen}
              aria-controls="nav"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? ui.close : ui.menu}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
