import { useState } from "react";
import { motion } from "framer-motion";
import { statesPaths, stateNames, statesData } from "@/data/statesData";

interface IndiaMapProps {
  onSelectState: (stateId: string) => void;
}

const IndiaMap = ({ onSelectState }: IndiaMapProps) => {
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  const hasDetails = (id: string) => !!statesData[id];

  return (
    <motion.svg
      viewBox="0 0 620 650"
      className="w-full max-w-2xl mx-auto"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Water background */}
      <rect width="620" height="650" fill="hsl(var(--sky-light))" rx="24" />

      {/* Title */}
      <text x="310" y="28" textAnchor="middle" className="fill-foreground text-sm font-bold" fontFamily="var(--font-body)">
        Click a state to explore
      </text>

      {Object.entries(statesPaths).map(([id, { d, labelX, labelY }]) => {
        const isHovered = hoveredState === id;
        const detailed = hasDetails(id);

        return (
          <g
            key={id}
            onMouseEnter={() => setHoveredState(id)}
            onMouseLeave={() => setHoveredState(null)}
            onClick={() => detailed && onSelectState(id)}
            className={detailed ? "cursor-pointer" : "cursor-default"}
          >
            <motion.path
              d={d}
              fill={
                isHovered && detailed
                  ? statesData[id]?.color || "hsl(var(--primary))"
                  : detailed
                  ? "hsl(var(--forest-light))"
                  : "hsl(var(--muted))"
              }
              stroke="hsl(var(--background))"
              strokeWidth={1.5}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{
                opacity: 1,
                scale: isHovered && detailed ? 1.03 : 1,
                filter: isHovered && detailed ? "drop-shadow(0 4px 12px rgba(0,0,0,0.2))" : "none",
              }}
              transition={{ duration: 0.3, delay: Math.random() * 0.5 }}
              style={{ transformOrigin: `${labelX}px ${labelY}px` }}
            />
            <text
              x={labelX}
              y={labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-foreground pointer-events-none"
              fontSize={id === "delhi" || id === "goa" || id === "sikkim" ? 6 : 8}
              fontFamily="var(--font-body)"
              fontWeight={isHovered ? 700 : 500}
            >
              {stateNames[id]}
            </text>
            {isHovered && detailed && (
              <motion.text
                x={labelX}
                y={labelY + 14}
                textAnchor="middle"
                className="fill-accent pointer-events-none"
                fontSize={6}
                fontFamily="var(--font-body)"
                fontWeight={700}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                ✦ Explore
              </motion.text>
            )}
          </g>
        );
      })}
    </motion.svg>
  );
};

export default IndiaMap;
