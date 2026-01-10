import { useEffect, useState } from "react";
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
import { api } from "@/lib/api";

const Index = () => {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get<{ settings: any }>("/public/settings");
        setSettings(response.settings);
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };
    fetchSettings();
  }, []);

  const founderNote = settings?.founderNote || {
    title: 'A Message From Our Heart',
    message: 'We love you and so when you step into our store, we leave no stones unturned to make you feel special & close to us. We give a humane touch to your shopping experience.\n\nWe are personally available to help you find your perfect fit. Not only that, we suggest styling tips for your body types & individual expression. Thus, helping you to choose the right styles.',
    author: 'Chhavi Kumar Chaddha',
    designation: 'LA GLITS FOUNDER',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop'
  };

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
        <section className="py-20 bg-background relative overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col lg:flex-row items-stretch gap-0 bg-white rounded-[2rem] overflow-hidden shadow-2xl shadow-accent/10 border border-accent/10">
              {/* Image Column */}
              <div className="w-full lg:w-1/2 relative min-h-[400px] lg:min-h-[600px]">
                <img 
                  src={founderNote.imageUrl} 
                  alt={founderNote.author} 
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Image Overlay/Frame */}
                <div className="absolute inset-4 border border-white/30 rounded-[1.5rem] pointer-events-none"></div>
              </div>

              {/* Text Column */}
              <div className="w-full lg:w-1/2 p-8 md:p-16 lg:p-20 flex flex-col justify-center bg-[#FFD700]/10 relative">
                {/* Background Pattern Overlay */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                
                <div className="relative space-y-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-[2px] w-12 bg-accent"></div>
                      <h3 className="text-accent font-bold tracking-[0.2em] uppercase text-xs md:text-sm">
                        Note by Founder
                      </h3>
                    </div>
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-foreground leading-[1.1]">
                      {founderNote.title}
                    </h2>
                  </div>

                  <div className="space-y-6 text-muted-foreground text-lg md:text-xl leading-relaxed italic font-light">
                    {founderNote.message.split('\n\n').map((para: string, i: number) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>

                  <div className="pt-10 border-t border-accent/20">
                    <p className="font-display text-3xl md:text-4xl text-accent italic font-medium">
                      {founderNote.author}
                    </p>
                    <p className="text-xs md:text-sm tracking-[0.3em] uppercase mt-2 text-muted-foreground font-semibold">
                      - {founderNote.designation}
                    </p>
                  </div>
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
