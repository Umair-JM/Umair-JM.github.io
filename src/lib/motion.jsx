import { motion } from "framer-motion";

/* ---------------------------------------------------------------------------
   Small reusable animation primitives built on framer-motion.
   Once-only scroll fade-ins plus a card with a gentle hover lift. They respect
   prefers-reduced-motion through framer's own handling and the CSS guard in
   index.css.
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

// Card with a gentle lift on hover. Keeps the spotlight-card class names so
// existing CSS and call sites stay unchanged.
export function SpotlightCard({ children, className = "", ...rest }) {
  return (
    <motion.div
      className={`spotlight-card ${className}`}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      {...rest}
    >
      <div className="spotlight-body">{children}</div>
    </motion.div>
  );
}
