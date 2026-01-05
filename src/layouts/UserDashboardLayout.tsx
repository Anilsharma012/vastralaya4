import { useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import logo from '@/assets/logo.jpg';
import { 
  User,
  ShoppingBag,
  Heart,
  MapPin,
  Wallet,
  Gift,
  Share2,
  MessageSquare,
  Settings,
  LogOut,
  Home,
  CreditCard,
  History,
  Star,
  Bell,
  UserCheck,
  TrendingUp,
  Award,
  ChevronLeft,
} from 'lucide-react';

const menuSections = [
  {
    title: 'My Account',
    items: [
      { icon: Home, label: 'Dashboard', path: '/dashboard' },
      { icon: User, label: 'Profile', path: '/dashboard/profile' },
      { icon: Bell, label: 'Notifications', path: '/dashboard/notifications' },
      { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
    ]
  },
  {
    title: 'Shopping',
    items: [
      { icon: ShoppingBag, label: 'My Orders', path: '/dashboard/orders' },
      { icon: Heart, label: 'Wishlist', path: '/dashboard/wishlist' },
      { icon: Star, label: 'My Reviews', path: '/dashboard/reviews' },
      { icon: MapPin, label: 'Addresses', path: '/dashboard/addresses' },
    ]
  },
  {
    title: 'Wallet & Payments',
    items: [
      { icon: Wallet, label: 'My Wallet', path: '/dashboard/wallet' },
      { icon: History, label: 'Transactions', path: '/dashboard/transactions' },
      { icon: CreditCard, label: 'Payment Methods', path: '/dashboard/payments' },
    ]
  },
  {
    title: 'Rewards & Referrals',
    items: [
      { icon: Gift, label: 'Rewards', path: '/dashboard/rewards' },
      { icon: Share2, label: 'Refer & Earn', path: '/dashboard/referrals' },
    ]
  },
  {
    title: 'Influencer Program',
    items: [
      { icon: UserCheck, label: 'Influencer Hub', path: '/dashboard/influencer' },
      { icon: TrendingUp, label: 'My Stats', path: '/dashboard/influencer/stats' },
      { icon: Award, label: 'Commission', path: '/dashboard/influencer/commission' },
    ]
  },
  {
    title: 'Support',
    items: [
      { icon: MessageSquare, label: 'Support Tickets', path: '/dashboard/tickets' },
    ]
  }
];

export default function UserDashboardLayout() {
  const { user, isUserLoading, userLogout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isUserLoading && !user) {
      navigate('/login');
    }
  }, [user, isUserLoading, navigate]);

  const handleLogout = async () => {
    await userLogout();
    navigate('/');
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="loading-dashboard">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader className="border-b border-border p-4">
            <Link to="/" className="flex items-center gap-2" data-testid="link-dashboard-logo">
              <img 
                src={logo} 
                alt="Shri Balaji Vastralya" 
                className="w-10 h-10 rounded-full object-cover border-2 border-accent" 
              />
              <div>
                <h1 className="font-display text-sm font-bold text-primary leading-tight">SHRI BALAJI</h1>
                <span className="text-[8px] tracking-[0.15em] text-muted-foreground">VASTRALYA</span>
              </div>
            </Link>
          </SidebarHeader>

          <SidebarContent>
            {menuSections.map((section) => (
              <SidebarGroup key={section.title}>
                <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {section.items.map((item) => {
                      const isActive = location.pathname === item.path;
                      return (
                        <SidebarMenuItem key={item.path}>
                          <SidebarMenuButton asChild isActive={isActive}>
                            <Link 
                              to={item.path}
                              data-testid={`link-dashboard-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                            >
                              <item.icon className="h-4 w-4" />
                              <span>{item.label}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>

          <SidebarFooter className="border-t border-border p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" data-testid="text-user-name">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate" data-testid="text-user-email">{user.email}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full" 
              onClick={handleLogout}
              data-testid="button-dashboard-logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between gap-4 px-4 py-3 border-b border-border bg-background/95 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <SidebarTrigger data-testid="button-dashboard-sidebar-toggle" />
              <Link 
                to="/" 
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                data-testid="link-back-to-store"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Store
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" data-testid="button-header-notifications">
                <Bell className="h-5 w-5" />
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-muted/30">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
