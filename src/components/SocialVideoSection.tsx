import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, ChevronLeft, ChevronRight, Instagram, Youtube, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { storeInfo } from '@/data/products';

interface SocialMediaPost {
  _id: string;
  title: string;
  platform: 'instagram' | 'youtube';
  videoUrl: string;
  thumbnail: string;
  views: number;
  linkedType: 'product' | 'category' | 'external';
  linkedId?: string;
  externalUrl?: string;
  linkedProduct?: { _id: string; name: string; slug: string; images: string[] };
  linkedCategory?: { _id: string; name: string; slug: string; image: string };
}

interface VideoCardProps {
  post: SocialMediaPost;
  onClick: () => void;
  formatViews: (views: number) => string;
}

const getYouTubeEmbedUrl = (url: string): string | null => {
  const shortsMatch = url.match(/youtube\.com\/shorts\/([^/?]+)/);
  if (shortsMatch) {
    return `https://www.youtube.com/embed/${shortsMatch[1]}?autoplay=1&mute=1&loop=1&playlist=${shortsMatch[1]}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`;
  }
  const videoMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&/?]+)/);
  if (videoMatch) {
    return `https://www.youtube.com/embed/${videoMatch[1]}?autoplay=1&mute=1&loop=1&playlist=${videoMatch[1]}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`;
  }
  return null;
};

const getInstagramEmbedUrl = (url: string): string | null => {
  const reelMatch = url.match(/instagram\.com\/(?:reel|reels|p)\/([^/?]+)/);
  if (reelMatch) {
    return `https://www.instagram.com/reel/${reelMatch[1]}/embed/`;
  }
  return null;
};

const isDirectVideoUrl = (url: string): boolean => {
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url) || url.includes('/uploads/');
};

const VideoCard = ({ post, onClick, formatViews }: VideoCardProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);

  const isDirectVideo = isDirectVideoUrl(post.videoUrl);
  const youtubeEmbedUrl = getYouTubeEmbedUrl(post.videoUrl);
  const instagramEmbedUrl = getInstagramEmbedUrl(post.videoUrl);

  useEffect(() => {
    if (!isDirectVideo) return;
    
    const video = videoRef.current;
    if (!video) return;

    const attemptPlay = async () => {
      try {
        video.muted = true;
        await video.play();
        setIsPlaying(true);
      } catch (error) {
        console.log('Autoplay failed, waiting for user interaction');
        setIsPlaying(false);
      }
    };

    const handleCanPlay = () => {
      attemptPlay();
    };

    const handleError = () => {
      setHasError(true);
      setIsPlaying(false);
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    if (video.readyState >= 3) {
      attemptPlay();
    }

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
    };
  }, [post.videoUrl, isDirectVideo]);

  const handleManualPlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const renderVideoContent = () => {
    if (youtubeEmbedUrl) {
      return (
        <iframe
          src={youtubeEmbedUrl}
          className="w-full h-full object-cover"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          frameBorder="0"
          style={{ pointerEvents: 'none' }}
        />
      );
    }

    if (instagramEmbedUrl) {
      return (
        <>
          <img
            src={post.thumbnail || '/placeholder.jpg'}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
              <Play className="h-7 w-7 text-pink-500 fill-pink-500 ml-1" />
            </div>
          </div>
        </>
      );
    }

    if (isDirectVideo && !hasError) {
      return (
        <>
          <video
            ref={videoRef}
            src={post.videoUrl}
            poster={post.thumbnail}
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover"
          />
          {!isPlaying && (
            <div 
              className="absolute inset-0 flex items-center justify-center bg-black/30"
              onClick={handleManualPlay}
            >
              <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                <Play className="h-6 w-6 text-primary fill-primary ml-1" />
              </div>
            </div>
          )}
        </>
      );
    }

    return (
      <>
        <img
          src={post.thumbnail || '/placeholder.jpg'}
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
            <Play className="h-6 w-6 text-primary fill-primary ml-1" />
          </div>
        </div>
      </>
    );
  };

  return (
    <div 
      className="flex-shrink-0 w-[160px] md:w-[200px] cursor-pointer group"
      onClick={onClick}
      data-testid={`card-video-${post._id}`}
    >
      <div className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-muted">
        {renderVideoContent()}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
        
        <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
          <Eye className="h-3 w-3" />
          <span>{formatViews(post.views)}</span>
        </div>
        
        <div className="absolute top-3 right-3">
          {post.platform === 'instagram' ? (
            <Instagram className="h-5 w-5 text-white drop-shadow-lg" />
          ) : (
            <Youtube className="h-5 w-5 text-white drop-shadow-lg" />
          )}
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-3 pointer-events-none">
          {post.linkedProduct && (
            <div className="flex items-center gap-2 mb-2">
              <img 
                src={post.linkedProduct.images?.[0] || '/placeholder-product.jpg'} 
                alt={post.linkedProduct.name}
                className="w-8 h-8 rounded object-cover border border-white/30"
              />
              <span className="text-white text-xs font-medium line-clamp-1">
                {post.linkedProduct.name}
              </span>
            </div>
          )}
          <p className="text-white text-sm font-medium line-clamp-2">{post.title}</p>
        </div>
      </div>
    </div>
  );
};

const SocialVideoSection = () => {
  const [posts, setPosts] = useState<SocialMediaPost[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadPosts();
  }, []);


  const loadPosts = async () => {
    try {
      const data = await api.get<{ posts: SocialMediaPost[] }>('/public/social-media-posts');
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Failed to load social media posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = async (post: SocialMediaPost) => {
    try {
      await api.post(`/public/social-media-posts/${post._id}/view`);
    } catch (error) {
      console.error('Failed to increment view count:', error);
    }

    if (post.linkedType === 'product' && post.linkedProduct) {
      navigate(`/product/${post.linkedProduct._id}`);
    } else if (post.linkedType === 'category' && post.linkedCategory) {
      navigate(`/category/${post.linkedCategory.slug}`);
    } else if (post.linkedType === 'external' && post.externalUrl) {
      window.open(post.externalUrl, '_blank');
    } else {
      window.open(post.videoUrl, '_blank');
    }
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <section className="py-8 md:py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
              Follow Us on Social Media
            </h2>
            <p className="text-muted-foreground text-sm">
              Watch our latest videos & get styling inspiration
            </p>
          </div>
          <div className="flex gap-4 overflow-hidden justify-center">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex-shrink-0 w-[160px] md:w-[200px]">
                <div className="aspect-[9/16] rounded-2xl bg-muted animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 md:py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2" data-testid="text-social-title">
            Follow Us on Social Media
          </h2>
          <p className="text-muted-foreground text-sm">
            Watch our latest videos & get styling inspiration
          </p>
          <div className="flex justify-center gap-4 mt-4 flex-wrap">
            <a
              href={storeInfo.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
              data-testid="link-instagram"
            >
              <Instagram className="h-4 w-4" />
              Instagram
            </a>
            <a
              href={storeInfo.social.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
              data-testid="link-youtube"
            >
              <Youtube className="h-4 w-4" />
              YouTube
            </a>
          </div>
        </div>

        {posts.length > 0 ? (
          <div className="relative">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-background/90 shadow-lg hidden md:flex"
              data-testid="button-scroll-left"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div 
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4 px-2 md:px-10"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {posts.map((post) => (
                <VideoCard 
                  key={post._id} 
                  post={post} 
                  onClick={() => handleClick(post)}
                  formatViews={formatViews}
                />
              ))}
            </div>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full bg-background/90 shadow-lg hidden md:flex"
              data-testid="button-scroll-right"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <p>No videos available yet. Check back soon!</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default SocialVideoSection;
