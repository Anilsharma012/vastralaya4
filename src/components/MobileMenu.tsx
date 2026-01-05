import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, User, Package, HelpCircle, LogIn, ChevronRight, ChevronDown } from "lucide-react";
import { api } from "@/lib/api";
import logo from "@/assets/logo.jpg";
import { useAuth } from "@/contexts/AuthContext";

interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  subcategories?: Array<{
    _id: string;
    name: string;
    slug: string;
  }>;
}

const MobileMenu = () => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await api.get<Category[]>('/public/categories-with-subcategories');
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const menuItems = user ? [
    { icon: User, label: "My Account", href: "/dashboard" },
    { icon: Package, label: "My Orders", href: "/dashboard/orders" },
    { icon: Heart, label: "Wishlist", href: "/dashboard/wishlist" },
    { icon: HelpCircle, label: "Help & Support", href: "/dashboard/tickets" },
  ] : [
    { icon: LogIn, label: "Login / Signup", href: "/login" },
    { icon: HelpCircle, label: "Help & Support", href: "/contact" },
  ];

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="p-4 bg-primary flex items-center gap-3">
        <img src={logo} alt="Shri Balaji Vastralya" className="w-14 h-14 rounded-full object-cover border-2 border-accent" />
        <div>
          <h2 className="font-display text-xl font-bold text-primary-foreground">SHRI BALAJI</h2>
          <p className="text-primary-foreground/80 text-xs tracking-widest">VASTRALYA</p>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Shop by Category</h3>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {categories.map((category) => (
                <div key={category._id}>
                  <div
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-muted transition-colors cursor-pointer"
                    onClick={() => category.subcategories && category.subcategories.length > 0 && setExpandedCategory(expandedCategory === category._id ? null : category._id)}
                  >
                    <Link 
                      to={`/category/${category.slug}`} 
                      className="flex items-center gap-3 flex-1" 
                      onClick={(e) => category.subcategories && category.subcategories.length > 0 && e.preventDefault()}
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-accent/30 bg-muted">
                        {category.image && (
                          <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <span className="font-medium text-foreground">{category.name}</span>
                    </Link>
                    {category.subcategories && category.subcategories.length > 0 ? (
                      <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expandedCategory === category._id ? "rotate-180" : ""}`} />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  {expandedCategory === category._id && category.subcategories && category.subcategories.length > 0 && (
                    <div className="ml-12 space-y-1 py-2">
                      {category.subcategories.map((sub) => (
                        <Link key={sub._id} to={`/category/${category.slug}/${sub.slug}`} className="block px-3 py-2 text-sm text-muted-foreground hover:text-accent transition-colors">
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="p-4 border-t border-border">
          <div className="space-y-1">
            {menuItems.map((item, index) => (
              <Link key={index} to={item.href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors group">
                <item.icon className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
                <span className="font-medium text-foreground group-hover:text-accent transition-colors">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="p-4 border-t border-border bg-muted/50">
        <p className="text-xs text-muted-foreground text-center">Est. 1974 - Shri Balaji Vastralya</p>
      </div>
    </div>
  );
};

export default MobileMenu;
