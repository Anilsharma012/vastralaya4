import { useState, useEffect } from "react";
import { MapPin, Phone, Clock, Instagram, Youtube, Star, Heart, Truck, Shield, Award, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";

const About = () => {
  const [storeInfo, setStoreInfo] = useState<any>(null);
  const [aboutPage, setAboutPage] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [settingsRes, aboutRes] = await Promise.all([
          api.get<any>("/public/settings"),
          api.get<any>("/public/pages/about-us")
        ]);
        setStoreInfo(settingsRes.settings?.store);
        setAboutPage(aboutRes);
      } catch (error) {
        console.error("Error loading about page data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const features = [
    {
      icon: Heart,
      title: "Handcrafted with Love",
      description: "Every piece is crafted with precision and passion"
    },
    {
      icon: Truck,
      title: "Pan India Delivery",
      description: "We deliver to every corner of India"
    },
    {
      icon: Shield,
      title: "Quality Assured",
      description: "Premium fabrics and authentic craftsmanship"
    },
    {
      icon: Award,
      title: "Since Generations",
      description: "Trusted by families for generations"
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-accent/20 to-secondary/30 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            About <span className="text-primary">{storeInfo?.name || 'Shree Balaji Vastralya'}</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {storeInfo?.tagline || '(Sanghi Wale)'} - Rohtak's Premier Ethnic & Bridal Wear Destination
          </p>
        </div>
      </section>

      {/* About Content */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-card rounded-2xl shadow-card p-6 md:p-10">
              <div className="flex items-center gap-2 mb-6">
                <Star className="h-5 w-5 text-gold fill-current" />
                <Star className="h-5 w-5 text-gold fill-current" />
                <Star className="h-5 w-5 text-gold fill-current" />
                <Star className="h-5 w-5 text-gold fill-current" />
                <Star className="h-5 w-5 text-gold fill-current" />
                <span className="text-sm text-muted-foreground ml-2">Trusted by thousands of customers</span>
              </div>
              
              {aboutPage ? (
                <div 
                  className="prose prose-lg dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: aboutPage.content }}
                />
              ) : (
                <div className="space-y-6">
                  <p className="text-foreground text-lg leading-relaxed">
                    Experience the essence of Indian culture at <strong>{storeInfo?.name || 'Shree Balaji Vastralya'} {storeInfo?.tagline}</strong>, 
                    Rohtak's premier clothing shop. Explore our exquisite collection of Banarasi sarees, 
                    ready-to-wear sarees, and silk sarees online, designed to make you shine.
                  </p>
                  
                  <p className="text-foreground text-lg leading-relaxed">
                    From casual wear to party wear and bridal lehengas, our expertly crafted georgette sarees 
                    and lehenga cholis will make you feel like royalty. Browse our latest designs, including 
                    Sabyasachi-inspired lehengas, and get ready to slay the festive season with our 
                    Navratri and Diwali collections.
                  </p>
                  
                  <p className="text-primary font-semibold text-lg">
                    Visit us today and discover the perfect saree or lehenga for women, handcrafted with 
                    love and precision. Let us help you create unforgettable memories with our unique and 
                    exquisite pieces.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-card rounded-xl p-5 text-center shadow-card hover:shadow-soft transition-shadow">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Store Location */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-center text-foreground mb-8">
            Visit Our Store
          </h2>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-primary/5 to-accent/10 rounded-2xl p-6 md:p-10">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Address Info */}
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Store Address</h3>
                      <p className="text-muted-foreground">
                        {storeInfo?.address?.street || 'Railway Rd, Rohtak Station'}<br />
                        {storeInfo?.address?.area ? <>{storeInfo.address.area}<br /></> : null}
                        {storeInfo?.address?.city || 'Rohtak'},<br />
                        {storeInfo?.address?.state || 'Haryana'} {storeInfo?.address?.pincode || '124001'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Phone</h3>
                      <a href={`tel:${storeInfo?.phone?.replace(/\s/g, '') || '07988949131'}`} className="text-primary hover:underline text-lg font-medium">
                        {storeInfo?.phone || '079889 49131'}
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Distance from City Center</h3>
                      <p className="text-muted-foreground">
                        ~{storeInfo?.distance || '1 hr 43 mins from Delhi'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div className="space-y-6">
                  <h3 className="font-semibold text-foreground text-lg">Follow Us</h3>
                  
                  <a 
                    href={storeInfo?.social?.instagram || "https://www.instagram.com/reel/DATKa-yyl2E/"} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-card rounded-xl shadow-card hover:shadow-soft transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 flex items-center justify-center">
                      <Instagram className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                        Instagram
                      </h4>
                      <p className="text-sm text-muted-foreground">@shreebalajivastralya</p>
                    </div>
                  </a>
                  
                  <a 
                    href={storeInfo?.social?.youtube || "https://www.youtube.com/@shreebalajivastralya"} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 bg-card rounded-xl shadow-card hover:shadow-soft transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center">
                      <Youtube className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                        YouTube
                      </h4>
                      <p className="text-sm text-muted-foreground">@shreebalajivastralya</p>
                    </div>
                  </a>
                  
                  <p className="text-sm text-muted-foreground italic">
                    📩 DM for Collaboration
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Embed */}
      <section className="pb-12 md:pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-card">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3494.6775!2d76.6066!3d28.8895!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjjCsDUzJzIyLjIiTiA3NsKwMzYnMjMuOCJF!5e0!3m2!1sen!2sin!4v1600000000000!5m2!1sen!2sin"
              width="100%"
              height="350"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Store Location"
              className="w-full"
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
