import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { api } from '@/lib/api';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

interface WishlistItem {
  productId: {
    _id: string;
    name: string;
    price: number;
    images: string[];
  };
  addedAt: Date;
}

interface Wishlist {
  _id: string;
  userId: string;
  items: WishlistItem[];
  createdAt: Date;
  updatedAt: Date;
}

interface WishlistContextType {
  wishlist: Wishlist | null;
  isLoading: boolean;
  itemCount: number;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isUserLoading } = useAuth();
  const { toast } = useToast();

  const refreshWishlist = useCallback(async () => {
    if (!user) {
      setWishlist(null);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const data = await api.get<Wishlist>('/user/wishlist');
      setWishlist(data);
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
      setWishlist(null);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Only fetch wishlist after auth loading is complete
    if (!isUserLoading) {
      refreshWishlist();
    }
  }, [refreshWishlist, isUserLoading]);

  const addToWishlist = async (productId: string) => {
    if (!user) {
      toast({ title: 'Please login to save items', variant: 'destructive' });
      return;
    }
    try {
      setIsLoading(true);
      await api.post('/user/wishlist', { productId });
      await refreshWishlist();
      toast({ title: 'Added to wishlist' });
    } catch (error: any) {
      toast({ title: error.message || 'Failed to add to wishlist', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      setIsLoading(true);
      await api.delete(`/user/wishlist/${productId}`);
      await refreshWishlist();
      toast({ title: 'Removed from wishlist' });
    } catch (error: any) {
      toast({ title: error.message || 'Failed to remove from wishlist', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const isInWishlist = useCallback((productId: string) => {
    if (!wishlist) return false;
    return wishlist.items.some(item => item.productId._id === productId);
  }, [wishlist]);

  const itemCount = wishlist?.items?.length || 0;

  return (
    <WishlistContext.Provider value={{
      wishlist,
      isLoading,
      itemCount,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      refreshWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
