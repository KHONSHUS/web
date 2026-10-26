import React, { useState, useEffect, useRef, useCallback } from 'react';
import PORTFOLIO from './data.js';
import Preloader from './components/Preloader.jsx';
import BackgroundCanvas from './components/BackgroundCanvas.jsx';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import About from './components/About.jsx';
import Projects from './components/Projects.jsx';
import Skills from './components/Skills.jsx';
import Experience from './components/Experience.jsx';
import Achievements from './components/Achievements.jsx';
import CertLightbox from './components/CertLightbox.jsx';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';
import IncomingToast from './components/IncomingToast.jsx';

export default function App() {
  const [theme, setTheme] = useState(() => {
    try {
      return (
        localStorage.getItem("theme") ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      );
    } catch (e) {
      return "light";
    }
  });

  const [toast, setToast] = useState({
    visible: false,
    message: PORTFOLIO.ui.comingSoon
  });
  const toastTimerRef = useRef(null);

  const [selectedCert, setSelectedCert] = useState(null);

  // Sync theme attribute with state
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("theme", theme);
    } catch (e) {}
  }, [theme]);

  // Sync title and meta description
  useEffect(() => {
    document.title = PORTFOLIO.site.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", PORTFOLIO.site.description);
    }
  }, []);

  // Scroll reveal observer
  useEffect(() => {
    const revealEls = document.querySelectorAll(".reveal-on-scroll");
    if (!revealEls.length) return;

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-revealed");
              observer.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
      );
      revealEls.forEach((el) => observer.observe(el));
      return () => observer.disconnect();
    } else {
      revealEls.forEach((el) => el.classList.add("is-revealed"));
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const showToast = useCallback((label) => {
    const message = label
      ? label + PORTFOLIO.ui.comingSoonSuffix
      : PORTFOLIO.ui.comingSoon;

    setToast({ visible: true, message });

    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2800);
  }, []);

  return (
    <>
      <Preloader />
      <BackgroundCanvas />

      <Header currentTheme={theme} onToggleTheme={toggleTheme} />

      <main id="main">
        <Hero />
        <About />
        <Projects onShowToast={showToast} />
        <Skills />
        <Experience />
        <Achievements onSelectCert={setSelectedCert} />
        <Contact />
      </main>

      <Footer />

      <IncomingToast visible={toast.visible} message={toast.message} />

      <CertLightbox
        cert={selectedCert}
        onClose={() => setSelectedCert(null)}
      />
    </>
  );
}
