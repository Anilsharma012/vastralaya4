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

  return (
    <section className="py-8 px-4">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">
            {title}
          </h2>
          {showViewAll && (
            <Button
              variant="ghost"
              className="text-primary hover:text-rose-dark text-sm font-medium gap-1 px-2"
            >
              View All
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>

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
      </div>
    </section>
  );
};

export default ProductSection;
