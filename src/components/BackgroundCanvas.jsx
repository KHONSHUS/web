import React, { useEffect, useRef } from 'react';

const CHARS = [
  "]", ";", ":", "\"", "'", "=", "+", "-", "*", "&", "@",
  ".", ",", "|", "\\", "%", "?", "^", "$", "#", "!",
  "{", "}", "[", "(", ")", "<", ">", "/", "~", "_"
];

const SPACING_X = 44;          // horizontal gap (px)
const SPACING_Y = 38;          // vertical gap (px)
const BASE_FONT_SIZE = 12;
const MAX_SCALE = 2.2;         // zoom near the cursor
const INFLUENCE_RADIUS = 150;  // how far the cursor reaches (px)
const BASE_ALPHA = 0.22;
const MAX_ALPHA = 0.88;

function hash(c, r) {
  let h = (c * 374761393) ^ (r * 668265263);
  h = (h ^ (h >>> 13)) * 1274126177;
  return (h ^ (h >>> 16)) >>> 0;
}

export default function BackgroundCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0, height = 0;
    let color = "#0a0a0a";
    let isVisible = true;
    let animId = null;

    let active = false;
    let tx = -9999, ty = -9999;
    let cx = -9999, cy = -9999;

    function readColor() {
      color = getComputedStyle(document.documentElement).getPropertyValue("--ink").trim() || "#0a0a0a";
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `500 ${BASE_FONT_SIZE}px "DM Mono", ui-monospace, Menlo, Consolas, monospace`;

      if (active) {
        cx += (tx - cx) * 0.22;
        cy += (ty - cy) * 0.22;
      } else {
        cx += (-9999 - cx) * 0.15;
        cy += (-9999 - cy) * 0.15;
      }

      const t = performance.now() * 0.00065;
      const scrollY = window.scrollY;

      const startRow = Math.floor(scrollY / SPACING_Y) - 1;
      const endRow = Math.ceil((scrollY + height) / SPACING_Y) + 1;

      const colsCount = Math.ceil(width / SPACING_X) + 1;
      const startX = (width - (colsCount - 1) * SPACING_X) / 2;

      const infSq = INFLUENCE_RADIUS * INFLUENCE_RADIUS;

      // Pass 1: resting characters
      ctx.globalAlpha = BASE_ALPHA;
      for (let row = startRow; row <= endRow; row++) {
        const baseY = row * SPACING_Y - scrollY;

        for (let col = 0; col < colsCount; col++) {
          const seed = hash(col, row);
          const char = CHARS[seed % CHARS.length];

          let driftX = 0, driftY = 0;
          if (!reduceMotion) {
            const phaseX = (seed & 1023) * 0.00614;
            const phaseY = ((seed >> 10) & 1023) * 0.00614;
            const speedX = 0.55 + ((seed >> 4) & 7) * 0.07;
            const speedY = 0.55 + ((seed >> 12) & 7) * 0.07;
            driftX = Math.sin(t * speedX + phaseX) * 3.5;
            driftY = Math.cos(t * speedY + phaseY) * 3.5;
          }

          const posX = startX + col * SPACING_X + driftX;
          const posY = baseY + driftY;

          let isHovered = false;
          if (active) {
            const dx = posX - cx;
            const dy = posY - cy;
            if (dx * dx + dy * dy < infSq) isHovered = true;
          }

          if (!isHovered) ctx.fillText(char, posX, posY);
        }
      }

      // Pass 2: characters near the cursor, zoomed
      if (active) {
        for (let row = startRow; row <= endRow; row++) {
          const baseY = row * SPACING_Y - scrollY;

          for (let col = 0; col < colsCount; col++) {
            const seed = hash(col, row);
            const char = CHARS[seed % CHARS.length];

            let driftX = 0, driftY = 0;
            if (!reduceMotion) {
              const phaseX = (seed & 1023) * 0.00614;
              const phaseY = ((seed >> 10) & 1023) * 0.00614;
              const speedX = 0.55 + ((seed >> 4) & 7) * 0.07;
              const speedY = 0.55 + ((seed >> 12) & 7) * 0.07;
              driftX = Math.sin(t * speedX + phaseX) * 3.5;
              driftY = Math.cos(t * speedY + phaseY) * 3.5;
            }

            const posX = startX + col * SPACING_X + driftX;
            const posY = baseY + driftY;

            const dx = posX - cx;
            const dy = posY - cy;
            const distSq = dx * dx + dy * dy;

            if (distSq < infSq) {
              const p = 1 - Math.sqrt(distSq) / INFLUENCE_RADIUS;
              const ease = p * p * (3 - 2 * p);

              const scale = 1.0 + (MAX_SCALE - 1.0) * ease;
              const alpha = BASE_ALPHA + (MAX_ALPHA - BASE_ALPHA) * ease;

              ctx.save();
              ctx.translate(posX, posY);
              ctx.scale(scale, scale);
              ctx.globalAlpha = alpha;
              ctx.fillText(char, 0, 0);
              ctx.restore();
            }
          }
        }
      }
    }

    function loop() {
      if (!isVisible) return;
      draw();
      animId = requestAnimationFrame(loop);
    }

    function startLoop() {
      if (!animId) animId = requestAnimationFrame(loop);
    }

    function stopLoop() {
      if (animId) {
        cancelAnimationFrame(animId);
        animId = null;
      }
    }

    const onPointerMove = (e) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!active) {
        active = true;
        cx = tx;
        cy = ty;
      }
      startLoop();
    };

    const release = () => { active = false; };

    const onPointerUp = (e) => {
      if (e.pointerType !== "mouse") release();
    };

    if (!reduceMotion) {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      document.documentElement.addEventListener("mouseleave", release);
      window.addEventListener("blur", release);
      window.addEventListener("pointerup", onPointerUp);
      window.addEventListener("pointercancel", release);
    }

    const onScroll = () => {
      if (!animId) draw();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", resize);

    const onVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible) startLoop();
      else stopLoop();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    const themeObserver = new MutationObserver(() => {
      readColor();
      draw();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => draw());
    }

    readColor();
    resize();
    startLoop();

    return () => {
      stopLoop();
      if (!reduceMotion) {
        window.removeEventListener("pointermove", onPointerMove);
        document.documentElement.removeEventListener("mouseleave", release);
        window.removeEventListener("blur", release);
        window.removeEventListener("pointerup", onPointerUp);
        window.removeEventListener("pointercancel", release);
      }
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      themeObserver.disconnect();
    };
  }, []);

  return <canvas id="grid" ref={canvasRef} className="grid-bg" aria-hidden="true" />;
}
