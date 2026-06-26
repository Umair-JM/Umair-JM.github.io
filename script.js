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
      el.textContent = "🕑 " + t + " Auckland";
    } catch (e) {
      el.textContent = "🕑 Auckland";
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
