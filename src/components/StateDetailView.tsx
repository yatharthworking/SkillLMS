import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MapPin, Mountain, Utensils, Eye, Footprints, Sparkles, Landmark } from "lucide-react";
import { StateData, City, TouristSpot } from "@/data/statesData";

const spotIcons: Record<TouristSpot["type"], React.ElementType> = {
  temple: Landmark,
  waterfall: Mountain,
  market: Sparkles,
  viewpoint: Eye,
  trek: Footprints,
  food: Utensils,
  "hidden-gem": Sparkles,
};

const spotColors: Record<TouristSpot["type"], string> = {
  temple: "bg-sunset/20 text-sunset",
  waterfall: "bg-sky/20 text-sky",
  market: "bg-accent/20 text-accent",
  viewpoint: "bg-forest/20 text-forest",
  trek: "bg-primary/20 text-primary",
  food: "bg-sunset/20 text-sunset",
  "hidden-gem": "bg-accent/20 text-accent",
};

interface StateDetailViewProps {
  state: StateData;
  onBack: () => void;
}

const StateDetailView = ({ state, onBack }: StateDetailViewProps) => {
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      {/* Header */}
      <motion.div
        className="flex items-center gap-4 mb-8"
        initial={{ x: -30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <button
          onClick={onBack}
          className="p-2 rounded-full glass-panel hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">{state.name}</h2>
          <p className="text-muted-foreground font-display text-xl">{state.tagline}</p>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* State Map with City Pins */}
        <motion.div
          className="glass-panel p-6 relative aspect-square"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <rect width="100" height="100" rx="8" fill="hsl(var(--forest-light))" opacity={0.5} />
            
            {/* Decorative contour lines */}
            {[20, 40, 60, 80].map((y) => (
              <path
                key={y}
                d={`M10,${y} Q30,${y - 8} 50,${y} Q70,${y + 8} 90,${y}`}
                stroke="hsl(var(--forest) / 0.1)"
                strokeWidth="0.5"
                fill="none"
              />
            ))}

            {/* City pins */}
            {state.cities.map((city, i) => {
              const isSelected = selectedCity?.name === city.name;
              return (
                <g
                  key={city.name}
                  onClick={() => setSelectedCity(isSelected ? null : city)}
                  className="cursor-pointer"
                >
                  <motion.g
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 + i * 0.15, type: "spring", damping: 10 }}
                  >
                    {/* Pin shadow */}
                    <ellipse
                      cx={city.x}
                      cy={city.y + 3}
                      rx={isSelected ? 4 : 2.5}
                      ry={1}
                      fill="rgba(0,0,0,0.15)"
                    />
                    {/* Pin body */}
                    <motion.circle
                      cx={city.x}
                      cy={city.y}
                      r={isSelected ? 4 : 2.5}
                      fill={isSelected ? state.color : "hsl(var(--primary))"}
                      stroke="hsl(var(--background))"
                      strokeWidth={1}
                      animate={{ scale: isSelected ? [1, 1.2, 1] : 1 }}
                      transition={{ duration: 0.5, repeat: isSelected ? Infinity : 0, repeatDelay: 1 }}
                    />
                    {/* City label */}
                    <text
                      x={city.x}
                      y={city.y - 5}
                      textAnchor="middle"
                      fontSize={isSelected ? 4 : 3}
                      fontWeight={isSelected ? 700 : 500}
                      fill="currentColor"
                      className="fill-foreground"
                      fontFamily="var(--font-body)"
                    >
                      {city.name}
                    </text>
                  </motion.g>
                </g>
              );
            })}
          </svg>
        </motion.div>

        {/* City Details Panel */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {selectedCity ? (
              <motion.div
                key={selectedCity.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-accent" />
                  <h3 className="text-2xl font-bold text-foreground">{selectedCity.name}</h3>
                </div>
                <div className="space-y-3">
                  {selectedCity.spots.map((spot, i) => {
                    const Icon = spotIcons[spot.type];
                    return (
                      <motion.div
                        key={spot.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-panel p-4 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${spotColors[spot.type]}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground">{spot.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{spot.description}</p>
                            <span className="text-xs font-medium text-accent mt-1 inline-block capitalize">
                              {spot.type.replace("-", " ")}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-panel p-8 text-center"
              >
                <MapPin className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-lg text-muted-foreground">
                  Click a city pin on the map to explore tourist spots
                </p>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {state.cities.map((city) => (
                    <button
                      key={city.name}
                      onClick={() => setSelectedCity(city)}
                      className="px-3 py-1.5 text-sm rounded-full glass-panel hover:bg-accent hover:text-accent-foreground transition-colors font-medium"
                    >
                      {city.name}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default StateDetailView;
