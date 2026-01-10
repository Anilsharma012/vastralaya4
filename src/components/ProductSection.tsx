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
    <div className="bg-[#F6C90E] py-8 px-4 md:px-8 relative overflow-hidden flex flex-col items-center justify-center text-center">
      {/* Subtle Pattern overlay */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
      
      <div className="flex items-center gap-4 relative z-10">
        <div className="relative">
          <Star className="h-8 w-8 text-[#B8860B] fill-[#B8860B]" />
          <Star className="absolute -top-1 -right-1 h-4 w-4 text-cyan-400 fill-cyan-400" />
          <Star className="absolute -bottom-1 -left-1 h-4 w-4 text-pink-400 fill-pink-400" />
        </div>
        
        <div className="flex flex-col items-center">
          <h2 className="font-display text-2xl md:text-5xl font-bold uppercase tracking-[0.1em] text-[#B8860B] drop-shadow-sm">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[#8B4513] text-xs md:text-sm mt-1 font-medium tracking-tight">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Decorative scalloped edges simulated with absolute divs */}
      <div className="absolute left-0 top-0 bottom-0 w-3 flex flex-col justify-around py-1">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="h-3 w-3 rounded-full bg-background -translate-x-1/2"></div>
        ))}
      </div>
      <div className="absolute right-0 top-0 bottom-0 w-3 flex flex-col justify-around py-1">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="h-3 w-3 rounded-full bg-background translate-x-1/2"></div>
        ))}
      </div>
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
