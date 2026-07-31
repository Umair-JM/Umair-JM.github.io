import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import TopBar from "./components/TopBar.jsx";
import Home from "./pages/Home.jsx";
import Certifications from "./pages/Certifications.jsx";
import Research from "./pages/Research.jsx";
import Playground from "./pages/Playground.jsx";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <div className="bg-fx" aria-hidden />
      <a className="skip-link" href="#main">Skip to content</a>
      <ScrollToTop />
      <main className="page" id="main">
        <TopBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/certifications" element={<Certifications />} />
          <Route path="/research" element={<Research />} />
          <Route path="/playground" element={<Playground />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
    </>
  );
}
