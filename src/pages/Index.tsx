import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import StorySlider from "@/components/StorySlider";
import HeroSlider from "@/components/HeroSlider";
import CategoryGrid from "@/components/CategoryGrid";
import ProductSection from "@/components/ProductSection";
import BrandSlider from "@/components/BrandSlider";
import ReviewsSection from "@/components/ReviewsSection";
import SocialVideoSection from "@/components/SocialVideoSection";
import PromoBar from "@/components/PromoBar";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Header />
      <main>
        <StorySlider />
        <HeroSlider />
        <CategoryGrid />
        <ProductSection title="✨ Featured Products" type="featured" />
        <ProductSection title="🔥 New Arrivals" type="new" />
        <SocialVideoSection />
        <BrandSlider />
        <ReviewsSection />
        <ProductSection title="Best Sellers" type="bestseller" />
        <PromoBar />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
