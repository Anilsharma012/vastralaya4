import { useState, useEffect } from "react";
import { 
  Users, ShoppingBag, DollarSign, TrendingUp, Link2, Copy, 
  BarChart3, CreditCard, Clock
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

export default function InfluencerStatsPage() {
  const { toast } = useToast();
  const [stats, setStats] = useState<Stats | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const influencer = await api.get<any>('/user/influencer');
      if (!influencer || influencer.status !== 'approved') {
        toast({
          title: 'Not an Influencer',
          description: 'You need to be an approved influencer to view stats',
          variant: 'destructive'
        });
        return;
      }

      const [dashboardData, referralsData, ordersData, earningsData] = await Promise.all([
        api.get<{ stats: any, recentReferrals: any[] }>('/influencer/dashboard').catch(() => null),
        api.get<{ referrals: Referral[] }>('/influencer/referrals').catch(() => ({ referrals: [] })),
        api.get<{ orders: Order[] }>('/influencer/orders').catch(() => ({ orders: [] })),
        api.get<{ payouts: Payout[], monthlyEarnings: any[], commission: any }>('/influencer/earnings').catch(() => ({ payouts: [], monthlyEarnings: [], commission: {} }))
      ]);
      
      setReferrals(referralsData?.referrals || []);
      setOrders(ordersData?.orders || []);
      setPayouts(earningsData?.payouts || []);

      const dashStats = dashboardData?.stats || {};
      
      const calculatedStats: Stats = {
        totalReferrals: dashStats.totalReferrals ?? 0,
        monthlyReferrals: dashStats.monthlyReferrals ?? 0,
        weeklyReferrals: dashStats.weeklyReferrals ?? 0,
        totalOrders: dashStats.totalOrders ?? 0,
        monthlyOrders: dashStats.monthlyOrders ?? 0,
        totalSales: dashStats.totalSales ?? 0,
        monthlySales: dashStats.monthlySales ?? 0,
        pendingPayouts: dashStats.pendingPayouts ?? 0,
        rate: dashStats.rate ?? influencer?.commission?.rate ?? 5,
        pendingAmount: dashStats.pendingAmount ?? 0,
        availableAmount: dashStats.availableAmount ?? 0,
        paidAmount: dashStats.paidAmount ?? 0,
        totalEarned: dashStats.totalEarned ?? 0,
        tier: dashStats.tier ?? influencer?.tier ?? 'bronze',
        referralCode: dashStats.referralCode ?? influencer?.referralCode ?? '',
        referralLink: dashStats.referralLink ?? influencer?.referralLink ?? ''
      };

      setStats(calculatedStats);
    } catch (error) {
      console.error('Failed to load stats:', error);
      toast({
        title: 'Failed to load stats',
        description: 'Please try again later',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
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
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading your stats...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Stats</h1>
          <p className="text-muted-foreground">Your influencer performance metrics</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">You are not an approved influencer. <a href="/dashboard/influencer" className="text-primary underline">Apply now</a></p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Stats</h1>
        <p className="text-muted-foreground">Your influencer performance metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Referrals</p>
                <p className="text-2xl font-bold">{stats.totalReferrals}</p>
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
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
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
                <p className="text-2xl font-bold">Rs. {stats.totalSales?.toLocaleString() || 0}</p>
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
                <p className="text-2xl font-bold text-green-600">Rs. {stats.availableAmount?.toLocaleString() || 0}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Your Referral Link</p>
              <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4 text-muted-foreground" />
                <code className="text-sm bg-muted px-2 py-1 rounded">{stats.referralLink}</code>
                <Button size="icon" variant="ghost" onClick={() => copyToClipboard(stats.referralLink || '')}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Referral Code</p>
              <div className="flex items-center gap-2">
                <code className="text-lg font-bold bg-primary/10 px-3 py-1 rounded">{stats.referralCode}</code>
                <Button size="icon" variant="ghost" onClick={() => copyToClipboard(stats.referralCode || '')}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Commission Rate</p>
              <p className="text-2xl font-bold text-primary">{stats.rate || 5}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="referrals">
            <Users className="h-4 w-4 mr-2" />
            Referrals
          </TabsTrigger>
          <TabsTrigger value="orders">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="payouts">
            <CreditCard className="h-4 w-4 mr-2" />
            Payouts
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
                  <span className="font-bold">{stats.monthlyReferrals || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Orders</span>
                  <span className="font-bold">{stats.monthlyOrders || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sales</span>
                  <span className="font-bold">Rs. {stats.monthlySales?.toLocaleString() || 0}</span>
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
                  <span className="font-bold text-yellow-600">Rs. {stats.pendingAmount?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Available</span>
                  <span className="font-bold text-green-600">Rs. {stats.availableAmount?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Paid</span>
                  <span className="font-bold">Rs. {stats.paidAmount?.toLocaleString() || 0}</span>
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
                      <div className={`w-4 h-4 rounded-full ${getTierColor(tier)} ${stats.tier === tier ? 'ring-2 ring-offset-2 ring-primary' : 'opacity-50'}`} />
                      <span className={stats.tier === tier ? 'font-bold' : 'text-muted-foreground'}>
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
                          +Rs. {((order.total * (stats.rate || 5)) / 100).toFixed(0)} commission
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts">
          <Card>
            <CardHeader>
              <CardTitle>Payout History</CardTitle>
              <CardDescription>Your commission payouts</CardDescription>
            </CardHeader>
            <CardContent>
              {payouts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No payouts yet</p>
              ) : (
                <div className="space-y-4">
                  {payouts.map((payout) => (
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
