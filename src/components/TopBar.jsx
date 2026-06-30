import { NavLink, Link } from "react-router-dom";
import { Magnetic } from "../lib/motion.jsx";
import ThemeControls from "./ThemeControls.jsx";

export default function TopBar() {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <Link className="brand" to="/">U<b>J</b>M</Link>
        <ThemeControls />
      </div>
      <nav className="topnav" aria-label="Pages">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/certifications">Certifications</NavLink>
        <NavLink to="/research">Research</NavLink>
        <NavLink to="/playground">Playground</NavLink>
        <NavLink to="/guestbook">Guestbook</NavLink>
      </nav>
      <Magnetic as="a" className="book-btn" href="mailto:umairjavaidmanj@gmail.com?subject=Let%27s%20talk">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
        Book a call
      </Magnetic>
    </header>
  );
}
