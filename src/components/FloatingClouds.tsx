import { motion } from "framer-motion";

const clouds = [
  { width: 120, top: "10%", delay: 0, duration: 25, opacity: 0.5 },
  { width: 180, top: "18%", delay: 5, duration: 35, opacity: 0.35 },
  { width: 100, top: "8%", delay: 12, duration: 28, opacity: 0.4 },
  { width: 150, top: "22%", delay: 18, duration: 32, opacity: 0.3 },
];

const Cloud = ({ width, opacity }: { width: number; opacity: number }) => (
  <svg width={width} height={width * 0.45} viewBox="0 0 200 90" fill="none" style={{ opacity }}>
    <ellipse cx="70" cy="60" rx="70" ry="30" fill="hsl(var(--background))" />
    <ellipse cx="110" cy="45" rx="50" ry="35" fill="hsl(var(--background))" />
    <ellipse cx="150" cy="60" rx="45" ry="28" fill="hsl(var(--background))" />
    <ellipse cx="90" cy="35" rx="40" ry="30" fill="hsl(var(--background))" />
  </svg>
);

const FloatingClouds = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
    {clouds.map((c, i) => (
      <motion.div
        key={i}
        className="absolute"
        style={{ top: c.top }}
        initial={{ x: "-20%" }}
        animate={{ x: "110vw" }}
        transition={{
          duration: c.duration,
          repeat: Infinity,
          delay: c.delay,
          ease: "linear",
        }}
      >
        <Cloud width={c.width} opacity={c.opacity} />
      </motion.div>
    ))}
  </div>
);

export default FloatingClouds;
