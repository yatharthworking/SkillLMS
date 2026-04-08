import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, Map, Mountain, BookOpen, Shield, Menu, X, MapPinned } from "lucide-react";
import { Link } from "react-router-dom";

const navLinks = [
  { label: "Trails", icon: Mountain, href: "#trails" },
  { label: "States Explorer", icon: MapPinned, href: "/states", isRoute: true },
  { label: "Journey Map", icon: Map, href: "#map" },
  { label: "Stories", icon: BookOpen, href: "#stories" },
  { label: "Safety", icon: Shield, href: "#safety" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 glass-panel mx-4 mt-4 px-6 py-3 flex items-center justify-between"
    >
      <a href="#" className="flex items-center gap-2">
        <Compass className="w-7 h-7 text-accent animate-sway" />
        <span className="text-xl font-bold font-display tracking-wide text-foreground">
          TravelNtales
        </span>
      </a>

      {/* Desktop */}
      <div className="hidden md:flex items-center gap-8">
        {navLinks.map((link) =>
          link.isRoute ? (
            <Link
              key={link.label}
              to={link.href}
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          ) : (
            <a
              key={link.label}
              href={link.href}
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </a>
          )
        )}
        <a
          href="#plan"
          className="px-5 py-2 rounded-full bg-accent text-accent-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          Plan a Trip
        </a>
      </div>

      {/* Mobile toggle */}
      <button onClick={() => setOpen(!open)} className="md:hidden text-foreground">
        {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 glass-panel p-6 flex flex-col gap-4 md:hidden"
          >
            {navLinks.map((link) =>
              link.isRoute ? (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 text-foreground font-medium"
                >
                  <link.icon className="w-5 h-5 text-primary" />
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 text-foreground font-medium"
                >
                  <link.icon className="w-5 h-5 text-primary" />
                  {link.label}
                </a>
              )
            )}
            <a
              href="#plan"
              onClick={() => setOpen(false)}
              className="px-5 py-2 rounded-full bg-accent text-accent-foreground font-semibold text-sm text-center"
            >
              Plan a Trip
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
