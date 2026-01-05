import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { Package, ShoppingBag, Truck, CheckCircle, XCircle, Clock, Eye, RotateCcw } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';

interface OrderItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

interface Order {
  _id: string;
  orderId: string;
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
  trackingUrl?: string;
  createdAt: string;
  deliveredAt?: string;
  cancelReason?: string;
  returnReason?: string;
}

const orderStatusTabs = [
  { value: 'all', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const getStatusBadge = (status: string) => {
  const statusMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
    pending: { variant: 'secondary', label: 'Pending' },
    confirmed: { variant: 'default', label: 'Confirmed' },
    processing: { variant: 'default', label: 'Processing' },
    shipped: { variant: 'default', label: 'Shipped' },
    delivered: { variant: 'default', label: 'Delivered' },
    cancelled: { variant: 'destructive', label: 'Cancelled' },
    returned: { variant: 'destructive', label: 'Returned' },
  };
  const config = statusMap[status] || { variant: 'secondary' as const, label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(price);
};

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadOrders();
  }, [activeTab]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const status = activeTab === 'all' ? undefined : activeTab;
      const params = status ? `?status=${status}` : '';
      const data = await api.get<{ orders: Order[]; total: number }>(`/user/orders${params}`);
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Failed to load orders:', error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    try {
      setIsSubmitting(true);
      await api.post(`/user/orders/${selectedOrder._id}/cancel`, { reason: cancelReason });
      toast({ title: 'Order cancelled successfully' });
      setShowCancelDialog(false);
      setCancelReason('');
      setSelectedOrder(null);
      loadOrders();
    } catch (error: any) {
      toast({ title: error.message || 'Failed to cancel order', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturnOrder = async () => {
    if (!selectedOrder) return;
    try {
      setIsSubmitting(true);
      await api.post(`/user/orders/${selectedOrder._id}/return`, { reason: returnReason });
      toast({ title: 'Return request submitted successfully' });
      setShowReturnDialog(false);
      setReturnReason('');
      setSelectedOrder(null);
      loadOrders();
    } catch (error: any) {
      toast({ title: error.message || 'Failed to submit return request', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canCancel = (status: string) => ['pending', 'confirmed'].includes(status);
  const canReturn = (status: string) => status === 'delivered';

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Orders</h1>
          <p className="text-muted-foreground">Track and manage your orders</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-muted rounded w-1/4" />
                  <div className="h-20 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Orders</h1>
        <p className="text-muted-foreground">Track and manage your orders</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap">
          {orderStatusTabs.map((tab) => (
            <TabsTrigger 
              key={tab.value} 
              value={tab.value}
              data-testid={`tab-orders-${tab.value}`}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {orders.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No orders found</h3>
                  <p className="text-muted-foreground mb-6">
                    {activeTab === 'all' 
                      ? "You haven't placed any orders yet. Start shopping to see your orders here."
                      : `No ${activeTab} orders found.`}
                  </p>
                  <Link to="/">
                    <Button data-testid="button-shop-now">
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Shop Now
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order._id}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">Order #{order.orderId}</span>
                          {getStatusBadge(order.orderStatus)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Placed on {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatPrice(order.total)}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 border-t pt-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex gap-4">
                          <img 
                            src={item.image || '/placeholder.jpg'} 
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.size && `Size: ${item.size}`}
                              {item.size && item.color && ' | '}
                              {item.color && `Color: ${item.color}`}
                            </p>
                            <p className="text-sm">
                              {formatPrice(item.price)} x {item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {order.trackingNumber && (
                      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4" />
                          <span className="text-sm">Tracking: {order.trackingNumber}</span>
                          {order.trackingUrl && (
                            <a 
                              href={order.trackingUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary text-sm hover:underline"
                            >
                              Track Shipment
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                      <Link to={`/track-order?orderId=${order.orderId}`}>
                        <Button variant="outline" size="sm" data-testid={`button-track-${order.orderId}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          Track Order
                        </Button>
                      </Link>
                      
                      {canCancel(order.orderStatus) && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowCancelDialog(true);
                          }}
                          data-testid={`button-cancel-${order.orderId}`}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Cancel Order
                        </Button>
                      )}

                      {canReturn(order.orderStatus) && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowReturnDialog(true);
                          }}
                          data-testid={`button-return-${order.orderId}`}
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Return Order
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel order #{selectedOrder?.orderId}?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Reason for cancellation</label>
              <Textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please provide a reason for cancellation"
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                Keep Order
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleCancelOrder}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Cancelling...' : 'Cancel Order'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return Order</DialogTitle>
            <DialogDescription>
              Request a return for order #{selectedOrder?.orderId}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Reason for return</label>
              <Textarea
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                placeholder="Please describe why you want to return this order"
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowReturnDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleReturnOrder}
                disabled={isSubmitting || !returnReason.trim()}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Return Request'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
