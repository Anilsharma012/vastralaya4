import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";

const CartPage = () => {
  const { cart, isLoading, updateQuantity, removeFromCart, total } = useCart();
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setUpdatingItem(itemId);
    await updateQuantity(itemId, newQuantity);
    setUpdatingItem(null);
  };

  const handleRemoveItem = async (itemId: string) => {
    setUpdatingItem(itemId);
    await removeFromCart(itemId);
    setUpdatingItem(null);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const shippingCharge = total >= 999 ? 0 : 99;
  const grandTotal = total + shippingCharge;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="h-32 bg-muted rounded" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12 text-center">
          <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
          <h1 className="text-2xl font-bold mb-4" data-testid="text-empty-cart">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">Looks like you haven't added anything to your cart yet.</p>
          <Button asChild>
            <Link to="/" data-testid="link-continue-shopping">Continue Shopping</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-8" data-testid="text-cart-title">Shopping Cart ({cart.items.length} items)</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <Card key={item._id} data-testid={`card-cart-item-${item._id}`}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="w-24 h-32 bg-muted rounded overflow-hidden flex-shrink-0">
                      {item.productId?.images?.[0] ? (
                        <img 
                          src={item.productId.images[0]} 
                          alt={item.productId.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <ShoppingBag className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground line-clamp-2">{item.productId?.name}</h3>
                      {(item.size || item.color) && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.size && `Size: ${item.size}`}
                          {item.size && item.color && ' | '}
                          {item.color && `Color: ${item.color}`}
                        </p>
                      )}
                      <p className="font-bold mt-2">{formatPrice(item.productId?.price || 0)}</p>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || updatingItem === item._id}
                            data-testid={`button-decrease-${item._id}`}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                            disabled={updatingItem === item._id}
                            data-testid={`button-increase-${item._id}`}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleRemoveItem(item._id)}
                          disabled={updatingItem === item._id}
                          data-testid={`button-remove-${item._id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold mb-4">Order Summary</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{shippingCharge > 0 ? formatPrice(shippingCharge) : 'FREE'}</span>
                  </div>
                  {total < 999 && (
                    <p className="text-xs text-muted-foreground">
                      Add {formatPrice(999 - total)} more for free shipping!
                    </p>
                  )}
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatPrice(grandTotal)}</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full mt-6 gap-2" 
                  size="lg"
                  onClick={() => navigate('/checkout')}
                  data-testid="button-checkout"
                >
                  Proceed to Checkout
                  <ArrowRight className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full mt-3"
                  asChild
                >
                  <Link to="/" data-testid="link-continue-shopping-summary">Continue Shopping</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CartPage;
