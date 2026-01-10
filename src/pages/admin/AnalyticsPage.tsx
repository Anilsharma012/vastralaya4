import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, DollarSign, Package, Users, ShoppingCart, Star, Truck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface Analytics {
  overview: {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalUsers: number;
    totalInfluencers: number;
    avgOrderValue: number;
  };
  orders: {
    pending: number;
    confirmed: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    returned: number;
  };
  topProducts: Array<{ name: string; sales: number; revenue: number }>;
  recentOrders: Array<{ orderNumber: string; total: number; status: string; date: string }>;
}

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const stats = await api.get<any>('/admin/stats');
      setAnalytics({
        overview: {
          totalRevenue: stats.totalRevenue || 0,
          totalOrders: stats.orders || 0,
          totalProducts: stats.products || 0,
          totalUsers: stats.users || 0,
          totalInfluencers: stats.influencers || 0,
          avgOrderValue: stats.avgOrderValue || 0
        },
        orders: stats.ordersByStatus || {
          pending: 0, confirmed: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0, returned: 0
        },
        topProducts: stats.topProducts || [],
        recentOrders: stats.recentOrders || []
      });
    } catch (error) {
      console.log("Using default analytics");
      setAnalytics({
        overview: { totalRevenue: 0, totalOrders: 0, totalProducts: 0, totalUsers: 0, totalInfluencers: 0, avgOrderValue: 0 },
        orders: { pending: 0, confirmed: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0, returned: 0 },
        topProducts: [],
        recentOrders: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading analytics...</div>;
  }

  if (!analytics) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold" data-testid="text-page-title">Analytics Dashboard</h1>
        <Badge variant="outline">Last updated: {new Date().toLocaleString()}</Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-xs text-muted-foreground">Revenue</div>
                <div className="text-xl font-bold">₹{analytics.overview.totalRevenue?.toLocaleString() || 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-xs text-muted-foreground">Orders</div>
                <div className="text-xl font-bold">{analytics.overview.totalOrders || 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-xs text-muted-foreground">Products</div>
                <div className="text-xl font-bold">{analytics.overview.totalProducts || 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-xs text-muted-foreground">Customers</div>
                <div className="text-xl font-bold">{analytics.overview.totalUsers || 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="text-xs text-muted-foreground">Influencers</div>
                <div className="text-xl font-bold">{analytics.overview.totalInfluencers || 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-cyan-600" />
              <div>
                <div className="text-xs text-muted-foreground">Avg Order</div>
                <div className="text-xl font-bold">₹{analytics.overview.avgOrderValue?.toLocaleString() || 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Order Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Pending</span>
                <Badge variant="secondary">{analytics.orders.pending}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Confirmed</span>
                <Badge variant="outline">{analytics.orders.confirmed}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Processing</span>
                <Badge variant="outline">{analytics.orders.processing}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Shipped</span>
                <Badge>{analytics.orders.shipped}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Delivered</span>
                <Badge variant="default">{analytics.orders.delivered}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Cancelled</span>
                <Badge variant="destructive">{analytics.orders.cancelled}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Returned</span>
                <Badge variant="destructive">{analytics.orders.returned}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Selling Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.topProducts.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No sales data yet</p>
            ) : (
              <div className="space-y-3">
                {analytics.topProducts.slice(0, 5).map((product, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">#{index + 1}</span>
                      <span className="truncate max-w-[200px]">{product.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">₹{product.revenue.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">{product.sales} sold</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.recentOrders.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No orders yet</p>
          ) : (
            <div className="border rounded-md">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">Order</th>
                    <th className="text-right p-3 font-medium">Amount</th>
                    <th className="text-center p-3 font-medium">Status</th>
                    <th className="text-right p-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.recentOrders.slice(0, 10).map((order, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-3 font-mono">{order.orderNumber}</td>
                      <td className="p-3 text-right font-semibold">₹{order.total.toLocaleString()}</td>
                      <td className="p-3 text-center">
                        <Badge variant={order.status === "delivered" ? "default" : "secondary"}>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-right text-muted-foreground">
                        {new Date(order.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
