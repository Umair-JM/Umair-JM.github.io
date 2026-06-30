import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* Thin accent line under the top bar that scrubs with page scroll. Pure GSAP
   ScrollTrigger, so it is genuinely part of "his" engine stack rather than a
   framer-motion reimplementation. Inherits --accent, so it recolours with the
   swatch picker for free. */
export default function ScrollProgress() {
  const barRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bar = barRef.current;
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        gsap.to(bar, { scaleX: self.progress, duration: 0.15, ease: "none", overwrite: true });
      },
    });
    return () => st.kill();
  }, []);

  return <div ref={barRef} className="scroll-progress" aria-hidden />;
}
