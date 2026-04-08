import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import StoryTrails from "@/components/StoryTrails";
import FeaturedJourneys from "@/components/FeaturedJourneys";
import FeaturesGrid from "@/components/FeaturesGrid";
import Footer from "@/components/Footer";

const Index = () => (
  <div className="min-h-screen">
    <Navbar />
    <HeroSection />
    <StoryTrails />
    <FeaturedJourneys />
    <FeaturesGrid />
    <Footer />
  </div>
);

export default Index;
