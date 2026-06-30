import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Reveal } from "../lib/motion.jsx";
import Footer from "../components/Footer.jsx";

/* A rotating wireframe globe drawn on canvas, themed as a threat map. */
function ThreatGlobe() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const size = 260;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
    const cx = size / 2, cy = size / 2, R = 96;
    let ry = 0, raf;

    function accent() {
      return getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#ff2a44";
    }
    function pt(lat, lon) {
      const x = Math.cos(lat) * Math.cos(lon + ry);
      const y = Math.sin(lat);
      const z = Math.cos(lat) * Math.sin(lon + ry);
      return { sx: cx + x * R, sy: cy - y * R, z };
    }
    function poly(points, col) {
      ctx.beginPath();
      points.forEach((p, i) => {
        const alpha = 0.25 + 0.55 * ((p.z + 1) / 2);
        ctx.globalAlpha = alpha;
        if (i === 0) ctx.moveTo(p.sx, p.sy); else ctx.lineTo(p.sx, p.sy);
      });
      ctx.strokeStyle = col;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    function draw() {
      ctx.clearRect(0, 0, size, size);
      const col = accent();
      for (let i = 1; i < 6; i++) {
        const lat = -Math.PI / 2 + (i * Math.PI) / 6;
        const ring = [];
        for (let a = 0; a <= 48; a++) ring.push(pt(lat, (a / 48) * Math.PI * 2));
        poly(ring, col);
      }
      for (let m = 0; m < 12; m++) {
        const lon = (m / 12) * Math.PI * 2;
        const mer = [];
        for (let a = 0; a <= 48; a++) mer.push(pt(-Math.PI / 2 + (a / 48) * Math.PI, lon));
        poly(mer, col);
      }
      ctx.globalAlpha = 1;
      ry += 0.006;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} style={{ width: 260, height: 260 }} aria-hidden />;
}

function GlitchText({ children }) {
  return <span className="glitch" data-text={children}>{children}</span>;
}

function PacketScan() {
  const xs = [10, 70, 90, 130, 150, 240];
  const ys = [60, 60, 30, 30, 60, 60];
  return (
    <svg viewBox="0 0 260 120" width="260" height="120" fill="none" aria-hidden>
      <path d="M10 60h60l20-30h40l20 30h90" stroke="var(--line)" strokeWidth="2" />
      {[40, 130, 240].map((x, i) => (<circle key={`n${i}`} cx={x} cy={i === 1 ? 30 : 60} r="3" fill="var(--line)" />))}
      {[0, 1, 2].map((i) => (
        <motion.circle
          key={i}
          r="4"
          fill="var(--accent)"
          animate={{ cx: xs, cy: ys }}
          transition={{ duration: 2.6, repeat: Infinity, delay: i * 0.85, ease: "linear" }}
        />
      ))}
    </svg>
  );
}

const demos = [
  { n: "01", title: "Threat globe", note: "A rotating wireframe sphere on canvas, recolored live by the accent picker.", el: <ThreatGlobe /> },
  { n: "02", title: "Packet scan", note: "Packets traced along a network path with framer-motion offset paths.", el: <PacketScan /> },
  { n: "03", title: "Glitch header", note: "An RGB split glitch effect built in CSS.", el: <h3 className="glitch-demo"><GlitchText>ACCESS GRANTED</GlitchText></h3> },
];

export default function Playground() {
  return (
    <>
      <div className="subhead">
        <Reveal as="div" className="label">Experiments</Reveal>
        <Reveal as="h1" delay={0.05}>Playground</Reveal>
        <Reveal as="p" delay={0.1}>Small animation and security themed experiments, all built from scratch with canvas, SVG and framer-motion.</Reveal>
      </div>

      <div className="pg-grid">
        {demos.map((d, i) => (
          <Reveal className="pg-card" key={d.n} delay={Math.min(i * 0.06, 0.2)}>
            <div className="pg-stage">{d.el}</div>
            <div className="pg-meta">
              <span className="pg-n">{d.n}</span>
              <div>
                <h3>{d.title}</h3>
                <p>{d.note}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <Footer />
    </>
  );
}
