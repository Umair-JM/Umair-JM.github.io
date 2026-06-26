/* Umair Javaid Manj — portfolio interactions (vanilla JS, no dependencies) */

// ===== Theme: dark/light + accent swatches (persisted) =====
(function () {
  const root = document.documentElement;
  const savedMode = localStorage.getItem("mode");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  root.setAttribute("data-theme", savedMode || (prefersDark ? "dark" : "light"));

  const savedAccent = localStorage.getItem("accent");
  if (savedAccent) root.style.setProperty("--accent", savedAccent);

  document.addEventListener("DOMContentLoaded", function () {
    // accent swatches
    const swatches = Array.from(document.querySelectorAll(".swatch"));
    function markActive() {
      const current = getComputedStyle(root).getPropertyValue("--accent").trim();
      swatches.forEach((s) =>
        s.classList.toggle("active", s.dataset.accent.toLowerCase() === current.toLowerCase())
      );
    }
    swatches.forEach((s) => {
      s.style.background = s.dataset.accent;
      s.addEventListener("click", function () {
        root.style.setProperty("--accent", s.dataset.accent);
        localStorage.setItem("accent", s.dataset.accent);
        markActive();
      });
    });
    markActive();

    // dark/light toggle
    const toggle = document.getElementById("modeToggle");
    if (toggle) {
      toggle.addEventListener("click", function () {
        const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        root.setAttribute("data-theme", next);
        localStorage.setItem("mode", next);
        markActive();
      });
    }

    // footer year
    const y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();

    initTimezone();
    initGuestbook();
  });
})();

// ===== Timezone widget: visitor time vs Auckland, with offset + 12/24h =====
function initTimezone() {
  const wrap = document.getElementById("tz");
  if (!wrap) return;
  const HOME_TZ = "Pacific/Auckland";
  let h12 = true;

  const myTimeEl = document.getElementById("tzMy");
  const yourTimeEl = document.getElementById("tzYours");
  const yourZoneEl = document.getElementById("tzYourZone");
  const offsetEl = document.getElementById("tzOffset");
  const fmtBtn = document.getElementById("tzFmt");

  function fmt(tz) {
    return new Intl.DateTimeFormat(navigator.language, {
      hour: "numeric", minute: "2-digit", hour12: h12, timeZone: tz,
    }).format(new Date());
  }
  function zoneShort(tz) {
    const p = new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "short" })
      .formatToParts(new Date()).find((x) => x.type === "timeZoneName");
    return p ? p.value : tz.split("/").pop();
  }
  function minutesIn(tz) {
    const d = new Date(new Date().toLocaleString("en-US", { timeZone: tz }));
    return d.getHours() * 60 + d.getMinutes();
  }
  function offset(home, you) {
    let diff = minutesIn(home) - minutesIn(you);
    if (diff > 720) diff -= 1440;
    if (diff < -720) diff += 1440;
    const ah = Math.floor(Math.abs(diff) / 60), am = Math.abs(diff) % 60;
    if (diff === 0) return "same time as you";
    const span = am ? `${ah}h ${am}m` : `${ah}h`;
    return `${span} ${diff > 0 ? "ahead of you" : "behind you"}`;
  }
  function render() {
    const you = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (myTimeEl) myTimeEl.textContent = fmt(HOME_TZ);
    if (yourTimeEl) yourTimeEl.textContent = fmt(you);
    if (yourZoneEl) yourZoneEl.textContent = zoneShort(you);
    if (offsetEl) offsetEl.textContent = offset(HOME_TZ, you);
    if (fmtBtn) fmtBtn.textContent = h12 ? "12h" : "24h";
  }
  render();
  setInterval(render, 30000);
  if (fmtBtn) fmtBtn.addEventListener("click", function () { h12 = !h12; render(); });
}

// ===== Guestbook: client-side, stored in localStorage =====
function initGuestbook() {
  const form = document.getElementById("gbForm");
  const list = document.getElementById("gbList");
  if (!form || !list) return;
  const KEY = "guestbook";

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { return []; }
  }
  function render() {
    const msgs = load();
    if (!msgs.length) {
      list.innerHTML = '<p class="empty-note">No messages yet — be the first to say hi 👋</p>';
      return;
    }
    list.innerHTML = msgs
      .map(function (m) {
        const who = escapeHtml(m.name), text = escapeHtml(m.text);
        return (
          '<div class="gb-msg"><span class="who">' + who + '</span>' +
          '<span class="when">' + m.when + '</span>' +
          '<p class="text">' + text + "</p></div>"
        );
      })
      .join("");
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const name = form.elements["name"].value.trim();
    const text = form.elements["text"].value.trim();
    if (!name || !text) return;
    const msgs = load();
    msgs.unshift({
      name: name.slice(0, 40),
      text: text.slice(0, 280),
      when: new Date().toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }),
    });
    localStorage.setItem(KEY, JSON.stringify(msgs.slice(0, 50)));
    form.reset();
    render();
  });
  render();
}
