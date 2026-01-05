import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, ShoppingBag, DollarSign, TrendingUp, Link2, Copy, 
  LogOut, User, Settings, CreditCard, BarChart3, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface Stats {
  totalReferrals: number;
  monthlyReferrals: number;
  weeklyReferrals: number;
  totalOrders: number;
  monthlyOrders: number;
  totalSales: number;
  monthlySales: number;
  pendingPayouts: number;
  rate: number;
  pendingAmount: number;
  availableAmount: number;
  paidAmount: number;
  totalEarned: number;
  tier: string;
  referralCode: string;
  referralLink: string;
}

interface Referral {
  _id: string;
  referredId: { name: string; email: string; createdAt: string };
  orderId?: { orderId: string; total: number; orderStatus: string };
  commission: number;
  status: string;
  createdAt: string;
}

interface Order {
  _id: string;
  orderId: string;
  total: number;
  orderStatus: string;
  paymentStatus: string;
  userId: { name: string; email: string };
  createdAt: string;
}

interface Payout {
  _id: string;
  amount: number;
  method: string;
  status: string;
  createdAt: string;
  processedAt?: string;
}

const InfluencerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [influencer, setInfluencer] = useState<any>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [earnings, setEarnings] = useState<{ payouts: Payout[], monthlyEarnings: any[] }>({ payouts: [], monthlyEarnings: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const stored = localStorage.getItem('influencer');
    const token = localStorage.getItem('influencer_token');

    if (!stored || !token) {
      navigate('/influencer/login');
      return;
    }

    // Restore token to API client
    api.setToken(token);
    setInfluencer(JSON.parse(stored));
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      const [dashboardData, referralsData, ordersData, earningsData] = await Promise.all([
        api.get<{ stats: Stats }>('/influencer/dashboard'),
        api.get<{ referrals: Referral[] }>('/influencer/referrals'),
        api.get<{ orders: Order[] }>('/influencer/orders'),
        api.get<{ payouts: Payout[], monthlyEarnings: any[], commission: any }>('/influencer/earnings')
      ]);
      
      setStats(dashboardData.stats);
      setReferrals(referralsData.referrals || []);
      setOrders(ordersData.orders || []);
      setEarnings({ payouts: earningsData.payouts || [], monthlyEarnings: earningsData.monthlyEarnings || [] });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/influencer/logout', {});
    } catch (error) {}
    localStorage.removeItem('influencer');
    navigate('/influencer/login');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      bronze: 'bg-amber-600',
      silver: 'bg-gray-400',
      gold: 'bg-yellow-500',
      platinum: 'bg-blue-400',
      diamond: 'bg-purple-500'
    };
    return colors[tier] || 'bg-gray-500';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-lg">{influencer?.name}</h1>
              <div className="flex items-center gap-2">
                <Badge className={getTierColor(stats?.tier || 'bronze')}>
                  {stats?.tier?.toUpperCase()} Tier
                </Badge>
                <span className="text-sm text-muted-foreground">@{influencer?.username}</span>
              </div>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} data-testid="button-logout">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Referrals</p>
                  <p className="text-2xl font-bold">{stats?.totalReferrals || 0}</p>
                </div>
                <Users className="h-8 w-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{stats?.totalOrders || 0}</p>
                </div>
                <ShoppingBag className="h-8 w-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Sales</p>
                  <p className="text-2xl font-bold">Rs. {stats?.totalSales?.toLocaleString() || 0}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Available Balance</p>
                  <p className="text-2xl font-bold text-green-600">Rs. {stats?.availableAmount?.toLocaleString() || 0}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Your Referral Link</p>
                <div className="flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-muted-foreground" />
                  <code className="text-sm bg-muted px-2 py-1 rounded">{stats?.referralLink}</code>
                  <Button size="icon" variant="ghost" onClick={() => copyToClipboard(stats?.referralLink || '')}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Referral Code</p>
                <div className="flex items-center gap-2">
                  <code className="text-lg font-bold bg-primary/10 px-3 py-1 rounded">{stats?.referralCode}</code>
                  <Button size="icon" variant="ghost" onClick={() => copyToClipboard(stats?.referralCode || '')}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Commission Rate</p>
                <p className="text-2xl font-bold text-primary">{stats?.rate || 5}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview" data-testid="tab-overview">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="referrals" data-testid="tab-referrals">
              <Users className="h-4 w-4 mr-2" />
              Referrals
            </TabsTrigger>
            <TabsTrigger value="orders" data-testid="tab-orders">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="earnings" data-testid="tab-earnings">
              <CreditCard className="h-4 w-4 mr-2" />
              Earnings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">This Month</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Referrals</span>
                    <span className="font-bold">{stats?.monthlyReferrals || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Orders</span>
                    <span className="font-bold">{stats?.monthlyOrders || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sales</span>
                    <span className="font-bold">Rs. {stats?.monthlySales?.toLocaleString() || 0}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Commission Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pending</span>
                    <span className="font-bold text-yellow-600">Rs. {stats?.pendingAmount?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Available</span>
                    <span className="font-bold text-green-600">Rs. {stats?.availableAmount?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Paid</span>
                    <span className="font-bold">Rs. {stats?.paidAmount?.toLocaleString() || 0}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tier Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {['bronze', 'silver', 'gold', 'platinum', 'diamond'].map((tier, index) => (
                      <div key={tier} className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full ${getTierColor(tier)} ${stats?.tier === tier ? 'ring-2 ring-offset-2 ring-primary' : 'opacity-50'}`} />
                        <span className={stats?.tier === tier ? 'font-bold' : 'text-muted-foreground'}>
                          {tier.charAt(0).toUpperCase() + tier.slice(1)}
                        </span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {[5, 6, 7, 8, 10][index]}%
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="referrals">
            <Card>
              <CardHeader>
                <CardTitle>Your Referrals</CardTitle>
                <CardDescription>Users who signed up using your referral link</CardDescription>
              </CardHeader>
              <CardContent>
                {referrals.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No referrals yet</p>
                ) : (
                  <div className="space-y-4">
                    {referrals.map((ref) => (
                      <div key={ref._id} className="flex flex-wrap items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">{ref.referredId?.name || 'User'}</p>
                          <p className="text-sm text-muted-foreground">{ref.referredId?.email}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={ref.orderId ? 'default' : 'secondary'}>
                            {ref.orderId ? 'Converted' : 'Registered'}
                          </Badge>
                          {ref.orderId && (
                            <p className="text-sm text-green-600 mt-1">Rs. {ref.commission || 0} earned</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Referred Orders</CardTitle>
                <CardDescription>Orders placed through your referral link</CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No orders yet</p>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order._id} className="flex flex-wrap items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">#{order.orderId}</p>
                          <p className="text-sm text-muted-foreground">{order.userId?.name}</p>
                        </div>
                        <div className="text-center">
                          <Badge variant={order.orderStatus === 'delivered' ? 'default' : 'secondary'}>
                            {order.orderStatus}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">Rs. {order.total?.toLocaleString()}</p>
                          <p className="text-sm text-green-600">
                            +Rs. {((order.total * (stats?.rate || 5)) / 100).toFixed(0)} commission
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="earnings">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payout History</CardTitle>
                </CardHeader>
                <CardContent>
                  {earnings.payouts.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No payouts yet</p>
                  ) : (
                    <div className="space-y-4">
                      {earnings.payouts.map((payout) => (
                        <div key={payout._id} className="flex flex-wrap items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium">Rs. {payout.amount.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">via {payout.method}</p>
                          </div>
                          <Badge variant={payout.status === 'completed' ? 'default' : payout.status === 'pending' ? 'secondary' : 'destructive'}>
                            {payout.status}
                          </Badge>
                          <div className="text-right text-sm text-muted-foreground">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {new Date(payout.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default InfluencerDashboard;
