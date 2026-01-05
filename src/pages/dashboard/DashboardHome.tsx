import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import {
  ShoppingBag,
  Heart,
  MapPin,
  Wallet,
  Gift,
  Share2,
  ArrowRight,
  Package,
  Truck,
  CheckCircle
} from 'lucide-react';

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  wishlistItems: number;
  walletBalance: number;
}

export default function DashboardHome() {
  const { user, isUserLoading } = useAuth();
  const { itemCount: wishlistCount } = useWishlist();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user || isUserLoading) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const data = await api.get<DashboardStats>('/user/stats');
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user, isUserLoading]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const quickStats = [
    { icon: ShoppingBag, label: 'Total Orders', value: stats?.totalOrders || '0', color: 'text-blue-500' },
    { icon: Heart, label: 'Wishlist Items', value: wishlistCount || stats?.wishlistItems || '0', color: 'text-red-500' },
    { icon: Wallet, label: 'Wallet Balance', value: stats ? formatPrice(stats.walletBalance) : '₹0', color: 'text-green-500' },
    { icon: Gift, label: 'Reward Points', value: '0', color: 'text-purple-500' },
  ];

  const quickLinks = [
    { icon: ShoppingBag, label: 'My Orders', path: '/dashboard/orders', description: 'Track your orders' },
    { icon: Heart, label: 'Wishlist', path: '/dashboard/wishlist', description: 'Your saved items' },
    { icon: MapPin, label: 'Addresses', path: '/dashboard/addresses', description: 'Manage delivery addresses' },
    { icon: Wallet, label: 'Wallet', path: '/dashboard/wallet', description: 'Check balance & transactions' },
    { icon: Share2, label: 'Refer & Earn', path: '/dashboard/referrals', description: 'Invite friends and earn' },
    { icon: Gift, label: 'Rewards', path: '/dashboard/rewards', description: 'View your rewards' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" data-testid="text-dashboard-title">
          Welcome back, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-muted-foreground">Here's what's happening with your account</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold" data-testid={`text-stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">No orders yet</p>
            <Link to="/">
              <Button data-testid="button-start-shopping">Start Shopping</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickLinks.map((link) => (
          <Link key={link.path} to={link.path}>
            <Card className="hover-elevate h-full">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <link.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{link.label}</h3>
                      <p className="text-sm text-muted-foreground">{link.description}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
