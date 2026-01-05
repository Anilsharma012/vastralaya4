import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { api, Banner } from "@/lib/api";
import { Link } from "react-router-dom";
import heroBanner from "@/assets/hero-banner.jpg";

const HeroSlider = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBanners();
  }, []);

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners.length]);

  const loadBanners = async () => {
    try {
      const data = await api.get<Banner[]>('/public/banners?placement=hero');
      setBanners(data);
    } catch (error) {
      console.error('Failed to load banners:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentBanner = banners[currentIndex];

  if (isLoading) {
    return (
      <section className="relative overflow-hidden">
        <div className="relative h-[280px] md:h-[400px] lg:h-[500px] bg-muted animate-pulse" />
      </section>
    );
  }

  if (banners.length === 0) {
    return (
      <section className="relative overflow-hidden">
        <div className="relative h-[280px] md:h-[400px] lg:h-[500px]">
          <img src={heroBanner} alt="Shree Balaji Vastralya" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/60 via-primary/30 to-transparent" />
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-4">
              <div className="max-w-lg space-y-3 md:space-y-4">
                <span className="inline-block px-3 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded-full animate-fade-in">
                  One Stop Shop for Ethnic Wear
                </span>
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-primary-foreground leading-tight animate-fade-in-up">
                  ETHNIC DESIRE
                </h2>
                <p className="text-primary-foreground/90 text-sm md:text-base animate-fade-in-up">
                  Suits, Sarees, Dresses, Lehengas & Gents Wear with Customised Tailoring
                </p>
                <Button className="btn-gold rounded-full px-6 md:px-8 py-2.5 md:py-3 font-semibold animate-fade-in-up">
                  Shop Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden">
      <div className="relative h-[280px] md:h-[400px] lg:h-[500px]">
        <img 
          src={currentBanner.imageUrl} 
          alt={currentBanner.title} 
          className="w-full h-full object-cover transition-opacity duration-500"
          data-testid={`img-hero-banner-${currentBanner._id}`}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/60 via-primary/30 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-lg space-y-3 md:space-y-4">
              {currentBanner.subtitle && (
                <span className="inline-block px-3 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded-full animate-fade-in">
                  {currentBanner.subtitle}
                </span>
              )}
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-primary-foreground leading-tight animate-fade-in-up" data-testid="text-hero-title">
                {currentBanner.title}
              </h2>
              {currentBanner.buttonText && currentBanner.targetLink && (
                <Link to={currentBanner.targetLink}>
                  <Button className="btn-gold rounded-full px-6 md:px-8 py-2.5 md:py-3 font-semibold animate-fade-in-up" data-testid="button-hero-cta">
                    {currentBanner.buttonText}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
        
        {banners.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex ? 'bg-accent w-6' : 'bg-white/50 hover:bg-white/80'
                }`}
                data-testid={`button-hero-dot-${index}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSlider;