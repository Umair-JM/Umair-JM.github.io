import { useMemo, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/* ---------------------------------------------------------------------------
   Small reusable animation primitives built on framer-motion.
   Inspired by common animated-react-collection patterns, rewritten here so the
   site has no external component dependency beyond framer-motion itself.
   All of them respect prefers-reduced-motion through framer's own handling
   and the CSS guard in index.css.
--------------------------------------------------------------------------- */

const easeOut = [0.22, 1, 0.36, 1];

// Fade + rise when the element scrolls into view.
export function Reveal({ children, delay = 0, y = 18, as = "div", className, ...rest }) {
  const MotionTag = motion[as] || motion.div;
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: easeOut }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}

// Container that staggers its direct <StaggerItem> children.
export function Stagger({ children, className, gap = 0.07, as = "div", ...rest }) {
  const MotionTag = motion[as] || motion.div;
  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-50px" }}
      variants={{ show: { transition: { staggerChildren: gap } } }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}

export function StaggerItem({ children, className, y = 14, as = "div", ...rest }) {
  const MotionTag = motion[as] || motion.div;
  return (
    <MotionTag
      className={className}
      variants={{
        hidden: { opacity: 0, y },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } },
      }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}

// Card that tracks the cursor with a soft radial spotlight glow.
export function SpotlightCard({ children, className = "", ...rest }) {
  const ref = useRef(null);
  const mx = useMotionValue(-200);
  const my = useMotionValue(-200);

  function onMove(e) {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
  }
  function onLeave() {
    mx.set(-200);
    my.set(-200);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`spotlight-card ${className}`}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      {...rest}
    >
      <motion.span
        aria-hidden
        className="spotlight-glow"
        style={{
          background: useTransform(
            [mx, my],
            ([x, y]) =>
              `radial-gradient(180px circle at ${x}px ${y}px, color-mix(in srgb, var(--accent) 22%, transparent), transparent 70%)`
          ),
        }}
      />
      <div className="spotlight-body">{children}</div>
    </motion.div>
  );
}

// Link/button that gently leans toward the cursor (magnetic effect).
export function Magnetic({ children, strength = 0.3, className, as = "a", ...rest }) {
  const ref = useRef(null);
  const x = useSpring(0, { stiffness: 250, damping: 18 });
  const y = useSpring(0, { stiffness: 250, damping: 18 });
  // Support both string tags ("a", "button") and components (e.g. router Link).
  const MotionTag = useMemo(
    () => (typeof as === "string" ? motion[as] || motion.a : motion.create(as)),
    [as]
  );

  function onMove(e) {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  }
  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <MotionTag ref={ref} onMouseMove={onMove} onMouseLeave={reset} style={{ x, y }} className={className} {...rest}>
      {children}
    </MotionTag>
  );
}
