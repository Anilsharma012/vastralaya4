import { Star } from "lucide-react";
import { customerReviews } from "@/data/products";

const CustomerReviews = () => {
  return (
    <section className="py-8 bg-secondary/30">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-2">
          Customer Reviews
        </h2>
        <p className="text-muted-foreground text-center text-sm mb-8">
          See what our customers say about us
        </p>

        <div className="overflow-x-auto hide-scrollbar">
          <div className="flex gap-4 min-w-max pb-4">
            {customerReviews.map((review) => (
              <div
                key={review.id}
                className="w-[280px] md:w-[320px] bg-card rounded-2xl overflow-hidden shadow-card flex-shrink-0"
              >
                {/* Customer Image - Instagram style */}
                <div className="aspect-[4/5] relative overflow-hidden">
                  <img
                    src={review.image}
                    alt={review.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent" />
                  
                  {/* Review overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-primary-foreground">
                    <div className="flex gap-0.5 mb-2">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                      ))}
                    </div>
                    <p className="text-sm leading-relaxed mb-3 line-clamp-3">
                      "{review.review}"
                    </p>
                    <div>
                      <p className="font-semibold">{review.name}</p>
                      <p className="text-xs text-primary-foreground/70">{review.location}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerReviews;
