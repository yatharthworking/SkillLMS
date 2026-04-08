import { motion } from "framer-motion";
import { Search, MapPin } from "lucide-react";
import FloatingClouds from "./FloatingClouds";
import MountainScene from "./MountainScene";
import AirplanePath from "./AirplanePath";

const HeroSection = () => (
  <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-sky">
    <FloatingClouds />
    <AirplanePath />
    <MountainScene />

    {/* Content */}
    <div className="relative z-30 text-center px-6 max-w-4xl mx-auto">
      <motion.p
        className="text-lg md:text-xl font-display text-accent mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        ✦ TravelNtales ✦
      </motion.p>

      <motion.h1
        className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3, duration: 0.8 }}
      >
        Don't just reach the destination.{" "}
        <span className="text-gradient-sunset font-display text-5xl md:text-7xl lg:text-8xl">
          Experience the journey.
        </span>
      </motion.h1>

      <motion.p
        className="text-muted-foreground text-lg md:text-xl mb-10 max-w-2xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.8 }}
      >
        Discover hidden trails, share travel stories, and explore the world through
        immersive journey maps.
      </motion.p>

      {/* Search bar */}
      <motion.div
        className="glass-panel flex items-center gap-3 px-5 py-3 max-w-xl mx-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2.2, duration: 0.6 }}
      >
        <MapPin className="w-5 h-5 text-accent shrink-0" />
        <input
          type="text"
          placeholder="Where does your journey begin?"
          className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-sm"
        />
        <button className="p-2 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
          <Search className="w-4 h-4" />
        </button>
      </motion.div>
    </div>

    {/* Birds */}
    <div className="absolute top-[15%] right-[10%] z-20 pointer-events-none">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="inline-block text-foreground/20 text-lg mx-1"
          animate={{ y: [0, -8, 0], x: [0, 4, 0] }}
          transition={{ duration: 2 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
        >
          ⌒
        </motion.span>
      ))}
    </div>
  </section>
);

export default HeroSection;
