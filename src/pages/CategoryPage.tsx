import { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { ChevronRight, SlidersHorizontal, Grid2X2, LayoutGrid, Package, Search } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";

interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
}

interface Subcategory {
  _id: string;
  name: string;
  slug: string;
  categoryId: string;
  image?: string;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  images: string[];
  price: number;
  comparePrice?: number;
  categoryId: Category;
  subcategoryId?: Subcategory;
  isActive: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  stock: number;
}

const CategoryPage = () => {
  const { categorySlug, subcategorySlug } = useParams();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [category, setCategory] = useState<Category | null>(null);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);

  useEffect(() => {
    loadData();
  }, [categorySlug, subcategorySlug, searchQuery]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (searchQuery) {
        const data = await api.get<{ products: Product[] }>(`/public/products?search=${encodeURIComponent(searchQuery)}`);
        setProducts(data.products);
        setCategory(null);
        setSubcategories([]);
        setSelectedSubcategory(null);
        setIsLoading(false);
        return;
      }
      
      const categories = await api.get<Category[]>('/public/categories');
      const foundCategory = categories.find(c => c.slug === categorySlug);
      
      if (foundCategory) {
        setCategory(foundCategory);
        
        const subs = await api.get<Subcategory[]>(`/public/subcategories?categoryId=${foundCategory._id}`);
        setSubcategories(subs);
        
        if (subcategorySlug) {
          const foundSub = subs.find(s => s.slug === subcategorySlug);
          setSelectedSubcategory(foundSub || null);
        } else {
          setSelectedSubcategory(null);
        }
        
        let productsUrl = `/public/products?categoryId=${foundCategory._id}`;
        if (subcategorySlug) {
          const foundSub = subs.find(s => s.slug === subcategorySlug);
          if (foundSub) {
            productsUrl += `&subcategoryId=${foundSub._id}`;
          }
        }
        
        const data = await api.get<{ products: Product[] }>(productsUrl);
        setProducts(data.products);
      } else {
        setCategory(null);
      }
    } catch (error) {
      console.error('Error loading category data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex gap-4 mb-6 overflow-x-auto">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="w-20 h-24 rounded-full flex-shrink-0" />
            ))}
          </div>
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <Skeleton key={i} className="aspect-[3/4] rounded-lg" />
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!category && !searchQuery) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-display text-3xl font-bold text-foreground mb-4">Category Not Found</h1>
          <Link to="/" className="text-accent hover:underline">Go back to home</Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (searchQuery) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pb-12">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-2 mb-4">
              <Search className="h-5 w-5 text-muted-foreground" />
              <h1 className="font-display text-2xl font-bold text-foreground">
                Search Results for "{searchQuery}"
              </h1>
            </div>
            <p className="text-muted-foreground mb-6">{products.length} products found</p>
            
            {products.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">No products found</h2>
                <p className="text-muted-foreground mb-4">Try different keywords or browse our categories</p>
                <Link to="/">
                  <Button>Browse All Products</Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={{
                      id: product._id,
                      slug: product.slug,
                      name: product.name,
                      price: product.price,
                      originalPrice: product.comparePrice,
                      image: product.images[0] || '/placeholder.jpg',
                      category: typeof product.categoryId === 'object' ? product.categoryId.slug : '',
                      subcategory: product.subcategoryId ? (typeof product.subcategoryId === 'object' ? product.subcategoryId.slug : '') : undefined,
                      isNew: product.isNewArrival,
                      isBestseller: product.isBestSeller,
                      discount: product.comparePrice ? Math.round((1 - product.price / product.comparePrice) * 100) : undefined,
                      stock: product.stock
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pb-12">
        {subcategories.length > 0 && !subcategorySlug && (
          <section className="py-4 border-b border-border">
            <div className="overflow-x-auto hide-scrollbar">
              <div className="flex gap-4 px-4 min-w-max">
                {subcategories.map((sub) => (
                  <Link
                    key={sub._id}
                    to={`/category/${categorySlug}/${sub.slug}`}
                    className="flex flex-col items-center gap-2 group"
                    data-testid={`link-subcategory-${sub._id}`}
                  >
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-accent/30 group-hover:border-accent transition-colors">
                      {sub.image ? (
                        <img src={sub.image} alt={sub.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-secondary flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-medium text-foreground text-center max-w-[80px] leading-tight group-hover:text-accent transition-colors">
                      {sub.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4" data-testid="nav-breadcrumb">
            <Link to="/" className="hover:text-accent transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to={`/category/${category.slug}`} className={selectedSubcategory ? "hover:text-accent transition-colors" : "text-foreground font-medium"}>
              {category.name}
            </Link>
            {selectedSubcategory && (
              <>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground font-medium">{selectedSubcategory.name}</span>
              </>
            )}
          </nav>

          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground" data-testid="text-category-title">
            {selectedSubcategory ? selectedSubcategory.name : category.name}
          </h1>
        </div>

        <div className="sticky top-16 z-40 bg-card/95 backdrop-blur-sm border-y border-border">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <Button variant="outline" size="sm" className="gap-2 rounded-full" data-testid="button-filter">
                <SlidersHorizontal className="h-4 w-4" />
                Filter
              </Button>
              
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground" data-testid="text-product-count">
                  {products.length} products
                </span>
                <div className="flex gap-1">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                    data-testid="button-view-grid"
                  >
                    <Grid2X2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                    data-testid="button-view-list"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {subcategories.length > 0 && !subcategorySlug && (
          <div className="container mx-auto px-4 py-4">
            <div className="flex gap-2 flex-wrap">
              {subcategories.map((sub) => (
                <Link
                  key={sub._id}
                  to={`/category/${categorySlug}/${sub.slug}`}
                  className="px-4 py-2 rounded-full border border-border text-sm font-medium hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all"
                  data-testid={`pill-subcategory-${sub._id}`}
                >
                  {sub.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 py-6">
          {products.length > 0 ? (
            <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1 md:grid-cols-2"}`}>
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={{
                    id: product._id,
                    slug: product.slug,
                    name: product.name,
                    price: product.price,
                    originalPrice: product.comparePrice,
                    image: product.images[0] || '/placeholder.jpg',
                    category: typeof product.categoryId === 'object' ? product.categoryId.slug : '',
                    subcategory: product.subcategoryId ? (typeof product.subcategoryId === 'object' ? product.subcategoryId.slug : '') : undefined,
                    isNew: product.isNewArrival,
                    isBestseller: product.isBestSeller,
                    discount: product.comparePrice ? Math.round((1 - product.price / product.comparePrice) * 100) : undefined,
                    stock: product.stock
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-lg mb-4" data-testid="text-no-products">No products found in this category</p>
              <Link to="/" className="text-accent hover:underline">Browse all products</Link>
            </div>
          )}
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="bg-gradient-navy text-primary-foreground rounded-2xl p-6 text-center">
            <h3 className="font-display text-xl md:text-2xl font-bold mb-2">NEW ARRIVALS!</h3>
            <p className="text-primary-foreground/80 text-sm">Matching your Vibes</p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CategoryPage;
