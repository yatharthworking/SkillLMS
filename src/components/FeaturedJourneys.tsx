import { motion } from "framer-motion";
import { MapPin, Heart, MessageCircle } from "lucide-react";
import kedarnathImg from "@/assets/journey-kedarnath.jpg";
import waterfallImg from "@/assets/journey-waterfall.jpg";
import foodImg from "@/assets/journey-food.jpg";

const journeys = [
  {
    image: kedarnathImg,
    title: "Kedarnath: A Spiritual Ascent",
    author: "Priya M.",
    location: "Uttarakhand, India",
    excerpt: "The 16km trek through mist-covered valleys changed how I see the mountains forever.",
    likes: 284,
    comments: 42,
  },
  {
    image: waterfallImg,
    title: "Chasing Waterfalls in the Western Ghats",
    author: "Arjun K.",
    location: "Karnataka, India",
    excerpt: "Hidden cascades, leeches, and the purest swimming holes you'll ever find.",
    likes: 198,
    comments: 31,
  },
  {
    image: foodImg,
    title: "Street Food Trail: Old Delhi to Lucknow",
    author: "Sara T.",
    location: "North India",
    excerpt: "From parathas at Paranthe Wali Gali to Lucknowi kebabs — a feast on wheels.",
    likes: 342,
    comments: 67,
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 50, rotate: -2 },
  show: { opacity: 1, y: 0, rotate: 0, transition: { duration: 0.7, ease: "easeOut" as const } },
};

const FeaturedJourneys = () => (
  <section className="py-24 px-6 bg-gradient-sunset" id="stories">
    <div className="max-w-6xl mx-auto">
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <span className="font-display text-3xl text-accent">From fellow travelers</span>
        <h2 className="text-3xl md:text-5xl font-bold mt-2">Featured Journeys</h2>
        <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
          Real stories from real travelers. Every postcard hides an adventure.
        </p>
      </motion.div>

      <motion.div
        className="grid md:grid-cols-3 gap-8"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        {journeys.map((j) => (
          <motion.article
            key={j.title}
            variants={item}
            whileHover={{ y: -8, rotate: 0 }}
            className="travel-card cursor-pointer group"
          >
            <div className="relative overflow-hidden h-56">
              <img
                src={j.image}
                alt={j.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-background/80 backdrop-blur-sm text-xs font-medium">
                <MapPin className="w-3 h-3 text-accent" />
                {j.location}
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">
                {j.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">{j.excerpt}</p>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{j.author}</span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5" /> {j.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5" /> {j.comments}
                  </span>
                </div>
              </div>
            </div>
          </motion.article>
        ))}
      </motion.div>
    </div>
  </section>
);

export default FeaturedJourneys;
