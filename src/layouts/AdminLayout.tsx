import { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  LayoutDashboard, 
  LayoutGrid, 
  FolderTree, 
  Image, 
  Users, 
  LogOut, 
  Menu,
  Home,
  Package,
  ShoppingCart,
  CreditCard,
  UserCheck,
  Wallet,
  ArrowLeftRight,
  Gift,
  Share2,
  Star,
  MessageSquare,
  Bell,
  FileText,
  HelpCircle,
  Settings,
  Activity,
  ChevronDown,
  ChevronRight,
  Layers,
  Tags,
  Truck,
  RotateCcw,
  Percent,
  ClipboardList,
  DollarSign,
  TrendingUp,
  Award,
  History,
  Video
} from 'lucide-react';

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

interface SidebarItem {
  icon: any;
  label: string;
  path: string;
  badge?: number;
}

const sidebarSections: SidebarSection[] = [
  {
    title: 'Core Admin',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
      { icon: Users, label: 'Users', path: '/admin/users' },
      { icon: UserCheck, label: 'Influencers', path: '/admin/influencers' },
    ]
  },
  {
    title: 'Products & Catalog',
    items: [
      { icon: Package, label: 'Products', path: '/admin/products' },
      { icon: LayoutGrid, label: 'Categories', path: '/admin/categories' },
      { icon: FolderTree, label: 'Subcategories', path: '/admin/subcategories' },
      { icon: Layers, label: 'Inventory', path: '/admin/inventory' },
      { icon: Tags, label: 'Attributes', path: '/admin/attributes' },
      { icon: Image, label: 'Media Gallery', path: '/admin/media' },
      { icon: Star, label: 'Reviews', path: '/admin/reviews' },
    ]
  },
  {
    title: 'Orders & Sales',
    items: [
      { icon: ShoppingCart, label: 'Orders', path: '/admin/orders' },
      { icon: RotateCcw, label: 'Returns/Refunds', path: '/admin/returns' },
      { icon: Truck, label: 'Shiprocket', path: '/admin/shiprocket' },
      { icon: Percent, label: 'Coupons', path: '/admin/coupons' },
    ]
  },
  {
    title: 'Payments & Finance',
    items: [
      { icon: CreditCard, label: 'Payments', path: '/admin/payments' },
      { icon: ArrowLeftRight, label: 'Transactions', path: '/admin/transactions' },
      { icon: Wallet, label: 'User Wallets', path: '/admin/user-wallets' },
      { icon: Wallet, label: 'Influencer Wallets', path: '/admin/influencer-wallets' },
      { icon: DollarSign, label: 'Payout Requests', path: '/admin/payouts' },
      { icon: TrendingUp, label: 'Commission Settings', path: '/admin/commission' },
    ]
  },
  {
    title: 'Referral & Rewards',
    items: [
      { icon: Share2, label: 'Referrals', path: '/admin/referrals' },
      { icon: Gift, label: 'Rewards Rules', path: '/admin/rewards' },
      { icon: History, label: 'Reward History', path: '/admin/reward-history' },
      { icon: Award, label: 'Tier System', path: '/admin/tiers' },
    ]
  },
  {
    title: 'Support & CMS',
    items: [
      { icon: MessageSquare, label: 'Support Tickets', path: '/admin/tickets' },
      { icon: Bell, label: 'Announcements', path: '/admin/announcements' },
      { icon: FileText, label: 'Pages (CMS)', path: '/admin/pages' },
      { icon: Image, label: 'Banners', path: '/admin/banners' },
      { icon: Video, label: 'Social Media Videos', path: '/admin/social-media' },
      { icon: HelpCircle, label: 'FAQs', path: '/admin/faqs' },
    ]
  },
  {
    title: 'System',
    items: [
      { icon: Settings, label: 'Settings', path: '/admin/settings' },
      { icon: ClipboardList, label: 'Audit Logs', path: '/admin/audit-logs' },
      { icon: Activity, label: 'Analytics', path: '/admin/analytics' },
    ]
  }
];

export default function AdminLayout() {
  const { admin, isAdminLoading, adminLogout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isAdminLoading && !admin) {
      navigate('/admin/login');
    }
  }, [admin, isAdminLoading, navigate]);

  const handleLogout = async () => {
    await adminLogout();
    navigate('/admin/login');
  };

  const toggleSection = (title: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  if (isAdminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  return (
    <div className="min-h-screen flex bg-background">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-card border-r transition-all duration-300 flex flex-col h-screen sticky top-0`}>
        <div className="p-4 border-b flex items-center justify-between gap-2">
          {sidebarOpen && <h1 className="font-bold text-lg">Admin Panel</h1>}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            data-testid="button-toggle-sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        
        <ScrollArea className="flex-1">
          <nav className="p-2 space-y-4">
            {sidebarSections.map((section) => (
              <div key={section.title}>
                {sidebarOpen && (
                  <button
                    onClick={() => toggleSection(section.title)}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
                    data-testid={`button-section-${section.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <span>{section.title}</span>
                    {collapsedSections[section.title] ? (
                      <ChevronRight className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </button>
                )}
                
                {!collapsedSections[section.title] && (
                  <div className="space-y-0.5 mt-1">
                    {section.items.map((item) => {
                      const isActive = location.pathname === item.path;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                            isActive 
                              ? 'bg-primary text-primary-foreground' 
                              : 'hover:bg-accent'
                          }`}
                          data-testid={`link-admin-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                          title={!sidebarOpen ? item.label : undefined}
                        >
                          <item.icon className="h-4 w-4 flex-shrink-0" />
                          {sidebarOpen && (
                            <span className="text-sm truncate">{item.label}</span>
                          )}
                          {item.badge !== undefined && sidebarOpen && (
                            <span className="ml-auto bg-destructive text-destructive-foreground text-xs px-1.5 py-0.5 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </ScrollArea>

        <div className="p-2 border-t space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors"
            data-testid="link-admin-storefront"
          >
            <Home className="h-4 w-4 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm">View Store</span>}
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors text-left"
            data-testid="button-admin-logout"
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="bg-card border-b p-4 flex items-center justify-between gap-4 sticky top-0 z-10">
          <div>
            <span className="text-muted-foreground">Welcome,</span>
            <span className="font-semibold ml-1" data-testid="text-admin-name">{admin.name}</span>
          </div>
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded capitalize" data-testid="text-admin-role">
            {admin.role}
          </span>
        </header>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
