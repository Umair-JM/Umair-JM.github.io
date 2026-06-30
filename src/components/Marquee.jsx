import { motion } from "framer-motion";

/* Seamless infinite marquee. The row is duplicated and translated by exactly
   half its width, so the loop has no visible seam. Hovering pauses it. */
export default function Marquee({ items, reverse = false, speed = 28 }) {
  const row = [...items, ...items];
  return (
    <div className="marquee" aria-hidden>
      <motion.div
        className="marquee-track"
        animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
      >
        {row.map((it, i) => (
          <span className="marquee-chip" key={i}>{it}</span>
        ))}
      </motion.div>
    </div>
  );
}
