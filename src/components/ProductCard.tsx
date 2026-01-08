import { Heart, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { useWishlist } from "@/contexts/WishlistContext";

interface ProductCardProduct {
  id: string;
  slug?: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category?: string;
  subcategory?: string;
  isNew?: boolean;
  isBestseller?: boolean;
  discount?: number;
  stock?: number;
}

interface ProductCardProps {
  product: ProductCardProduct;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { toast } = useToast();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);
  const isOutOfStock = product.stock !== undefined && product.stock <= 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      setIsAddingToCart(true);
      await api.post('/user/cart', { productId: product.id, quantity: 1 });
      toast({ title: 'Added to cart successfully' });
    } catch (error: any) {
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        toast({ title: 'Please login to add items to cart', variant: 'destructive' });
      } else {
        toast({ title: error.message || 'Failed to add to cart', variant: 'destructive' });
      }
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (isWishlisted) {
        await removeFromWishlist(product.id);
      } else {
        await addToWishlist(product.id);
      }
    } catch (error: any) {
      toast({ title: error.message || 'Failed to update wishlist', variant: 'destructive' });
    }
  };

  return (
    <Link to={`/product/${product.slug || product.id}`} className="block" data-testid={`link-product-${product.id}`}>
      <div className="card-product group">
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          <img
            src={product.image || '/placeholder.jpg'}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://placehold.co/300x400?text=No+Image';
            }}
          />
          
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {isOutOfStock && (
              <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">OUT OF STOCK</span>
            )}
            {product.isNew && !isOutOfStock && (
              <span className="badge-new">NEW</span>
            )}
            {product.discount && !isOutOfStock && (
              <span className="badge-sale">-{product.discount}%</span>
            )}
            {product.isBestseller && !isOutOfStock && (
              <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">BESTSELLER</span>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-3 right-3 rounded-full bg-card/90 shadow-card transition-all ${
              isWishlisted ? "text-primary" : "text-muted-foreground"
            }`}
            onClick={handleWishlist}
            data-testid={`button-wishlist-${product.id}`}
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
          </Button>

          {!isOutOfStock && (
            <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <Button 
                className="w-full btn-primary rounded-full text-sm font-semibold gap-2"
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                data-testid={`button-add-to-cart-${product.id}`}
              >
                <ShoppingCart className="h-4 w-4" />
                {isAddingToCart ? 'Adding...' : 'Add to Cart'}
              </Button>
            </div>
          )}
        </div>

        <div className="p-3 md:p-4">
          {product.category && (
            <span className="text-[10px] md:text-xs text-primary font-medium uppercase tracking-wide">
              {product.category}
            </span>
          )}
          <h3 className="font-medium text-foreground text-sm md:text-base mt-1 line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 mt-2">
            <span className="font-bold text-foreground text-sm md:text-base">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-muted-foreground text-xs line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
