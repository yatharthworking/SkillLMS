import { motion } from "framer-motion";

const MountainScene = () => (
  <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-0">
    {/* Back mountains */}
    <svg
      viewBox="0 0 1440 400"
      className="w-full h-auto"
      preserveAspectRatio="none"
    >
      {/* Far mountains */}
      <motion.path
        d="M0 400 L0 280 Q120 180 240 250 Q360 150 480 220 Q600 120 720 200 Q840 100 960 180 Q1080 80 1200 170 Q1320 120 1440 200 L1440 400 Z"
        fill="hsl(var(--mountain) / 0.2)"
        initial={{ y: 60 }}
        animate={{ y: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />
      {/* Mid mountains */}
      <motion.path
        d="M0 400 L0 310 Q180 220 360 290 Q480 200 600 270 Q720 180 900 260 Q1020 200 1140 250 Q1260 190 1440 260 L1440 400 Z"
        fill="hsl(var(--forest) / 0.25)"
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        transition={{ duration: 1.8, delay: 0.2, ease: "easeOut" }}
      />
      {/* Near mountains */}
      <motion.path
        d="M0 400 L0 340 Q200 280 400 330 Q550 270 700 320 Q850 260 1000 310 Q1150 270 1300 300 Q1380 280 1440 310 L1440 400 Z"
        fill="hsl(var(--forest) / 0.35)"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ duration: 2, delay: 0.4, ease: "easeOut" }}
      />
      {/* Ground */}
      <motion.rect
        x="0" y="370" width="1440" height="30"
        fill="hsl(var(--sand))"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
      />
    </svg>
  </div>
);

export default MountainScene;
