import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trailsData } from "@/data/trailsData";
import PlaceCard from "./PlaceCard";

const accentBarColors: Record<string, string> = {
  spiritual: "bg-sunset",
  waterfall: "bg-primary",
  food: "bg-accent",
  adventure: "bg-forest",
  hidden: "bg-sunset",
  historic: "bg-mountain",
};

const StoryTrails = () => {
  const [activeTrail, setActiveTrail] = useState<string | null>(null);

  const activeData = trailsData.find((t) => t.id === activeTrail);

  return (
    <section id="trails" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <span className="font-display text-3xl text-accent">Choose your trail</span>
          <h2 className="text-3xl md:text-5xl font-bold mt-2">Story Trails</h2>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
            Every journey tells a story. Pick a trail and let the adventure unfold.
          </p>
        </motion.div>

        {/* Trail category buttons */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
        >
          {trailsData.map((t) => {
            const isActive = activeTrail === t.id;
            return (
              <motion.button
                key={t.id}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
                }}
                whileHover={{ scale: 1.03, y: -3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTrail(isActive ? null : t.id)}
                className={`relative p-5 text-left rounded-2xl cursor-pointer transition-all duration-300 border-2 group ${
                  isActive
                    ? "border-primary bg-primary/5 shadow-lg"
                    : "border-transparent bg-card shadow-md hover:shadow-lg"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTrailIndicator"
                    className="absolute inset-0 rounded-2xl border-2 border-primary"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <t.icon
                  className={`w-7 h-7 mb-3 transition-transform duration-300 ${t.color} ${
                    isActive ? "scale-110" : "group-hover:scale-110"
                  }`}
                />
                <h3 className="font-bold text-base mb-0.5">{t.label}</h3>
                <p className="text-xs text-muted-foreground">{t.description}</p>
                <div className="mt-2 text-xs font-medium text-primary flex items-center gap-1">
                  {isActive ? "Hide places" : `${t.places.length} places`}
                  <motion.span
                    animate={{ rotate: isActive ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    ›
                  </motion.span>
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Places for active trail */}
        <AnimatePresence mode="wait">
          {activeData && (
            <motion.div
              key={activeData.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" as const }}
              className="overflow-hidden"
            >
              <div className="pt-4 pb-2">
                <motion.div
                  className="flex items-center gap-3 mb-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <div className={`w-10 h-10 rounded-xl ${activeData.bgColor} flex items-center justify-center`}>
                    <activeData.icon className={`w-5 h-5 ${activeData.color}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">{activeData.label}</h3>
                    <p className="text-sm text-muted-foreground">
                      {activeData.places.length} destinations across India
                    </p>
                  </div>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {activeData.places.map((place, i) => (
                    <PlaceCard
                      key={place.name}
                      place={place}
                      index={i}
                      accentColor={accentBarColors[activeData.id] || "bg-primary"}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default StoryTrails;
