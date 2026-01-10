import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  videoUrl?: string;
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

    const getYouTubeId = (url: string) => {
      if (!url) return null;
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
    };

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
              categories.map((category, index) => {
                const youtubeId = category.videoUrl ? getYouTubeId(category.videoUrl) : null;
                const hasVideo = (category.videoUrl && category.videoUrl.trim() !== "") || youtubeId;
                
                return (
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
                      <div className="relative w-[72px] h-[72px] md:w-20 md:h-20 rounded-full overflow-hidden m-[3px] group-hover:scale-105 transition-transform duration-300 bg-muted">
                        {youtubeId ? (
                          <div className="absolute inset-0 w-full h-full pointer-events-none">
                            <iframe
                              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&enablejsapi=1`}
                              className="w-[300%] h-[300%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                              allow="autoplay; encrypted-media"
                              frameBorder="0"
                            />
                          </div>
                        ) : (category.videoUrl && category.videoUrl.trim() !== "") ? (
                          <video
                            key={category.videoUrl}
                            src={category.videoUrl.trim()}
                            className="w-full h-full object-cover"
                            autoPlay
                            muted
                            loop
                            playsInline
                            onError={(e) => {
                              console.error("Video playback error for", category.name, ":", e);
                              const target = e.target as HTMLVideoElement;
                              target.style.display = 'none';
                              const img = target.parentElement?.querySelector('img');
                              if (img) (img as HTMLElement).style.display = 'block';
                            }}
                          />
                        ) : null}
                        <img
                          src={category.image || "/placeholder-category.jpg"}
                          alt={category.name}
                          className="w-full h-full object-cover"
                          style={{ display: hasVideo ? 'none' : 'block' }}
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
                );
              })
            ) : null}
          </div>
        </div>
      </section>
    );
};

export default StorySlider;
