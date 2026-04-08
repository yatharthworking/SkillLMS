import { motion } from "framer-motion";
import { Plane } from "lucide-react";

const AirplanePath = () => (
  <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
    {/* Dotted path */}
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 800" fill="none">
      <motion.path
        d="M-50 600 Q200 200 400 350 Q600 500 720 250 Q840 50 1100 200 Q1300 320 1500 100"
        stroke="hsl(var(--sky) / 0.3)"
        strokeWidth="2"
        strokeDasharray="8 8"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 3, ease: "easeInOut" }}
      />
    </svg>

    {/* Airplane */}
    <motion.div
      className="absolute text-primary"
      initial={{ x: "-5%", y: "75%", rotate: -30 }}
      animate={{
        x: ["−5%", "25%", "50%", "75%", "105%"],
        y: ["75%", "25%", "45%", "15%", "5%"],
        rotate: [-30, -15, -25, -10, -20],
      }}
      transition={{ duration: 4, ease: "easeInOut" }}
    >
      <Plane className="w-8 h-8 fill-primary" />
    </motion.div>
  </div>
);

export default AirplanePath;
