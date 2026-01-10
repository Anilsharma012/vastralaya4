import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api, Category } from "@/lib/api";
import { gridCategories } from "@/data/products";

const CategoryGrid = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setError(null);
      const data = await api.get<Category[]>('/public/categories');
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError('Unable to load categories from server. Showing default categories.');
    } finally {
      setIsLoading(false);
    }
  };

  const displayCategories = categories.length > 0 
    ? categories.map(cat => ({
        id: cat._id,
        name: cat.name,
        image: cat.image || '/placeholder-category.jpg',
        videoUrl: cat.videoUrl,
        slug: cat.slug
      }))
    : gridCategories.map(cat => ({
        id: cat.id,
        name: cat.name,
        image: cat.image,
        videoUrl: undefined,
        slug: cat.id
      }));

  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  if (isLoading) {
    return (
      <section className="py-10 px-4 bg-background">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <p className="text-muted-foreground text-sm mb-2 tracking-wide">Therapy helps you understand your moods.</p>
            <h2 className="font-display text-xl md:text-2xl font-semibold text-foreground tracking-tight">
              We help you dress for them.
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-x-4 gap-y-6 md:gap-x-8 md:gap-y-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-full aspect-[3/4] mb-3 bg-muted animate-pulse" />
                <div className="h-3 w-16 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 px-4 bg-background">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <p className="text-muted-foreground text-sm mb-2 tracking-wide">Therapy helps you understand your moods.</p>
          <h2 className="font-display text-xl md:text-2xl font-semibold text-foreground tracking-tight">
            We help you dress for them.
          </h2>
          {error && (
            <p className="text-sm text-amber-600 dark:text-amber-400 mt-2" data-testid="text-category-error">
              {error}
            </p>
          )}
        </div>
        <div className="grid grid-cols-3 gap-x-4 gap-y-6 md:gap-x-8 md:gap-y-8">
          {displayCategories.map((category) => {
            const youtubeId = category.videoUrl ? getYouTubeId(category.videoUrl) : null;
            
            return (
              <Link 
                key={category.id} 
                to={`/category/${category.slug || category.id}`} 
                className="flex flex-col items-center group"
                data-testid={`link-category-${category.id}`}
              >
                <div className="w-full aspect-[3/4] mb-3 overflow-hidden bg-secondary/30">
                  {youtubeId ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&controls=0&modestbranding=1&rel=0&showinfo=0`}
                      className="w-full h-full object-cover scale-150"
                      allow="autoplay; encrypted-media"
                      frameBorder="0"
                    />
                  ) : (category.videoUrl && category.videoUrl.trim() !== "") ? (
                    <video
                      key={category.videoUrl}
                      src={category.videoUrl.trim()}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      autoPlay
                      muted
                      loop
                      playsInline
                      onError={(e) => {
                        const target = e.target as HTMLVideoElement;
                        target.style.display = 'none';
                        const img = target.nextElementSibling as HTMLImageElement;
                        if (img) (img as HTMLElement).style.display = 'block';
                      }}
                    />
                  ) : null}
                  <img 
                    src={category.image} 
                    alt={category.name} 
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" 
                    style={{ display: (category.videoUrl && category.videoUrl.trim() !== "") || youtubeId ? 'none' : 'block' }}
                  />
                </div>
                <span className="text-[10px] md:text-xs font-medium text-foreground text-center uppercase tracking-[0.15em] group-hover:text-accent transition-colors">
                  {category.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;