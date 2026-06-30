import { useEffect, useRef } from "react";

/* From-scratch animated "network / threat graph" rendered on a canvas.
   Nodes drift, link to nearby nodes, and react to the cursor. It reads the live
   --accent CSS variable, so the swatch picker and the light/dark toggle restyle
   it for free. Respects prefers-reduced-motion by drawing a single static frame.
   No external dependency, authored here rather than pulled from a Rive asset. */

function readAccent() {
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
  return raw || "#ff2a44";
}

// "#rrggbb" -> "r, g, b" so we can build rgba() strings with varying alpha.
function toRgb(hex) {
  const h = hex.replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const int = parseInt(n, 16);
  return `${(int >> 16) & 255}, ${(int >> 8) & 255}, ${int & 255}`;
}

export default function HeroCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let rgb = toRgb(readAccent());
    let raf = 0;
    let w = 0, h = 0, dpr = 1;
    const nodes = [];
    const mouse = { x: -999, y: -999 };

    function resize() {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function seed() {
      nodes.length = 0;
      const count = Math.max(18, Math.min(46, Math.round((w * h) / 5200)));
      for (let i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.22,
          r: Math.random() * 1.6 + 0.9,
          pulse: Math.random() * Math.PI * 2,
        });
      }
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);
      const linkDist = Math.min(w, h) * 0.42;

      for (const n of nodes) {
        if (!reduced) {
          n.x += n.vx; n.y += n.vy;
          if (n.x < 0 || n.x > w) n.vx *= -1;
          if (n.y < 0 || n.y > h) n.vy *= -1;
          // gentle pull toward the cursor when it is close
          const dx = mouse.x - n.x, dy = mouse.y - n.y;
          const d = Math.hypot(dx, dy);
          if (d < 120 && d > 0.01) {
            n.x += (dx / d) * 0.4;
            n.y += (dy / d) * 0.4;
          }
          n.pulse += 0.03;
        }
      }

      // links
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < linkDist) {
            const near = Math.min(
              dist(a, mouse) < 130 ? 1 : 0,
              dist(b, mouse) < 130 ? 1 : 0
            );
            const base = (1 - d / linkDist) * 0.45;
            const alpha = near ? Math.min(0.9, base + 0.4) : base;
            ctx.strokeStyle = `rgba(${rgb}, ${alpha})`;
            ctx.lineWidth = near ? 1.1 : 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // nodes
      for (const n of nodes) {
        const glow = (Math.sin(n.pulse) + 1) * 0.5;
        const hot = dist(n, mouse) < 130;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + (hot ? 1.3 : 0), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb}, ${hot ? 1 : 0.5 + glow * 0.4})`;
        if (hot) { ctx.shadowColor = `rgba(${rgb}, 0.9)`; ctx.shadowBlur = 10; }
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      if (!reduced) raf = requestAnimationFrame(frame);
    }

    function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

    function onMove(e) {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    }
    function onLeave() { mouse.x = -999; mouse.y = -999; }

    function init() { resize(); seed(); frame(); }

    init();
    window.addEventListener("resize", init);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);

    // Re-read accent when the swatch or theme changes (style/attr on <html>).
    const obs = new MutationObserver(() => { rgb = toRgb(readAccent()); });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["style", "data-theme"] });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", init);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      obs.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-canvas" aria-hidden />;
}
