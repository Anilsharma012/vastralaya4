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
        
        {/* Founder Note Section */}
        <section className="py-16 bg-accent/5">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center gap-12 bg-white rounded-2xl overflow-hidden shadow-sm border border-border">
              <div className="w-full md:w-1/2 h-[400px] md:h-[500px]">
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop" 
                  alt="Founder" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-full md:w-1/2 p-8 md:p-12 space-y-6">
                <div>
                  <h3 className="text-accent font-bold tracking-wider mb-2 uppercase text-sm">Note by Founder</h3>
                  <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">A Message From Our Heart</h2>
                </div>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    We love you and so when you step into our store, we leave no stones unturned to make you feel special & close to us. We give a humane touch to your shopping experience.
                  </p>
                  <p>
                    We are personally available to help you find your perfect fit. Not only that, we suggest styling tips for your body types & individual expression. Thus, helping you to choose the right styles.
                  </p>
                </div>
                <div className="pt-6">
                  <p className="font-display text-2xl text-accent italic">Chhavi Kumar Chaddha</p>
                  <p className="text-sm tracking-widest uppercase mt-1">- LA GLITS FOUNDER</p>
                </div>
              </div>
            </div>
          </div>
        </section>

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
