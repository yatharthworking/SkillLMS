import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Star, Clock, Sun, ArrowRight, ChevronRight } from "lucide-react";
import type { TrailPlace } from "@/data/trailsData";

interface PlaceCardProps {
  place: TrailPlace;
  index: number;
  accentColor: string;
}

const PlaceCard = ({ place, index, accentColor }: PlaceCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 40, rotate: -1 }}
    animate={{ opacity: 1, y: 0, rotate: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ delay: index * 0.08, duration: 0.5, ease: "easeOut" as const }}
    whileHover={{ y: -6, scale: 1.01 }}
    className="travel-card overflow-hidden group cursor-pointer"
  >
    {/* Top color accent bar */}
    <div className={`h-1.5 ${accentColor}`} />

    <div className="p-5 md:p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
            {place.name}
          </h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-accent" />
            {place.location}
          </div>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-xs font-semibold">
          <Star className="w-3 h-3 text-sunset fill-sunset" />
          {place.rating}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
        {place.description}
      </p>

      {/* Meta */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {place.duration}
        </span>
        <span className="flex items-center gap-1">
          <Sun className="w-3.5 h-3.5" />
          {place.bestTime}
        </span>
      </div>

      {/* Highlights */}
      <div className="space-y-1.5">
        <p className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">Highlights</p>
        <div className="flex flex-wrap gap-1.5">
          {place.highlights.map((h) => (
            <span
              key={h}
              className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground"
            >
              {h}
            </span>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-4 pt-3 border-t border-border">
        <button className="flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
          Explore this trail <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  </motion.div>
);

export default PlaceCard;
