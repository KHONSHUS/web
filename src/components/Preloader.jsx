import React, { useEffect, useState, useRef } from 'react';
import PORTFOLIO from '../data.js';

const SYMBOLS = [
  "\\", "%", "?", "^", "$", "#", "!", "~", "'", "/", "<", ">",
  "(", ")", "[", "]", "{", "}", "=", "+", "*", "&", "@", ":",
  ";", "\"", ".", "-", "_", "|", "°", "¬", "£", "€", "§", "±",
  "×", "÷", "≠", "≤", "≥", "∞", "Δ", "Σ", "Π", "√", "∫", "∂",
  "∇", "∈", "∉", "⊂", "⊃", "∪", "∩", "∧", "∨", "→", "←", "↑",
  "↓", "↔", "⇒", "⇐", "∴", "∵", "∅"
];

const MONO_SHADES = [
  "var(--ink)",
  "color-mix(in srgb, var(--ink) 92%, transparent)",
  "color-mix(in srgb, var(--ink) 80%, transparent)",
  "color-mix(in srgb, var(--ink) 68%, transparent)",
  "color-mix(in srgb, var(--ink) 54%, transparent)",
  "color-mix(in srgb, var(--ink) 42%, transparent)",
  "color-mix(in srgb, var(--ink) 30%, transparent)",
  "color-mix(in srgb, var(--ink) 86%, transparent)",
  "color-mix(in srgb, var(--ink) 74%, transparent)",
  "color-mix(in srgb, var(--ink) 60%, transparent)",
  "color-mix(in srgb, var(--ink) 48%, transparent)",
  "color-mix(in srgb, var(--ink) 36%, transparent)",
  "color-mix(in srgb, var(--ink) 24%, transparent)"
];

export default function Preloader({ onFinish }) {
  const [typedName, setTypedName] = useState("");
  const [progress, setProgress] = useState(0);
  const [hidden, setHidden] = useState(false);
  const [unmounted, setUnmounted] = useState(false);
  const isDoneRef = useRef(false);
  const streamsRef = useRef(null);

  const fullName = PORTFOLIO.preloader.name;
  const pageTitle = PORTFOLIO.preloader.pageTitle;
  const skipText = PORTFOLIO.ui.preloaderSkip;

  const finish = () => {
    if (isDoneRef.current) return;
    isDoneRef.current = true;
    setProgress(100);
    setHidden(true);
    document.body.classList.remove("preload-locked");
    document.body.classList.add("preload-revealing");

    setTimeout(() => {
      setUnmounted(true);
      document.body.classList.remove("preload-revealing");
      if (onFinish) onFinish();
    }, 750);
  };

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.body.classList.remove("preload-locked");
      setUnmounted(true);
      if (onFinish) onFinish();
      return;
    }

    document.body.classList.add("preload-locked");

    // Populate stream tracks
    const streamsEl = streamsRef.current;
    if (streamsEl) {
      const cols = streamsEl.querySelectorAll(".stream-col");
      cols.forEach((col, colIdx) => {
        const speed = 11 + (colIdx % 3) * 2.2 + Math.random() * 1.5;
        col.style.setProperty("--stream-speed", speed.toFixed(1) + "s");

        const track1 = document.createElement("div");
        track1.className = "stream-track";
        const track2 = document.createElement("div");
        track2.className = "stream-track";

        for (let i = 0; i < 36; i++) {
          const sym = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
          const colr = MONO_SHADES[Math.floor(Math.random() * MONO_SHADES.length)];

          const span1 = document.createElement("span");
          span1.className = "stream-char";
          span1.textContent = sym;
          span1.style.color = colr;
          track1.appendChild(span1);

          const span2 = document.createElement("span");
          span2.className = "stream-char";
          span2.textContent = sym;
          span2.style.color = colr;
          track2.appendChild(span2);
        }

        col.replaceChildren(track1, track2);
      });
    }

    // Glitch animation on random characters
    const glitchInterval = setInterval(() => {
      if (isDoneRef.current || !streamsRef.current) return;
      const allChars = streamsRef.current.querySelectorAll(".stream-char");
      if (allChars.length > 0) {
        const target = allChars[Math.floor(Math.random() * allChars.length)];
        target.textContent = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        target.style.color = MONO_SHADES[Math.floor(Math.random() * MONO_SHADES.length)];
        target.classList.add("glitch-flash");
        setTimeout(() => target.classList.remove("glitch-flash"), 220);
      }
    }, 130);

    // Typing effect
    let charIndex = 0;
    let typeTimeout = null;

    const typeLetter = () => {
      if (isDoneRef.current) return;
      if (charIndex < fullName.length) {
        charIndex++;
        setTypedName(fullName.slice(0, charIndex));
        setProgress(Math.round((charIndex / fullName.length) * 100));
        typeTimeout = setTimeout(typeLetter, 50 + Math.random() * 35);
      } else {
        setProgress(100);
        setTimeout(finish, 400);
      }
    };

    typeTimeout = setTimeout(typeLetter, 280);

    const onKey = (e) => {
      if (e.key === "Escape" || e.key === " ") {
        finish();
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      clearInterval(glitchInterval);
      clearTimeout(typeTimeout);
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("preload-locked");
    };
  }, []);

  if (unmounted) return null;

  return (
    <aside
      id="preloader"
      className={`preloader ${hidden ? "preloader-hidden" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Loading portfolio"
    >
      <div className="preloader-card">
        <div id="preload-streams" ref={streamsRef} className="preload-streams" aria-hidden="true">
          <div className="stream-col" data-col="0" data-dir="up"></div>
          <div className="stream-col" data-col="1" data-dir="down"></div>
          <div className="stream-col" data-col="2" data-dir="up"></div>
          <div className="stream-col" data-col="3" data-dir="down"></div>
          <div className="stream-col" data-col="4" data-dir="up"></div>
        </div>

        <div className="preload-code-box">
          <pre className="preload-code">
            <code>
              <span className="syn-bracket">&lt;!</span>
              <span className="syn-kw">DOCTYPE</span>{" "}
              <span className="syn-doctype-html">html</span>
              <span className="syn-bracket">&gt;</span>{"\n"}
              <span className="syn-bracket">&lt;</span>
              <span className="syn-tag">html</span>
              <span className="syn-bracket">&gt;</span>{"\n"}
              {"       "}
              <span className="syn-bracket">&lt;</span>
              <span className="syn-tag">head</span>
              <span className="syn-bracket">&gt;</span>{"\n"}
              {"              "}
              <span className="syn-bracket">&lt;</span>
              <span className="syn-tag">title</span>
              <span className="syn-bracket">&gt;</span>
              <span className="syn-txt">{pageTitle}</span>
              <span className="syn-bracket">&lt;/</span>
              <span className="syn-tag">title</span>
              <span className="syn-bracket">&gt;</span>{"\n"}
              {"       "}
              <span className="syn-bracket">&lt;/</span>
              <span className="syn-tag">head</span>
              <span className="syn-bracket">&gt;</span>{"\n"}
              {"       "}
              <span className="syn-bracket">&lt;</span>
              <span className="syn-tag">body</span>
              <span className="syn-bracket">&gt;</span>{"\n"}
              {"              "}
              <span className="syn-bracket">&lt;</span>
              <span className="syn-tag">h1</span>
              <span className="syn-bracket">&gt;</span>
              <span id="preload-typed-name" className="syn-name">{typedName}</span>
              <span className="syn-cursor" aria-hidden="true">|</span>
              <span className="syn-bracket">&lt;/</span>
              <span className="syn-tag">h1</span>
              <span className="syn-bracket">&gt;</span>{"\n"}
              {"       "}
              <span className="syn-bracket">&lt;/</span>
              <span className="syn-tag">body</span>
              <span className="syn-bracket">&gt;</span>{"\n"}
              <span className="syn-bracket">&lt;/</span>
              <span className="syn-tag">html</span>
              <span className="syn-bracket">&gt;</span>
            </code>
          </pre>
        </div>
      </div>

      <div
        id="preload-hairline"
        className="preload-hairline"
        style={{ width: `${progress}%` }}
        aria-hidden="true"
      ></div>

      <button
        id="preload-skip"
        className="preload-skip mono"
        type="button"
        aria-label="Skip intro animation"
        onClick={finish}
      >
        {skipText}
      </button>
    </aside>
  );
}
