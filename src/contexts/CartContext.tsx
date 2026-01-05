import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { api } from '@/lib/api';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  _id: string;
  productId: {
    _id: string;
    name: string;
    price: number;
    images: string[];
    stock: number;
  };
  quantity: number;
  size?: string;
  color?: string;
}

interface Cart {
  _id: string;
  items: CartItem[];
  couponCode?: string;
}

interface CartContextType {
  cart: Cart | null;
  isLoading: boolean;
  itemCount: number;
  total: number;
  addToCart: (productId: string, quantity?: number, size?: string, color?: string, suppressToast?: boolean) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }
    try {
      setIsLoading(true);
      const data = await api.get<Cart>('/user/cart');
      setCart(data);
    } catch {
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId: string, quantity = 1, size?: string, color?: string, suppressToast = false) => {
    if (!user) {
      toast({ title: 'Please login to add items to cart', variant: 'destructive' });
      return;
    }
    try {
      setIsLoading(true);
      await api.post('/user/cart', { productId, quantity, size, color });
      await refreshCart();
      if (!suppressToast) {
        toast({ title: 'Added to cart' });
      }
    } catch (error: any) {
      toast({ title: error.message || 'Failed to add to cart', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      setIsLoading(true);
      await api.put(`/user/cart/${itemId}`, { quantity });
      await refreshCart();
    } catch (error: any) {
      toast({ title: error.message || 'Failed to update cart', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      setIsLoading(true);
      await api.delete(`/user/cart/${itemId}`);
      await refreshCart();
      toast({ title: 'Removed from cart' });
    } catch (error: any) {
      toast({ title: error.message || 'Failed to remove item', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setIsLoading(true);
      await api.delete('/user/cart');
      await refreshCart();
    } catch (error: any) {
      toast({ title: 'Failed to clear cart', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const total = cart?.items?.reduce((sum, item) => {
    const price = item.productId?.price || 0;
    return sum + (price * item.quantity);
  }, 0) || 0;

  return (
    <CartContext.Provider value={{
      cart,
      isLoading,
      itemCount,
      total,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      refreshCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
