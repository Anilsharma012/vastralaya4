import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
}

const StorySlider = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const data = await api.get<Category[]>("/public/categories");
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section className="py-4 bg-background">
      <div className="overflow-x-auto hide-scrollbar">
        <div className="flex gap-4 px-4 min-w-max">
          {loading ? (
            // Loading skeleton
            [...Array(6)].map((_, index) => (
              <div key={`skeleton-${index}`} className="flex flex-col items-center gap-2">
                <Skeleton className="w-[72px] h-[72px] md:w-20 md:h-20 rounded-full" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))
          ) : categories.length > 0 ? (
            categories.map((category, index) => (
              <Link
                key={category._id}
                to={`/category/${category.slug}`}
                className="flex flex-col items-center gap-2 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent via-gold to-gold-dark p-[3px] animate-pulse">
                    <div className="w-full h-full rounded-full bg-background" />
                  </div>
                  <div className="relative w-[72px] h-[72px] md:w-20 md:h-20 rounded-full overflow-hidden m-[3px] group-hover:scale-105 transition-transform duration-300">
                    <img
                      src={category.image || "/placeholder-category.jpg"}
                      alt={category.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://placehold.co/150x150?text=" + encodeURIComponent(category.name);
                      }}
                    />
                  </div>
                </div>
                <span className="text-xs font-medium text-foreground text-center max-w-[80px] leading-tight group-hover:text-accent transition-colors">
                  {category.name}
                </span>
              </Link>
            ))
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default StorySlider;
