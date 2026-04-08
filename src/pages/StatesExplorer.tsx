import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Compass, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import IndiaMap from "@/components/IndiaMap";
import StateDetailView from "@/components/StateDetailView";
import { statesData } from "@/data/statesData";
import Footer from "@/components/Footer";

const StatesExplorer = () => {
  const [selectedStateId, setSelectedStateId] = useState<string | null>(null);
  const selectedState = selectedStateId ? statesData[selectedStateId] : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-28 pb-16 px-4 max-w-6xl mx-auto">
        {/* Hero header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-4">
            <Compass className="w-4 h-4 text-accent animate-sway" />
            <span className="text-sm font-medium text-muted-foreground">Interactive Explorer</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-4">
            Explore India{" "}
            <span className="text-gradient-sunset font-display text-5xl md:text-6xl lg:text-7xl">
              State by State
            </span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Click on any highlighted state to discover cities, hidden gems, temples, treks and more
          </p>
        </motion.div>

        {/* Flying airplane decoration */}
        <motion.div
          className="absolute top-40 right-[10%] text-primary/30 pointer-events-none hidden lg:block"
          animate={{ x: [0, 40, 0], y: [0, -15, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-4xl">✈</span>
        </motion.div>

        <AnimatePresence mode="wait">
          {selectedState ? (
            <StateDetailView
              key={selectedState.id}
              state={selectedState}
              onBack={() => setSelectedStateId(null)}
            />
          ) : (
            <motion.div
              key="map"
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <IndiaMap onSelectState={setSelectedStateId} />

              {/* Legend */}
              <motion.div
                className="flex flex-wrap justify-center gap-4 mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-3 h-3 rounded-full bg-forest-light border border-border" />
                  <span>Explorable States</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-3 h-3 rounded-full bg-muted border border-border" />
                  <span>Coming Soon</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-3 h-3 text-accent" />
                  <span>6 States • 25+ Cities • 75+ Spots</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
      <Footer />
    </div>
  );
};

export default StatesExplorer;
