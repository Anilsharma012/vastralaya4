import { useState, useEffect } from "react";
import { Search, Package, Eye, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface OrderItem {
  productId: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

interface Order {
  _id: string;
  orderId: string;
  userId: { _id: string; name: string; email: string; phone?: string };
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingCharge: number;
  total: number;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  trackingNumber?: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  processing: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  shipped: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  returned: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
};

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const query = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const data = await api.get<{ orders: Order[] }>(`/admin/orders${query}`);
      setOrders(data.orders);
    } catch (error) {
      toast({ title: "Error loading orders", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.put(`/admin/orders/${orderId}`, { orderStatus: newStatus });
      toast({ title: `Order status updated to ${newStatus}` });
      loadOrders();
      if (selectedOrder?._id === orderId) {
        setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
      }
    } catch (error) {
      toast({ title: "Error updating order", variant: "destructive" });
    }
  };

  const updatePaymentStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.put(`/admin/orders/${orderId}`, { paymentStatus: newStatus });
      toast({ title: `Payment status updated to ${newStatus}` });
      loadOrders();
    } catch (error) {
      toast({ title: "Error updating payment", variant: "destructive" });
    }
  };

  const processRefund = async (orderId: string) => {
    if (!confirm("Are you sure you want to process a refund for this order?")) return;
    try {
      await api.post(`/admin/orders/${orderId}/refund`, {});
      toast({ title: "Refund processed successfully" });
      loadOrders();
    } catch (error) {
      toast({ title: "Error processing refund", variant: "destructive" });
    }
  };

  const filteredOrders = orders.filter(o =>
    o.orderId.toLowerCase().includes(search.toLowerCase()) ||
    o.shippingAddress.name.toLowerCase().includes(search.toLowerCase()) ||
    o.shippingAddress.phone.includes(search)
  );

  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', { 
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Orders</h1>
          <p className="text-muted-foreground">Manage customer orders and fulfillment</p>
        </div>
        <Button onClick={loadOrders} variant="outline" data-testid="button-refresh">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
        <TabsList className="flex flex-wrap w-full justify-start gap-1">
          <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
          <TabsTrigger value="pending" data-testid="tab-pending">Pending</TabsTrigger>
          <TabsTrigger value="confirmed" data-testid="tab-confirmed">Confirmed</TabsTrigger>
          <TabsTrigger value="processing" data-testid="tab-processing">Processing</TabsTrigger>
          <TabsTrigger value="shipped" data-testid="tab-shipped">Shipped</TabsTrigger>
          <TabsTrigger value="delivered" data-testid="tab-delivered">Delivered</TabsTrigger>
          <TabsTrigger value="returned" data-testid="tab-returned">Returned</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by order ID, name, or phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" data-testid="input-search-orders" />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="h-20 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No orders found</h3>
            <p className="text-muted-foreground">Orders will appear here when customers place them</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order._id} data-testid={`card-order-${order._id}`}>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono font-bold">{order.orderId}</span>
                      <Badge className={statusColors[order.orderStatus]}>
                        {order.orderStatus.toUpperCase()}
                      </Badge>
                      <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                        {order.paymentStatus}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{order.shippingAddress.name} - {order.shippingAddress.phone}</p>
                    <p className="text-sm text-muted-foreground">{order.items.length} item(s) | Rs. {order.total.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Select value={order.orderStatus} onValueChange={(v) => updateOrderStatus(order._id, v)}>
                      <SelectTrigger className="w-[140px]" data-testid={`select-status-${order._id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="returned">Returned</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={() => openOrderDetail(order)} data-testid={`button-view-${order._id}`}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.orderId}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Select value={selectedOrder.orderStatus} onValueChange={(v) => updateOrderStatus(selectedOrder._id, v)}>
                    <SelectTrigger data-testid="select-detail-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="returned">Returned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-muted-foreground">Payment</Label>
                  <Select value={selectedOrder.paymentStatus} onValueChange={(v) => updatePaymentStatus(selectedOrder._id, v)}>
                    <SelectTrigger data-testid="select-detail-payment">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Customer</Label>
                <p className="font-medium">{selectedOrder.userId?.name || selectedOrder.shippingAddress.name}</p>
                <p className="text-sm text-muted-foreground">{selectedOrder.userId?.email}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Shipping Address</Label>
                <p>{selectedOrder.shippingAddress.name}</p>
                <p>{selectedOrder.shippingAddress.phone}</p>
                <p>{selectedOrder.shippingAddress.address}</p>
                <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Items</Label>
                <div className="space-y-2 mt-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 bg-muted rounded">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Size: {item.size || 'N/A'} | Color: {item.color || 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p>Rs. {item.price} x {item.quantity}</p>
                        <p className="font-bold">Rs. {item.price * item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-1">
                <div className="flex justify-between"><span>Subtotal</span><span>Rs. {selectedOrder.subtotal}</span></div>
                {selectedOrder.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-Rs. {selectedOrder.discount}</span></div>}
                <div className="flex justify-between"><span>Shipping</span><span>{selectedOrder.shippingCharge > 0 ? `Rs. ${selectedOrder.shippingCharge}` : 'FREE'}</span></div>
                <div className="flex justify-between font-bold text-lg"><span>Total</span><span>Rs. {selectedOrder.total}</span></div>
              </div>

              {selectedOrder.orderStatus === 'delivered' && selectedOrder.paymentStatus !== 'refunded' && (
                <Button variant="destructive" onClick={() => processRefund(selectedOrder._id)} data-testid="button-refund">
                  Process Refund
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersPage;
