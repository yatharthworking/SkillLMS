import { motion } from "framer-motion";
import { Compass, Heart } from "lucide-react";

const Footer = () => (
  <footer className="relative py-16 px-6 overflow-hidden">
    {/* Mountain silhouette */}
    <svg className="absolute bottom-0 left-0 right-0 w-full" viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none">
      <path d="M0 120 L0 80 Q200 40 400 70 Q600 20 800 60 Q1000 30 1200 55 Q1350 40 1440 50 L1440 120 Z" fill="hsl(var(--forest) / 0.1)" />
    </svg>

    <div className="max-w-6xl mx-auto relative z-10">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <Compass className="w-6 h-6 text-accent animate-sway" />
          <span className="text-2xl font-bold font-display">TravelNtales</span>
        </div>
        <p className="text-muted-foreground max-w-md mx-auto mb-8">
          Don't just reach the destination. Experience the journey.
        </p>
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground mb-8">
          <a href="#trails" className="hover:text-primary transition-colors">Trails</a>
          <a href="#stories" className="hover:text-primary transition-colors">Stories</a>
          <a href="#map" className="hover:text-primary transition-colors">Features</a>
          <a href="#safety" className="hover:text-primary transition-colors">Safety</a>
        </div>
        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
          Made with <Heart className="w-3 h-3 text-accent" /> for travelers everywhere
        </p>
      </motion.div>
    </div>
  </footer>
);

export default Footer;
