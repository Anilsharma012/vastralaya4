import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import ProductCard from "./ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductData {
  _id: string;
  name: string;
  slug: string;
  images: string[];
  price: number;
  comparePrice?: number;
  categoryId?: { _id: string; name: string; slug: string } | null;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  stock: number;
}

interface ProductSectionProps {
  title: string;
  type: "featured" | "new" | "bestseller";
  showViewAll?: boolean;
}

import { Star } from "lucide-react";

const SectionTitle = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="relative w-full mb-10 overflow-hidden">
    <div className="bg-gradient-to-r from-white via-gold/5 to-white py-6 px-4 md:px-8 relative overflow-hidden flex flex-col items-center justify-center text-center border-y border-gold/20 shadow-sm">
      {/* Decorative stars/sparkles - Gold colored */}
      <Star className="absolute left-4 top-4 h-4 w-4 text-gold/40 animate-pulse fill-current" />
      <Star className="absolute left-10 bottom-4 h-3 w-3 text-gold/30 animate-pulse delay-100 fill-current" />
      <Star className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gold/50 animate-pulse delay-300 fill-current" />
      <Star className="absolute right-12 bottom-2 h-4 w-4 text-gold/30 animate-pulse delay-200 fill-current" />
      
      {/* Subtle Pattern overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #D4AF37 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
      
      <h2 className="font-display text-2xl md:text-4xl font-black uppercase tracking-[0.25em] relative z-10">
        <span className="bg-gradient-to-r from-gold-dark via-gold to-gold-dark bg-clip-text text-transparent drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.05)]">
          {title}
        </span>
      </h2>
      {subtitle && (
        <p className="text-muted-foreground/80 text-[10px] md:text-xs mt-3 font-semibold relative z-10 tracking-[0.1em] max-w-2xl uppercase">
          {subtitle}
        </p>
      )}
      
      {/* Decorative Gold accent line at bottom */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-[2px] bg-gradient-to-r from-transparent via-gold/50 to-transparent"></div>
    </div>
  </div>
);

const ProductSection = ({ title, type, showViewAll = true }: ProductSectionProps) => {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params: Record<string, string> = {};

        if (type === "featured") {
          params.featured = "true";
        } else if (type === "new") {
          params.newArrival = "true";
        } else if (type === "bestseller") {
          params.bestSeller = "true";
        }

        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `/public/products?${queryString}` : '/public/products';
        const data = await api.get<{ products: ProductData[] }>(url);
        setProducts(data.products || []);
      } catch (error) {
        console.error(`Error fetching ${type} products:`, error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [type]);

  const formatProductForCard = (product: ProductData) => ({
    id: product._id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    originalPrice: product.comparePrice,
    image: product.images?.[0] || "/placeholder-product.jpg",
    category: typeof product.categoryId === "object" ? product.categoryId?.name : "Category",
    isNew: product.isNewArrival,
    isBestseller: product.isBestSeller,
    discount: product.comparePrice ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100) : undefined,
    stock: product.stock,
  });

  const getSubtitle = () => {
    if (type === "new") return "New launches every day, styles that promise to capture your heart.";
    if (type === "featured") return "Handpicked styles curated just for your special occasions.";
    if (type === "bestseller") return "The pieces everyone is loving right now, get them before they're gone.";
    return "";
  };

  return (
    <section className="py-12 px-4 bg-background">
      <div className="container mx-auto">
        <SectionTitle title={title} subtitle={getSubtitle()} />
        
        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {loading ? (
            // Loading skeletons
            [...Array(8)].map((_, index) => (
              <div key={`skeleton-${index}`} className="space-y-2">
                <Skeleton className="aspect-[3/4] rounded-lg" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))
          ) : products.length > 0 ? (
            products.map((product, index) => (
              <div
                key={product._id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ProductCard product={formatProductForCard(product)} />
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No products found in this category
            </div>
          )}
        </div>
        {/* View All Button at bottom */}
        {showViewAll && products.length > 0 && (
          <div className="mt-10 flex justify-center">
            <Button
              variant="outline"
              className="border-accent text-accent hover:bg-accent hover:text-white rounded-full px-8 py-6 font-semibold transition-all duration-300"
            >
              View All {title}
              <ChevronRight className="h-5 w-5 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductSection;
