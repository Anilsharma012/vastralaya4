import { useState, useEffect } from "react";
import { Instagram, Youtube, Mail, Phone, MapPin, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { storeInfo } from "@/data/products";
import { api } from "@/lib/api";

interface CMSPage {
  _id: string;
  title: string;
  slug: string;
  isActive: boolean;
}

const Footer = () => {
  const [cmsPages, setCmsPages] = useState<CMSPage[]>([]);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const response = await api.get<{ pages: CMSPage[] }>("/public/pages");
        setCmsPages(response.pages || []);
      } catch (error) {
        console.error("Error fetching footer pages:", error);
      }
    };
    fetchPages();
  }, []);

  const shopLinks = [
    { name: "Bridal Wear", href: "/category/occasion-wear" },
    { name: "Women Ethnic", href: "/category/readymade-dresses" },
    { name: "Men Ethnic", href: "/category/mens-wear" },
    { name: "Sarees", href: "/category/sarees" },
    { name: "New Arrivals", href: "/category/new-arrival" },
    { name: "Best Sellers", href: "/category/best-seller" },
  ];

  const helpLinks = [
    { name: "Contact Us", href: "/page/contact-us" },
    { name: "FAQ", href: "/page/faq" },
    ...cmsPages
      .filter(p => p.isActive && ["shipping-policy", "return-policy", "refund-policy"].includes(p.slug))
      .map(p => ({ name: p.title, href: `/page/${p.slug}` })),
    { name: "Track Order", href: "/track-order" },
  ];

  const companyLinks = [
    ...cmsPages
      .filter(p => p.isActive && ["about-us", "terms-and-conditions"].includes(p.slug))
      .map(p => ({ name: p.title, href: `/page/${p.slug}` })),
    { name: "Store Location", href: "/about" },
  ];

  return (
    <footer className="bg-foreground text-primary-foreground">
      {/* Newsletter */}
      <div className="border-b border-primary-foreground/20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-xl font-bold mb-1">
                Subscribe to our Newsletter
              </h3>
              <p className="text-primary-foreground/70 text-sm">
                Get exclusive offers and updates on new collections
              </p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-64 px-4 py-2.5 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:border-primary text-sm"
              />
              <Button className="btn-gold rounded-full px-6 font-semibold">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <h2 className="font-display text-2xl font-bold text-primary-foreground mb-1">
              SHREE BALAJI
            </h2>
            <p className="text-xs tracking-[0.25em] text-primary-foreground/70 mb-1">
              VASTRALAYA
            </p>
            <p className="text-xs text-primary-foreground/50 mb-4">
              {storeInfo.tagline}
            </p>
            <p className="text-sm text-primary-foreground/70 mb-4">
              Rohtak's premier destination for premium ethnic and bridal wear. 
              Banarasi sarees, lehengas, and more.
            </p>
            <div className="flex gap-3">
              <a 
                href={storeInfo.social.facebook} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-primary-foreground/10 hover:bg-blue-600 hover:text-white transition-all"
                data-testid="link-facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a 
                href={storeInfo.social.instagram} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-primary-foreground/10 hover:bg-gradient-to-br hover:from-pink-500 hover:via-red-500 hover:to-yellow-500 hover:text-white transition-all"
                data-testid="link-instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a 
                href={storeInfo.social.youtube} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-primary-foreground/10 hover:bg-red-600 hover:text-white transition-all"
                data-testid="link-youtube"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold text-primary-foreground mb-4">Shop</h4>
            <ul className="space-y-2">
              {shopLinks.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-sm text-primary-foreground/70 hover:text-primary transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Help & Company */}
          <div>
            <h4 className="font-semibold text-primary-foreground mb-4">Help</h4>
            <ul className="space-y-2">
              {helpLinks.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-sm text-primary-foreground/70 hover:text-primary transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
            <h4 className="font-semibold text-primary-foreground mt-6 mb-3">Company</h4>
            <ul className="space-y-2">
              {companyLinks.map((link, index) => (
                <li key={index}>
                  <Link to={link.href} className="text-sm text-primary-foreground/70 hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-primary-foreground mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm text-primary-foreground/70">
                  {storeInfo.address.street},<br />
                  {storeInfo.address.area},<br />
                  {storeInfo.address.city}, {storeInfo.address.state} {storeInfo.address.pincode}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <a href={storeInfo.phoneLink} className="text-sm text-primary-foreground/70 hover:text-primary transition-colors">
                  {storeInfo.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <a href={`mailto:${storeInfo.email}`} className="text-sm text-primary-foreground/70 hover:text-primary transition-colors">
                  {storeInfo.email}
                </a>
              </li>
            </ul>
            <p className="text-xs text-primary-foreground/50 mt-4">
              📍 {storeInfo.distance}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-primary-foreground/60">
            <p>© 2024 {storeInfo.name} {storeInfo.tagline}. All rights reserved.</p>
            <div className="flex gap-4">
              <Link to="/page/terms-and-conditions" className="hover:text-primary transition-colors">Terms & Conditions</Link>
              <Link to="/page/return-policy" className="hover:text-primary transition-colors">Return Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
