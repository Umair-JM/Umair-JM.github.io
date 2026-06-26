// ===== Theme toggle (persisted + respects OS preference) =====
(function () {
  const root = document.documentElement;
  const stored = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initial = stored || (prefersDark ? "dark" : "light");
  root.setAttribute("data-theme", initial);

  const btn = document.getElementById("themeToggle");
  if (btn) {
    btn.addEventListener("click", function () {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
    });
  }
})();

// ===== Live local time (Auckland) =====
(function () {
  const el = document.getElementById("localTime");
  if (!el) return;
  function tick() {
    try {
      const t = new Date().toLocaleTimeString("en-NZ", {
        timeZone: "Pacific/Auckland",
        hour: "2-digit",
        minute: "2-digit",
      });
      el.textContent = t + " Auckland";
    } catch (e) {
      el.textContent = "Auckland";
    }
  }
  tick();
  setInterval(tick, 30000);
})();

// ===== Footer year =====
(function () {
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();

// ===== Lucide icons =====
(function () {
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }
})();

// ===== Typed.js — rotating role line in hero =====
(function () {
  const el = document.getElementById("typed");
  if (!el) return;
  if (typeof window.Typed === "undefined") {
    el.textContent = "Cybersecurity Researcher";
    return;
  }
  new window.Typed("#typed", {
    strings: [
      "Cybersecurity Researcher",
      "Penetration Testing &amp; Threat Intel",
      "Educator &amp; Course Designer",
      "PhD Candidate, Health AI",
    ],
    typeSpeed: 55,
    backSpeed: 28,
    backDelay: 1600,
    startDelay: 300,
    loop: true,
    smartBackspace: true,
  });
})();

// ===== AOS — scroll reveal (attributes added programmatically) =====
(function () {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || typeof window.AOS === "undefined") return;
  document.querySelectorAll(".section-head").forEach(function (n) {
    n.setAttribute("data-aos", "fade-up");
  });
  document.querySelectorAll(".card, .cert").forEach(function (n, i) {
    n.setAttribute("data-aos", "fade-up");
    n.setAttribute("data-aos-delay", String((i % 4) * 60));
  });
  window.AOS.init({ duration: 600, easing: "ease-out-cubic", once: true, offset: 40 });
})();

// ===== tsParticles — subtle security-network background in hero =====
(function () {
  const host = document.getElementById("particles");
  if (!host || typeof window.tsParticles === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  function accent() {
    return (
      getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() ||
      "#0b6e5f"
    );
  }
  window.tsParticles.load({
    id: "particles",
    options: {
      fpsLimit: 60,
      detectRetina: true,
      background: { color: "transparent" },
      particles: {
        number: { value: 42, density: { enable: true, area: 800 } },
        color: { value: accent() },
        links: { enable: true, color: accent(), distance: 130, opacity: 0.35, width: 1 },
        move: { enable: true, speed: 0.7, outModes: { default: "bounce" } },
        opacity: { value: 0.5 },
        size: { value: { min: 1, max: 2.5 } },
      },
      interactivity: {
        events: { onHover: { enable: true, mode: "grab" }, resize: true },
        modes: { grab: { distance: 150, links: { opacity: 0.5 } } },
      },
    },
  });
})();

// ===== Active nav highlight on scroll =====
(function () {
  const links = Array.from(document.querySelectorAll(".topnav a"));
  const map = new Map();
  links.forEach((l) => {
    const id = l.getAttribute("href").slice(1);
    const sec = document.getElementById(id);
    if (sec) map.set(sec, l);
  });
  if (!("IntersectionObserver" in window) || map.size === 0) return;
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          links.forEach((l) => (l.style.color = ""));
          const l = map.get(e.target);
          if (l) l.style.color = "var(--accent)";
        }
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );
  map.forEach((_, sec) => obs.observe(sec));
})();
