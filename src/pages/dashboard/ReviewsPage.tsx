import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Package, Loader2, CheckCircle, Clock } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

interface Review {
  _id: string;
  productId: {
    _id: string;
    name: string;
    slug: string;
    images: string[];
  };
  rating: number;
  title?: string;
  comment?: string;
  isApproved: boolean;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await api.get<Review[]>('/user/reviews');
      setReviews(data);
    } catch (error: any) {
      toast({ title: error.message || 'Failed to load reviews', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">My Reviews</h1>
        <p className="text-muted-foreground mt-1">Reviews you've written for products</p>
      </div>

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Star className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg mb-2">No reviews yet</p>
            <p className="text-sm text-muted-foreground">
              Purchase products and share your experience with others
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review._id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <Link to={`/product/${review.productId?.slug}`} className="shrink-0">
                    <img
                      src={review.productId?.images?.[0] || '/placeholder.jpg'}
                      alt={review.productId?.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  </Link>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <Link 
                          to={`/product/${review.productId?.slug}`}
                          className="font-medium text-foreground hover:text-accent line-clamp-1"
                        >
                          {review.productId?.name || 'Product no longer available'}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(review.createdAt), 'dd MMM yyyy')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {review.isVerifiedPurchase && (
                          <Badge variant="secondary" className="text-xs gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Verified
                          </Badge>
                        )}
                        <Badge variant={review.isApproved ? 'default' : 'outline'} className="text-xs gap-1">
                          {review.isApproved ? (
                            <>
                              <CheckCircle className="h-3 w-3" />
                              Published
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3" />
                              Pending
                            </>
                          )}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      {renderStars(review.rating)}
                    </div>
                    
                    {review.title && (
                      <p className="font-medium text-sm mb-1">{review.title}</p>
                    )}
                    
                    {review.comment && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {review.comment}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
