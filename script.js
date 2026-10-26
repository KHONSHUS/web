// ==========================================================
// FILL THE PAGE FROM data.js
// ==========================================================
const D = PORTFOLIO;
const UI = D.ui;

// makes text safe to place inside HTML
function esc(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

(function fillPage() {
  const $ = (id) => document.getElementById(id);

  document.title = D.site.title;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute("content", D.site.description);

  // menu
  $("nav-list").innerHTML = D.nav
    .map((n) => `<li><a href="${esc(n.href)}">${esc(n.label)}</a></li>`)
    .join("");

  // hero cards
  $("stack").innerHTML = D.heroImages
    .map((c) => {
      const face = c.image
        ? `<img src="${esc(c.image)}" alt="${esc(c.title)}" draggable="false">`
        : `<div class="card-face">${esc(UI.imagePlaceholder)}</div>`;
      return `<div class="card" data-title="${esc(c.title)}">${face}</div>`;
    })
    .join("");
  $("hero-resume").setAttribute("href", D.contact.resume);

  // about
  $("about-photo").innerHTML = D.about.photo
    ? `<div class="photo"><img src="${esc(D.about.photo)}" alt="${esc(D.about.photoAlt)}"></div>`
    : `<div class="photo placeholder" role="img" aria-label="${esc(UI.photoPlaceholder)}">${esc(UI.photoPlaceholder)}</div>`;
  $("about-cols").innerHTML = D.about.columns
    .map((c) => `<div><p class="label mono">${esc(c.label)}</p><p>${esc(c.text)}</p></div>`)
    .join("");

  // projects (an empty link shows the "coming soon" message)
  const arrow = '<span class="link-arrow" aria-hidden="true">↗</span>';
  $("projects-list").innerHTML = D.projects.items
    .map((p) => {
      const shot = p.image
        ? `<div class="project-shot"><img src="${esc(p.image)}" alt="${esc(p.title)}"></div>`
        : `<div class="project-shot placeholder" role="img" aria-label="${esc(UI.projectPlaceholder)}">${esc(UI.projectPlaceholder)}</div>`;
      return `
<article class="project reveal-on-scroll">
  <figure>${shot}<figcaption class="mono">${esc(p.title)}</figcaption></figure>
  <div class="project-body">
    <h3>${esc(p.title)}</h3>
    <p>${esc(p.description)}</p>
    <dl class="meta">
      <div><dt class="mono">${esc(UI.role)}</dt><dd>${esc(p.role)}</dd></div>
      <div><dt class="mono">${esc(UI.stack)}</dt><dd>${esc(p.stack)}</dd></div>
    </dl>
    <div class="links mono">
      <a href="${esc(p.github || "#")}" target="_blank" rel="noopener">${esc(UI.github)} ${arrow}</a>
      <a href="${esc(p.demo || "#")}" target="_blank" rel="noopener">${esc(UI.demo)} ${arrow}</a>
    </div>
  </div>
</article>`;
    })
    .join("");

  // skills
  $("skills-grid").innerHTML = D.skills.groups
    .map((g) => `
<div class="skills-col reveal-on-scroll">
  <p class="label mono">${esc(g.label)}</p>
  <ul>${g.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
</div>`)
    .join("");

  // experience
  $("exp-list").innerHTML = D.experience.items
    .map((e) => `
<li class="exp-item reveal-on-scroll">
  <p class="when mono">${esc(e.year)}</p>
  <div><h3>${esc(e.title)}</h3><p>${esc(e.description)}</p></div>
</li>`)
    .join("");

  // contact links
  const emailLink = document.querySelector(".contact-email-link");
  emailLink.textContent = D.contact.email;
  emailLink.setAttribute("href", "mailto:" + D.contact.email);
  const more = [];
  if (D.contact.linkedin) more.push(`<li><a href="${esc(D.contact.linkedin)}" target="_blank" rel="noopener">${esc(UI.linkedin)} ${arrow}</a></li>`);
  if (D.contact.github) more.push(`<li><a href="${esc(D.contact.github)}" target="_blank" rel="noopener">${esc(UI.github)} ${arrow}</a></li>`);
  if (D.contact.resume) more.push(`<li><a href="${esc(D.contact.resume)}" download>${esc(UI.resume)} <span class="link-arrow" aria-hidden="true">↓</span></a></li>`);
  $("contact-links").insertAdjacentHTML("beforeend", more.join(""));

  // every element with data-text gets its text from data.js
  document.querySelectorAll("[data-text]").forEach((el) => {
    const value = el.dataset.text.split(".").reduce((o, k) => (o == null ? o : o[k]), D);
    if (value != null) el.textContent = value;
  });
})();

// ==========================================================
// SETTINGS
// ==========================================================
const CONTACT_EMAIL = D.contact.email;

// scroll distance (px) before the nav bar appears
const NAV_SHOW_AFTER = 150;

// ---------- Nav bar ----------
const header = document.getElementById("site-header");
const nav = document.getElementById("nav");
const menuBtn = document.getElementById("menu-toggle");
const scrollProgress = document.getElementById("scroll-progress");

function setMenu(open) {
  nav.classList.toggle("open", open);
  menuBtn.setAttribute("aria-expanded", String(open));
  menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  menuBtn.textContent = open ? UI.close : UI.menu;
}

function updateHeader() {
  const show = window.scrollY > NAV_SHOW_AFTER;
  header.classList.toggle("visible", show);
  if (!show) setMenu(false);

  if (scrollProgress) {
    const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollTotal > 0 ? (window.scrollY / scrollTotal) * 100 : 0;
    scrollProgress.style.width = Math.min(100, Math.max(0, progress)) + "%";
  }
}

setMenu(false);
window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

// ---------- Swipeable image stack with auto-swipe ----------
const stack = document.getElementById("stack");
const cards = [...stack.querySelectorAll(".card")];
const slideInfo = document.getElementById("slide-info");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
let current = 0;
const AUTO_SWIPE_INTERVAL = 2400;
let autoSwipeTimer = null;
let isAutoSwiping = false;

function render() {
  cards.forEach((card, i) => {
    const pos = (i - current + cards.length) % cards.length;
    card.dataset.pos = Math.min(pos, 3);
    card.setAttribute("aria-hidden", pos === 0 ? "false" : "true");
    card.style.transform = "";
    card.style.opacity = "";
    card.style.transition = "";
  });
  const title = cards[current].dataset.title || "Project " + (current + 1);
  slideInfo.textContent = title + ", " + (current + 1) + " / " + cards.length;
}

function goTo(index) {
  current = (index + cards.length) % cards.length;
  render();
}

function autoSwipeNext() {
  if (dragging || isAutoSwiping || cards.length <= 1) return;
  isAutoSwiping = true;
  const topCard = cards[current];

  if (topCard) {
    topCard.style.transition = "transform 0.28s cubic-bezier(0.2, 0.8, 0.25, 1), opacity 0.25s ease";
    topCard.style.transform = "translateX(-32%) rotate(-5deg)";
    topCard.style.opacity = "0.75";

    setTimeout(() => {
      goTo(current + 1);
      isAutoSwiping = false;
    }, 220);
  } else {
    goTo(current + 1);
    isAutoSwiping = false;
  }
}

function startAutoSwipe() {
  stopAutoSwipe();
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  autoSwipeTimer = setInterval(autoSwipeNext, AUTO_SWIPE_INTERVAL);
}

function stopAutoSwipe() {
  if (autoSwipeTimer) {
    clearInterval(autoSwipeTimer);
    autoSwipeTimer = null;
  }
}

function resetAutoSwipe() {
  stopAutoSwipe();
  startAutoSwipe();
}

prevBtn.addEventListener("click", () => { goTo(current - 1); resetAutoSwipe(); });
nextBtn.addEventListener("click", () => { goTo(current + 1); resetAutoSwipe(); });

stack.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") { e.preventDefault(); goTo(current - 1); resetAutoSwipe(); }
  if (e.key === "ArrowRight") { e.preventDefault(); goTo(current + 1); resetAutoSwipe(); }
});

// pause while hovering or focused
stack.addEventListener("mouseenter", stopAutoSwipe);
stack.addEventListener("mouseleave", () => { if (!dragging) startAutoSwipe(); });
stack.addEventListener("focusin", stopAutoSwipe);
stack.addEventListener("focusout", startAutoSwipe);

// drag (mouse) or swipe (touch) the top card
let dragging = false;
let startX = 0;
let dx = 0;

stack.addEventListener("pointerdown", (e) => {
  if (e.pointerType === "mouse" && e.button !== 0) return;
  stopAutoSwipe();
  dragging = true;
  startX = e.clientX;
  dx = 0;
  stack.setPointerCapture(e.pointerId);
  cards[current].style.transition = "none";
});

stack.addEventListener("pointermove", (e) => {
  if (!dragging) return;
  dx = e.clientX - startX;
  cards[current].style.transform =
    "translateX(" + dx + "px) rotate(" + (-3 + dx * 0.05) + "deg)";
});

function endDrag() {
  if (!dragging) return;
  dragging = false;
  const card = cards[current];
  card.style.transition = "";
  card.style.transform = "";
  if (Math.abs(dx) > 40) {
    goTo(current + (dx < 0 ? 1 : -1));
  }
  dx = 0;
  startAutoSwipe();
}

stack.addEventListener("pointerup", endDrag);
stack.addEventListener("pointercancel", endDrag);

// pause when the stack is off screen or the tab is hidden
if ("IntersectionObserver" in window) {
  const stackObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) startAutoSwipe();
      else stopAutoSwipe();
    });
  }, { threshold: 0.15 });
  stackObserver.observe(stack);
} else {
  startAutoSwipe();
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopAutoSwipe();
  else startAutoSwipe();
});

render();

// ---------- Theme (light / dark) ----------
const root = document.documentElement;
const themeBtn = document.getElementById("theme-toggle");

function applyTheme(theme) {
  root.setAttribute("data-theme", theme);
  themeBtn.textContent = theme === "dark" ? UI.light : UI.dark;
  themeBtn.setAttribute(
    "aria-label",
    theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
  );
}

function getSavedTheme() {
  try { return localStorage.getItem("theme"); } catch (e) { return null; }
}

const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
applyTheme(getSavedTheme() || (prefersDark ? "dark" : "light"));

themeBtn.addEventListener("click", () => {
  const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(next);
  try { localStorage.setItem("theme", next); } catch (e) {}
  themeBtn.classList.add("theme-toggle-pop");
  setTimeout(() => themeBtn.classList.remove("theme-toggle-pop"), 220);
});

// ---------- Mobile menu ----------
menuBtn.addEventListener("click", () => {
  setMenu(!nav.classList.contains("open"));
});

nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") setMenu(false);
});

// ---------- Highlight the nav link of the section in view ----------
const navLinks = [...nav.querySelectorAll("a")];
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          link.classList.toggle(
            "active",
            link.getAttribute("href") === "#" + entry.target.id
          );
        });
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );
  sections.forEach((section) => observer.observe(section));
}

// ---------- Contact form ----------
// ==========================================================
// CONTACT FORM — Formspree
// Submits via AJAX to the Formspree endpoint in data.js.
// Falls back to mailto: if no formspree URL is configured.
// ==========================================================
const form = document.getElementById("contact-form");
const statusEl = document.getElementById("form-status");
const submitBtn = form.querySelector('button[type="submit"]');

function setStatus(message, type) {
  statusEl.textContent = message;
  statusEl.className = "form-status " + (type || "");
}

function setSubmitting(busy) {
  submitBtn.disabled = busy;
  submitBtn.textContent = busy ? (UI.sending || "Sending…") : (UI.send || "Send message");
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const fields = ["name", "email", "message"].map((id) => form.elements[id]);
  fields.forEach((f) => f.classList.remove("invalid"));

  const missing = fields.find((f) => !f.value.trim());
  if (missing) {
    missing.classList.add("invalid");
    missing.focus();
    setStatus("Please fill in your " + missing.name + ".", "error");
    return;
  }

  const emailField = form.elements.email;
  if (!emailField.checkValidity()) {
    emailField.classList.add("invalid");
    emailField.focus();
    setStatus("Enter a valid email address, like name@example.com.", "error");
    return;
  }

  // If a Formspree endpoint is configured, submit via AJAX
  const formspreeURL = D.contact.formspree;
  if (formspreeURL) {
    setSubmitting(true);
    setStatus("", "");

    fetch(formspreeURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        name: form.elements.name.value.trim(),
        email: emailField.value.trim(),
        message: form.elements.message.value.trim()
      })
    })
      .then((res) => {
        setSubmitting(false);
        if (res.ok) {
          setStatus(UI.sent || "Message sent — thank you!", "success");
          form.reset();
        } else {
          return res.json().then((data) => {
            const msg = (data.errors && data.errors.map((err) => err.message).join(", ")) || "";
            setStatus(msg || (UI.sendError || "Something went wrong. Please try again."), "error");
          });
        }
      })
      .catch(() => {
        setSubmitting(false);
        setStatus(UI.sendError || "Something went wrong. Please try again or email me directly.", "error");
      });
  } else {
    // Fallback: open email client
    const name = form.elements.name.value.trim();
    const email = emailField.value.trim();
    const message = form.elements.message.value.trim();
    const subject = encodeURIComponent("Portfolio message from " + name);
    const body = encodeURIComponent(message + "\n\nFrom: " + name + " (" + email + ")");
    window.location.href = "mailto:" + CONTACT_EMAIL + "?subject=" + subject + "&body=" + body;
    setStatus("Opening your email app. Press send there to finish.", "");
    form.reset();
  }
});

// ==========================================================
// CODE CHARACTER BACKGROUND
// Characters drift, scroll with the page, and zoom near the cursor
// ==========================================================
(function () {
  const canvas = document.getElementById("grid");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  // same character and drift for the same grid cell every frame
  function hash(c, r) {
    let h = (c * 374761393) ^ (r * 668265263);
    h = (h ^ (h >>> 13)) * 1274126177;
    return (h ^ (h >>> 16)) >>> 0;
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

    // pass 1: resting characters
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

    // pass 2: characters near the cursor, zoomed
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

  if (!reduceMotion) {
    window.addEventListener("pointermove", (e) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!active) {
        active = true;
        cx = tx;
        cy = ty;
      }
      startLoop();
    }, { passive: true });

    const release = () => { active = false; };

    document.documentElement.addEventListener("mouseleave", release);
    window.addEventListener("blur", release);
    window.addEventListener("pointerup", (e) => {
      if (e.pointerType !== "mouse") release();
    });
    window.addEventListener("pointercancel", release);
  }

  window.addEventListener("scroll", () => {
    if (!animId) draw();
  }, { passive: true });

  window.addEventListener("resize", resize);

  document.addEventListener("visibilitychange", () => {
    isVisible = !document.hidden;
    if (isVisible) startLoop();
    else stopLoop();
  });

  new MutationObserver(() => {
    readColor();
    draw();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => draw());
  }

  readColor();
  resize();
  startLoop();
})();

// ==========================================================
// ABOUT PAGE SCROLL EFFECTS
// moving columns on the top and bottom edge, and the slide-in content
// ==========================================================
(function () {
  const topContainer = document.getElementById("about-cols-top");
  const bottomContainer = document.getElementById("about-cols-bottom");
  const aboutSec = document.getElementById("about");
  if (!aboutSec || !topContainer || !bottomContainer) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const COLUMNS = 15;
  function buildColumns(container) {
    for (let i = 0; i < COLUMNS; i++) {
      const col = document.createElement("div");
      col.className = "col";
      container.appendChild(col);
    }
    return [...container.querySelectorAll(".col")];
  }
  const topCols = buildColumns(topContainer);
  const bottomCols = buildColumns(bottomContainer);

  // each column gets its own height and rhythm (bigger base / amp = more dramatic)
  function createProfiles(count) {
    return Array.from({ length: count }, (_, i) => ({
      base: 0.5 + (i % 3) * 0.1 + Math.random() * 0.15,
      amp: 0.2 + Math.random() * 0.14,
      freq: 0.008 + (i % 4) * 0.002,
      phase: i * 0.6 + Math.random(),
      speed: 0.55 + Math.random() * 0.3
    }));
  }

  const topProfiles = createProfiles(COLUMNS);
  const bottomProfiles = createProfiles(COLUMNS);

  let ticking = false;

  function clamp01(n) { return Math.max(0, Math.min(1, n)); }

  function updateCols() {
    ticking = false;
    const rect = aboutSec.getBoundingClientRect();
    const vh = window.innerHeight;
    const sy = window.scrollY;

    // 0 when About just appears, 1 when it is fully in view
    const ap = clamp01(1 - (rect.top - vh * 0.15) / (vh * 0.75));
    aboutSec.style.setProperty("--ap", ap.toFixed(3));

    // top columns move only while scrolling from Hero into About
    let topFactor = 0;
    const topStart = vh * 0.88;
    const topEnd = 60;
    if (sy > 25 && rect.top < topStart && rect.top > topEnd) {
      const t = (topStart - rect.top) / (topStart - topEnd);
      topFactor = Math.sin(t * Math.PI);
    }

    // bottom columns move only while scrolling from About into Projects
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

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateCols);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  updateCols();
})();

// ==========================================================
// SKILLS: the giant title shrinks as the section scrolls in (--sp: 0 to 1)
// ==========================================================
(function () {
  const skillsSec = document.getElementById("skills");
  const panel = skillsSec ? skillsSec.querySelector(".skills-panel-full") : null;
  if (!skillsSec || !panel) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  function clamp01(n) { return Math.max(0, Math.min(1, n)); }

  function updateSkills() {
    const secRect = skillsSec.getBoundingClientRect();
    const vh = window.innerHeight;

    // big when the section enters from below, normal size at mid-screen
    const triggerStart = vh * 0.95;
    const triggerEnd = vh * 0.50;

    const sp = clamp01((triggerStart - secRect.top) / (triggerStart - triggerEnd));
    skillsSec.style.setProperty("--sp", sp.toFixed(3));
  }

  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => { ticking = false; updateSkills(); });
    }
  }, { passive: true });
  window.addEventListener("resize", updateSkills);
  updateSkills();
})();

// ==========================================================
// LOADING SCREEN
// left: columns of streaming symbols, right: the typed name
// ==========================================================
(function () {
  const preloader = document.getElementById("preloader");
  if (!preloader) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.body.classList.remove("preload-locked");
    preloader.remove();
    return;
  }

  const SYMBOLS = [
    "\\", "%", "?", "^", "$", "#", "!", "~", "'", "/", "<", ">",
    "(", ")", "[", "]", "{", "}", "=", "+", "*", "&", "@", ":",
    ";", "\"", ".", "-", "_", "|", "°", "¬", "£", "€", "§", "±",
    "×", "÷", "≠", "≤", "≥", "∞", "Δ", "Σ", "Π", "√", "∫", "∂",
    "∇", "∈", "∉", "⊂", "⊃", "∪", "∩", "∧", "∨", "→", "←", "↑",
    "↓", "↔", "⇒", "⇐", "∴", "∵", "∅"
  ];

  // tonal shades that follow the light / dark theme
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

  const streamCols = preloader.querySelectorAll(".stream-col");
  const CHARS_PER_COL = 36;

  streamCols.forEach((col, colIdx) => {
    const speed = 11 + (colIdx % 3) * 2.2 + Math.random() * 1.5;
    col.style.setProperty("--stream-speed", speed.toFixed(1) + "s");

    // two identical tracks make the loop seamless
    const track1 = document.createElement("div");
    track1.className = "stream-track";
    const track2 = document.createElement("div");
    track2.className = "stream-track";

    for (let i = 0; i < CHARS_PER_COL; i++) {
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

    col.appendChild(track1);
    col.appendChild(track2);
  });

  const typedEl = document.getElementById("preload-typed-name");
  const hairline = document.getElementById("preload-hairline");
  const FULL_NAME = D.preloader.name;
  let charIndex = 0;
  let isDone = false;
  let glitchInterval = null;

  // symbols keep changing for a little energy
  const allChars = preloader.querySelectorAll(".stream-char");
  if (allChars.length > 0) {
    glitchInterval = setInterval(() => {
      if (isDone) return;
      const target = allChars[Math.floor(Math.random() * allChars.length)];
      target.textContent = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      target.style.color = MONO_SHADES[Math.floor(Math.random() * MONO_SHADES.length)];
      target.classList.add("glitch-flash");
      setTimeout(() => target.classList.remove("glitch-flash"), 220);
    }, 130);
  }

  function finishPreloader() {
    if (isDone) return;
    isDone = true;
    if (glitchInterval) clearInterval(glitchInterval);
    if (hairline) hairline.style.width = "100%";

    preloader.classList.add("preloader-hidden");
    document.body.classList.remove("preload-locked");
    document.body.classList.add("preload-revealing");

    setTimeout(() => {
      if (preloader.parentNode) preloader.remove();
      document.body.classList.remove("preload-revealing");
    }, 750);
  }

  function typeLetter() {
    if (isDone) return;
    if (charIndex < FULL_NAME.length) {
      typedEl.textContent += FULL_NAME[charIndex];
      charIndex++;
      if (hairline) hairline.style.width = Math.round((charIndex / FULL_NAME.length) * 100) + "%";
      setTimeout(typeLetter, 50 + Math.random() * 35);
    } else {
      if (hairline) hairline.style.width = "100%";
      setTimeout(finishPreloader, 400);
    }
  }

  setTimeout(typeLetter, 280);

  // skip with the button, Esc or Space
  const skipBtn = document.getElementById("preload-skip");
  if (skipBtn) skipBtn.addEventListener("click", finishPreloader);

  window.addEventListener("keydown", function onKey(e) {
    if (e.key === "Escape" || e.key === " ") {
      finishPreloader();
      window.removeEventListener("keydown", onKey);
    }
  });
})();

// ---------- Footer year ----------
document.getElementById("year").textContent = new Date().getFullYear();

// ==========================================================
// CERTIFICATES
// Builds the endless scrolling row and the popup from
// PORTFOLIO.achievements in data.js. Add a certificate there
// and it appears here automatically.
// ==========================================================
(function () {
  const track = document.getElementById("achv-track");
  if (!track) return;

  const wrap = track.closest(".achv-marquee-wrap");
  const list = document.getElementById("achv-list");
  const data = D.achievements.items || [];
  const SPEED = D.achievements.speed || 60; // px per second

  // no certificates: hide the row
  if (!data.length) {
    if (wrap) wrap.hidden = true;
    return;
  }

  // splits a long title into short lines for the text preview
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

  // text preview, used when a certificate has no picture (or it is missing)
  function certSvg(c) {
    const lines = wrapText(c.title || UI.certLabel, 30, 3);
    const size = lines.length > 2 ? 26 : 30;
    const lead = size * 1.2;
    const startY = 215 - ((lines.length - 1) * lead) / 2;
    const lastY = startY + (lines.length - 1) * lead;
    const tspans = lines
      .map(function (l, k) {
        return '<tspan x="400" dy="' + (k === 0 ? 0 : lead) + '">' + esc(l) + "</tspan>";
      })
      .join("");

    return (
      '<svg viewBox="0 0 800 500" class="cert-svg" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" role="img" aria-label="' + esc(c.title) + '">' +
      '<rect width="800" height="500" fill="#0e121a"/>' +
      '<rect x="24" y="24" width="752" height="452" fill="none" stroke="#d4af37" stroke-width="2" opacity="0.65"/>' +
      '<rect x="32" y="32" width="736" height="436" fill="none" stroke="#d4af37" stroke-width="1" stroke-dasharray="6,4" opacity="0.4"/>' +
      '<path d="M24 64 V24 H64 M776 64 V24 H736 M24 436 V476 H64 M776 436 V476 H736" fill="none" stroke="#d4af37" stroke-width="3"/>' +
      '<text x="400" y="96" text-anchor="middle" fill="#d4af37" font-family="\'DM Mono\', monospace" font-size="13" letter-spacing="5">' + esc(String(UI.certLabel).toUpperCase()) + "</text>" +
      '<text x="400" y="' + startY + '" text-anchor="middle" fill="#ffffff" font-family="\'Bricolage Grotesque\', sans-serif" font-weight="800" font-size="' + size + '">' + tspans + "</text>" +
      '<line x1="260" y1="' + (lastY + 34) + '" x2="540" y2="' + (lastY + 34) + '" stroke="#d4af37" stroke-width="1" opacity="0.5"/>' +
      '<text x="400" y="' + (lastY + 70) + '" text-anchor="middle" fill="#9ba8bc" font-family="\'Instrument Sans\', sans-serif" font-size="16">' + esc(c.issuer || "") + "</text>" +
      '<text x="400" y="430" text-anchor="middle" fill="#d4af37" font-family="\'DM Mono\', monospace" font-size="14" letter-spacing="4">' + esc(c.year || "") + "</text>" +
      "</svg>"
    );
  }

  function cardHTML(c, i) {
    const n = String(i + 1).padStart(2, "0");
    const title = esc(c.title);
    const issuer = esc(c.issuer || "");
    const year = esc(c.year || "");
    const img = c.image
      ? '<img src="' + esc(c.image) + '" alt="' + title + '" class="cert-img" draggable="false">'
      : "";

    return (
      '<article class="achv-card" tabindex="0" role="button" aria-haspopup="dialog" aria-label="' + title + '"' +
      ' data-cert-title="' + title + '" data-cert-issuer="' + issuer + '" data-cert-year="' + year + '">' +
        '<div class="achv-card-inner">' +
          '<div class="achv-card-top">' +
            '<span class="when mono">' + year + "</span>" +
            '<span class="cert-pill mono">' + esc(UI.certLabel) + " § " + n + "</span>" +
          "</div>" +
          '<div class="achv-card-content">' +
            '<div class="cert-icon-seal" aria-hidden="true">' +
              '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="9" r="6"/><path d="M8.5 14.5L7 22l5-3 5 3-1.5-7.5"/></svg>' +
            "</div>" +
            '<h3 class="achv-card-title">' + title + "</h3>" +
            '<p class="achv-card-issuer mono">' + issuer + "</p>" +
          "</div>" +
          '<div class="achv-card-foot mono">' +
            "<span>" + esc(UI.certHover) + "</span>" +
            '<span class="achv-arrow" aria-hidden="true">↗</span>' +
          "</div>" +
        "</div>" +
        '<div class="achv-cert-preview">' +
          '<div class="cert-svg-frame">' + certSvg(c) + "</div>" +
          img +
          '<div class="achv-cert-overlay">' +
            '<span class="cert-overlay-tag mono">' + esc(UI.certLandscape) + (year ? " · " + year : "") + "</span>" +
            '<p class="cert-overlay-name">' + title + "</p>" +
            '<span class="cert-overlay-sub mono">' + (issuer ? issuer + " · " : "") + esc(UI.certExpand) + "</span>" +
          "</div>" +
        "</div>" +
      "</article>"
    );
  }

  // hidden text list for screen readers and search engines
  if (list) {
    list.innerHTML = data
      .map(function (c) {
        return "<li>" + esc(c.title) + (c.issuer ? ", " + esc(c.issuer) : "") + (c.year ? " (" + esc(c.year) + ")" : "") + "</li>";
      })
      .join("");
  }

  // The row has two identical halves and slides left by exactly one half,
  // then starts over. Each half must be wider than the screen, so the set
  // is repeated as many times as needed.
  const oneSet = data.map(cardHTML).join("");
  let reps = 0;

  function buildTrack(newReps) {
    reps = newReps;
    const half = new Array(reps + 1).join(oneSet);
    track.innerHTML =
      '<div class="achv-group">' + half + "</div>" +
      '<div class="achv-group" aria-hidden="true">' + half + "</div>";

    // only the first copy of each certificate can be tabbed to
    track.querySelectorAll(".achv-group").forEach(function (group, g) {
      group.querySelectorAll(".achv-card").forEach(function (card, k) {
        if (g > 0 || k >= data.length) {
          card.setAttribute("tabindex", "-1");
          card.setAttribute("aria-hidden", "true");
        }
      });
    });

    // show each picture when loaded; if missing, keep the text preview
    track.querySelectorAll(".cert-img").forEach(function (img) {
      function ok() { img.style.opacity = "1"; }
      if (img.complete && img.naturalWidth > 0) {
        ok();
      } else {
        img.addEventListener("load", ok, { once: true });
        img.addEventListener("error", function () { img.style.display = "none"; }, { once: true });
      }
    });
  }

  function layout() {
    if (!reps) {
      // measure one set first
      track.innerHTML = '<div class="achv-group">' + oneSet + "</div>";
      const setWidth = track.firstElementChild.getBoundingClientRect().width;
      const needed = setWidth > 0 ? Math.ceil(window.innerWidth / setWidth) : 2;
      buildTrack(Math.min(8, Math.max(1, needed)));
    } else {
      // on resize, rebuild only if more copies are needed
      const setWidth = track.firstElementChild.getBoundingClientRect().width / reps;
      const needed = setWidth > 0 ? Math.ceil(window.innerWidth / setWidth) : reps;
      if (needed > reps) buildTrack(Math.min(8, needed));
    }

    // time to slide one half = its width / speed
    const halfWidth = track.firstElementChild.getBoundingClientRect().width;
    if (halfWidth > 0) {
      track.style.setProperty("--achv-duration", (halfWidth / SPEED).toFixed(1) + "s");
    }
  }

  layout();

  let resizeTimer = null;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(layout, 200);
  });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(layout);
  }

  // ---------- popup (lightbox) ----------
  const lightbox = document.getElementById("cert-lightbox");
  const lightboxBody = document.getElementById("cert-lightbox-body");
  const lightboxTitle = document.getElementById("cert-lightbox-title");
  const lightboxIssuer = document.getElementById("cert-lightbox-issuer");
  const closeBtn = document.getElementById("cert-lightbox-close");
  const backdrop = document.getElementById("cert-lightbox-backdrop");
  let lastFocused = null;

  function openLightbox(card) {
    if (!lightbox || !lightboxBody) return;
    lastFocused = document.activeElement;

    const title = card.dataset.certTitle || UI.certLabel;
    const issuer = card.dataset.certIssuer || "";
    const year = card.dataset.certYear || "";
    const img = card.querySelector(".cert-img");
    const svg = card.querySelector(".cert-svg-frame svg");

    lightboxTitle.textContent = title;
    lightboxIssuer.textContent = (issuer ? issuer + " · " : "") + year;
    lightboxBody.innerHTML = "";

    if (img && img.complete && img.naturalWidth > 0 && img.style.display !== "none") {
      const full = document.createElement("img");
      full.src = img.src;
      full.alt = title;
      lightboxBody.appendChild(full);
    } else if (svg) {
      lightboxBody.appendChild(svg.cloneNode(true));
    }

    lightbox.removeAttribute("hidden");
    void lightbox.offsetWidth; // lets the fade-in play
    lightbox.classList.add("is-open");
    document.body.style.overflow = "hidden";
    if (closeBtn) closeBtn.focus();
  }

  function closeLightbox() {
    if (!lightbox || lightbox.hasAttribute("hidden")) return;
    lightbox.classList.remove("is-open");
    document.body.style.overflow = "";
    setTimeout(function () {
      lightbox.setAttribute("hidden", "");
      lightboxBody.innerHTML = "";
      if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
    }, 280);
  }

  // one listener handles every card
  track.addEventListener("click", function (e) {
    const card = e.target.closest(".achv-card");
    if (card) openLightbox(card);
  });
  track.addEventListener("keydown", function (e) {
    if (e.key !== "Enter" && e.key !== " ") return;
    const card = e.target.closest(".achv-card");
    if (card) {
      e.preventDefault();
      openLightbox(card);
    }
  });

  if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
  if (backdrop) backdrop.addEventListener("click", closeLightbox);
  window.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeLightbox();
  });
})();

// ==========================================================
// SCROLL-TRIGGERED REVEAL
// ==========================================================
(function () {
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
  } else {
    revealEls.forEach((el) => el.classList.add("is-revealed"));
  }
})();

// ==========================================================
// COPY EMAIL
// ==========================================================
(function () {
  const copyBtn = document.getElementById("email-copy-btn");
  const toast = document.getElementById("copy-toast");
  const emailLink = document.querySelector(".contact-email-link");
  if (!copyBtn || !toast || !emailLink) return;

  let toastTimeout = null;

  async function copyEmail() {
    const email = emailLink.textContent.trim();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(email);
      } else {
        const ta = document.createElement("textarea");
        ta.value = email;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
      toast.classList.add("is-visible");
      copyBtn.style.transform = "scale(0.92)";
      setTimeout(() => (copyBtn.style.transform = ""), 150);

      if (toastTimeout) clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => toast.classList.remove("is-visible"), 2200);
    } catch (err) {}
  }

  copyBtn.addEventListener("click", copyEmail);
})();

// ==========================================================
// 3D TILT ON PROJECT IMAGES
// ==========================================================
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || window.innerWidth < 860) return;

  document.querySelectorAll(".project-shot").forEach((shot) => {
    shot.addEventListener("mousemove", (e) => {
      const rect = shot.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const rotX = ((y - cy) / cy) * -4.5;
      const rotY = ((x - cx) / cx) * 4.5;

      shot.style.transform = `perspective(800px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateY(-4px)`;
    });

    shot.addEventListener("mouseleave", () => {
      shot.style.transform = "";
    });
  });
})();

// ==========================================================
// BACK TO TOP
// ==========================================================
(function () {
  const topBtn = document.getElementById("back-to-top-btn");
  if (!topBtn) return;

  topBtn.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();

// ==========================================================
// "COMING SOON" TOAST
// A project link left empty in data.js shows a small message
// ==========================================================
(function () {
  const toast = document.getElementById("incoming-toast");
  const toastText = document.getElementById("incoming-toast-text");
  if (!toast) return;

  let toastTimer = null;

  function showIncomingToast(label) {
    if (toastText) {
      toastText.textContent = label ? label + UI.comingSoonSuffix : UI.comingSoon;
    }
    toast.classList.add("is-visible");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2800);
  }

  document.querySelectorAll(".project .links a[href='#']").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      showIncomingToast(link.textContent.replace("↗", "").trim());
    });
  });
})();