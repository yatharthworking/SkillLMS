import { motion } from "framer-motion";
import { Compass, MapPin, Shield, BookOpen, Camera, Navigation } from "lucide-react";

const features = [
  { icon: Navigation, title: "Interactive Journey Maps", desc: "Plot routes with hidden gems, food stops & scenic viewpoints." },
  { icon: BookOpen, title: "Travel Stories", desc: "Share postcards, tips, and memories from your adventures." },
  { icon: Camera, title: "Memory Maps", desc: "Upload photos and auto-generate a visual journey timeline." },
  { icon: Shield, title: "Safety Layer", desc: "See hospitals, police stations & safe hotels along your route." },
  { icon: MapPin, title: "Trip Packages", desc: "Animated route timelines with gear, weather & vehicle suggestions." },
  { icon: Compass, title: "Story Trails", desc: "Curated themed journeys: spiritual, food, adventure & more." },
];

const FeaturesGrid = () => (
  <section className="py-24 px-6" id="map">
    <div className="max-w-6xl mx-auto">
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <span className="font-display text-3xl text-forest">What awaits you</span>
        <h2 className="text-3xl md:text-5xl font-bold mt-2">Your Travel Toolkit</h2>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            className="glass-panel p-6 group cursor-pointer"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.6 }}
            whileHover={{ y: -6 }}
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <f.icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-bold text-lg mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesGrid;
