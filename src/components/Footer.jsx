import { profile } from "../data.js";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-meta">
        <span>© {new Date().getFullYear()} {profile.name}</span>
        <span>
          Built with React, Vite &amp; framer-motion ·{" "}
          <a href="https://github.com/Umair-JM/Umair-JM.github.io" target="_blank" rel="noopener">source</a>
        </span>
      </div>
    </footer>
  );
}
