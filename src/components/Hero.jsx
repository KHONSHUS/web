import React, { useState, useEffect, useRef, useCallback } from 'react';
import PORTFOLIO from '../data.js';

const AUTO_SWIPE_INTERVAL = 2400;

export default function Hero() {
  const { hero, heroImages, contact, ui } = PORTFOLIO;
  const [current, setCurrent] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSwipingNext, setIsSwipingNext] = useState(false);

  const stackRef = useRef(null);
  const autoSwipeTimerRef = useRef(null);
  const draggingRef = useRef(false);
  const startXRef = useRef(0);
  const dxRef = useRef(0);
  const currentRef = useRef(0);
  const isSwipingNextRef = useRef(false);

  currentRef.current = current;
  draggingRef.current = isDragging;
  isSwipingNextRef.current = isSwipingNext;

  const totalCards = heroImages.length;

  const goTo = useCallback((index) => {
    setCurrent((index + totalCards) % totalCards);
  }, [totalCards]);

  const stopAutoSwipe = useCallback(() => {
    if (autoSwipeTimerRef.current) {
      clearInterval(autoSwipeTimerRef.current);
      autoSwipeTimerRef.current = null;
    }
  }, []);

  const autoSwipeNext = useCallback(() => {
    if (draggingRef.current || isSwipingNextRef.current || totalCards <= 1) return;
    setIsSwipingNext(true);

    setTimeout(() => {
      goTo(currentRef.current + 1);
      setIsSwipingNext(false);
    }, 220);
  }, [goTo, totalCards]);

  const startAutoSwipe = useCallback(() => {
    stopAutoSwipe();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (totalCards <= 1) return;
    autoSwipeTimerRef.current = setInterval(autoSwipeNext, AUTO_SWIPE_INTERVAL);
  }, [stopAutoSwipe, autoSwipeNext, totalCards]);

  const resetAutoSwipe = useCallback(() => {
    stopAutoSwipe();
    startAutoSwipe();
  }, [stopAutoSwipe, startAutoSwipe]);

  useEffect(() => {
    startAutoSwipe();

    const stackEl = stackRef.current;
    if (!stackEl) return;

    // Pause when off-screen
    let observer = null;
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) startAutoSwipe();
          else stopAutoSwipe();
        });
      }, { threshold: 0.15 });
      observer.observe(stackEl);
    }

    const onVisibilityChange = () => {
      if (document.hidden) stopAutoSwipe();
      else startAutoSwipe();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      stopAutoSwipe();
      if (observer) observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [startAutoSwipe, stopAutoSwipe]);

  const handlePointerDown = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    stopAutoSwipe();
    setIsDragging(true);
    startXRef.current = e.clientX;
    dxRef.current = 0;
    setDragOffset(0);

    if (stackRef.current && stackRef.current.setPointerCapture) {
      try { stackRef.current.setPointerCapture(e.pointerId); } catch (err) {}
    }
  };

  const handlePointerMove = (e) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - startXRef.current;
    dxRef.current = dx;
    setDragOffset(dx);
  };

  const handlePointerUp = () => {
    if (!draggingRef.current) return;
    setIsDragging(false);
    const dx = dxRef.current;
    setDragOffset(0);

    if (Math.abs(dx) > 40) {
      goTo(currentRef.current + (dx < 0 ? 1 : -1));
    }
    dxRef.current = 0;
    startAutoSwipe();
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(current - 1);
      resetAutoSwipe();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(current + 1);
      resetAutoSwipe();
    }
  };

  const currentTitle = heroImages[current]?.title || `Project ${current + 1}`;

  return (
    <section id="top" className="hero wrap">
      <div className="hero-top mono">
        <span>{hero.topLeft}</span>
        <span>{hero.topRight}</span>
      </div>

      <div className="hero-main">
        <div className="hero-copy">
          <p className="hero-role mono reveal">{hero.role}</p>
          <h1 className="reveal">{hero.headline}</h1>
          <p className="hero-pitch reveal">{hero.pitch}</p>
          <div className="hero-cta mono reveal">
            <a className="btn btn-solid" href="#projects">{hero.ctaProjects}</a>
            <a className="btn" id="hero-resume" href={contact.resume} download>{hero.ctaResume}</a>
          </div>
        </div>

        {/* Swipeable cards */}
        <div className="hero-visual reveal">
          <div
            id="stack"
            ref={stackRef}
            className="stack"
            tabIndex={0}
            role="group"
            aria-roledescription="carousel"
            aria-label="Project images. Swipe, drag, or use the arrow buttons."
            onKeyDown={handleKeyDown}
            onMouseEnter={stopAutoSwipe}
            onMouseLeave={() => { if (!draggingRef.current) startAutoSwipe(); }}
            onFocus={stopAutoSwipe}
            onBlur={() => { if (!draggingRef.current) startAutoSwipe(); }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {heroImages.map((card, i) => {
              const pos = (i - current + totalCards) % totalCards;
              const isTop = pos === 0;

              let style = {};
              if (isTop) {
                if (isDragging) {
                  style = {
                    transform: `translateX(${dragOffset}px) rotate(${-3 + dragOffset * 0.05}deg)`,
                    transition: "none"
                  };
                } else if (isSwipingNext) {
                  style = {
                    transform: "translateX(-32%) rotate(-5deg)",
                    opacity: 0.75,
                    transition: "transform 0.28s cubic-bezier(0.2, 0.8, 0.25, 1), opacity 0.25s ease"
                  };
                }
              }

              return (
                <div
                  key={card.title + i}
                  className="card"
                  data-pos={Math.min(pos, 3)}
                  data-title={card.title}
                  aria-hidden={isTop ? "false" : "true"}
                  style={style}
                >
                  {card.image ? (
                    <img src={card.image} alt={card.title} draggable={false} />
                  ) : (
                    <div className="card-face">{ui.imagePlaceholder}</div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="carousel-ui">
            <button
              id="prev-btn"
              className="car-btn"
              type="button"
              aria-label="Previous project"
              onClick={() => { goTo(current - 1); resetAutoSwipe(); }}
            >
              <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true">
                <path d="M15 4L7 12l8 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <p id="slide-info" className="carousel-info" aria-live="polite">
              {currentTitle}, {current + 1} / {totalCards}
            </p>

            <button
              id="next-btn"
              className="car-btn"
              type="button"
              aria-label="Next project"
              onClick={() => { goTo(current + 1); resetAutoSwipe(); }}
            >
              <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true">
                <path d="M9 4l8 8-8 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="hero-bottom mono">
        <span>{hero.scrollLeft}</span>
        <span>{hero.scrollRight}</span>
      </div>
    </section>
  );
}
