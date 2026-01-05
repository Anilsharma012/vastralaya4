import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function WishlistPage() {
  const { wishlist, isLoading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [isAddingToCart, setIsAddingToCart] = useState<string | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = async (productId: string) => {
    try {
      setIsAddingToCart(productId);
      await addToCart(productId, 1);
    } finally {
      setIsAddingToCart(null);
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      await removeFromWishlist(productId);
    } catch (error) {
      toast({ title: 'Failed to remove item', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Wishlist</h1>
          <p className="text-muted-foreground">Items you've saved for later</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading wishlist...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const items = wishlist?.items || [];

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Wishlist</h1>
          <p className="text-muted-foreground">Items you've saved for later</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Your wishlist is empty</h3>
              <p className="text-muted-foreground mb-6">
                Save items you love by clicking the heart icon on products.
              </p>
              <Link to="/">
                <Button data-testid="button-browse-products">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Browse Products
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Wishlist</h1>
        <p className="text-muted-foreground">Items you've saved for later ({items.length})</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <Card key={item.productId._id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <Link to={`/product/${item.productId._id}`}>
              <div className="relative overflow-hidden bg-muted aspect-square">
                <img
                  src={item.productId.images?.[0] || ''}
                  alt={item.productId.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            </Link>
            <CardContent className="pt-4">
              <Link to={`/product/${item.productId._id}`} className="block mb-2">
                <h3 className="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors">
                  {item.productId.name}
                </h3>
              </Link>

              <div className="mb-4">
                <p className="text-lg font-bold text-primary">
                  {formatPrice(item.productId.price)}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="default"
                  className="flex-1"
                  onClick={() => handleAddToCart(item.productId._id)}
                  disabled={isAddingToCart === item.productId._id}
                  data-testid={`button-add-to-cart-${item.productId._id}`}
                >
                  <ShoppingBag className="h-4 w-4 mr-1" />
                  {isAddingToCart === item.productId._id ? 'Adding...' : 'Add to Cart'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => handleRemove(item.productId._id)}
                  data-testid={`button-remove-wishlist-${item.productId._id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
