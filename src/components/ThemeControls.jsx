import { useEffect, useState } from "react";

/* Accent swatches plus a light and dark toggle, persisted in localStorage and
   applied to the document root through CSS custom properties. */
const ACCENTS = ["#ff2a44", "#19d36b", "#2ad4ff", "#b06bff", "#ffb02a"];

export default function ThemeControls() {
  const [accent, setAccent] = useState(() => localStorage.getItem("accent") || ACCENTS[0]);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", accent);
    localStorage.setItem("accent", accent);
  }, [accent]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <div className="theme-controls">
      <div className="swatches" role="group" aria-label="Accent colour">
        {ACCENTS.map((c) => (
          <button
            key={c}
            className={`swatch ${c === accent ? "active" : ""}`}
            style={{ background: c }}
            onClick={() => setAccent(c)}
            aria-label={`Set accent ${c}`}
          />
        ))}
      </div>
      <button className="icon-btn" onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))} aria-label="Toggle light and dark">
        {theme === "dark" ? (
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4" /></svg>
        ) : (
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
        )}
      </button>
    </div>
  );
}
