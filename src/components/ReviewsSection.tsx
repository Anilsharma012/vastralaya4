import { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

interface Review {
  _id: string;
  userId: { name: string };
  productId: { name: string; images: string[] };
  rating: number;
  title: string;
  comment: string;
  images: string[];
  isVerifiedPurchase: boolean;
  createdAt: string;
}

const ReviewsSection = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const data = await api.get<{ reviews: Review[] }>('/public/reviews?limit=10');
      setReviews(data.reviews || []);
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
      />
    ));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, reviews.length - 2));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.max(1, reviews.length - 2)) % Math.max(1, reviews.length - 2));
  };

  if (isLoading) {
    return (
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">Loading reviews...</p>
        </div>
      </section>
    );
  }

  if (reviews.length === 0) {
    return null;
  }

  const visibleReviews = reviews.slice(currentIndex, currentIndex + 3);

  return (
    <section className="py-12 bg-muted/30" data-testid="section-reviews">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
            What Our Customers Say
          </h2>
          <p className="text-muted-foreground">
            Real reviews from our valued customers
          </p>
        </div>

        <div className="relative">
          {reviews.length > 3 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-background shadow-md"
                onClick={prevSlide}
                data-testid="button-prev-review"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-background shadow-md"
                onClick={nextSlide}
                data-testid="button-next-review"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-8">
            {visibleReviews.map((review) => (
              <Card key={review._id} className="overflow-hidden" data-testid={`card-review-${review._id}`}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{review.userId?.name || 'Customer'}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex">{renderStars(review.rating)}</div>
                        {review.isVerifiedPurchase && (
                          <Badge variant="outline" className="text-xs">Verified</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {review.title && (
                    <h4 className="font-semibold mb-2">{review.title}</h4>
                  )}
                  
                  <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                    {review.comment}
                  </p>

                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 mb-4">
                      {review.images.slice(0, 3).map((img, idx) => (
                        <img 
                          key={idx} 
                          src={img} 
                          alt="" 
                          className="w-16 h-16 object-cover rounded"
                        />
                      ))}
                      {review.images.length > 3 && (
                        <div className="w-16 h-16 bg-muted rounded flex items-center justify-center text-sm text-muted-foreground">
                          +{review.images.length - 3}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{review.productId?.name}</span>
                    <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-6 gap-2">
          {Array(Math.ceil(reviews.length / 3)).fill(0).map((_, idx) => (
            <button
              key={idx}
              className={`w-2 h-2 rounded-full transition-colors ${
                Math.floor(currentIndex / 3) === idx ? 'bg-primary' : 'bg-muted-foreground/30'
              }`}
              onClick={() => setCurrentIndex(idx * 3)}
              data-testid={`button-dot-${idx}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
