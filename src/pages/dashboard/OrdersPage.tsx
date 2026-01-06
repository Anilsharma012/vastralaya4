import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { Package, ShoppingBag, Truck, CheckCircle, XCircle, Clock, Eye, RotateCcw, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format, differenceInHours } from 'date-fns';

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
  hasReturnRequest?: boolean;
  returnStatus?: string;
  returnId?: string;
}

interface ReturnInfo {
  orderId: string;
  returnId: string;
  status: string;
}

const orderStatusTabs = [
  { value: 'all', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'returns', label: 'Returns' },
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

const getReturnStatusBadge = (status: string) => {
  const statusMap: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string; className?: string }> = {
    pending: { variant: 'outline', label: 'Return Requested', className: 'border-orange-500 text-orange-600' },
    approved: { variant: 'outline', label: 'Return Approved', className: 'border-blue-500 text-blue-600' },
    rejected: { variant: 'destructive', label: 'Return Rejected' },
    pickup_scheduled: { variant: 'outline', label: 'Pickup Scheduled', className: 'border-purple-500 text-purple-600' },
    picked_up: { variant: 'outline', label: 'Picked Up', className: 'border-indigo-500 text-indigo-600' },
    received: { variant: 'outline', label: 'Received', className: 'border-cyan-500 text-cyan-600' },
    inspecting: { variant: 'outline', label: 'Inspecting', className: 'border-teal-500 text-teal-600' },
    refund_initiated: { variant: 'outline', label: 'Refund Initiated', className: 'border-green-500 text-green-600' },
    refund_completed: { variant: 'default', label: 'Refund Completed' },
  };
  const config = statusMap[status] || { variant: 'outline' as const, label: status };
  return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
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
  const [returnInfoMap, setReturnInfoMap] = useState<Record<string, ReturnInfo>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [showReturnDetailsDialog, setShowReturnDetailsDialog] = useState(false);
  const [selectedReturnInfo, setSelectedReturnInfo] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [upiId, setUpiId] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const getReturnEligibility = (order: Order) => {
    if (order.orderStatus !== 'delivered') {
      return { eligible: false, reason: 'Order must be delivered first' };
    }
    if (!order.deliveredAt) {
      return { eligible: false, reason: 'Delivery date not recorded' };
    }
    const hoursSinceDelivery = differenceInHours(new Date(), new Date(order.deliveredAt));
    if (hoursSinceDelivery > 72) {
      return { eligible: false, reason: 'Return window expired (3 days from delivery)' };
    }
    const hoursRemaining = 72 - hoursSinceDelivery;
    return { eligible: true, hoursRemaining: Math.max(0, hoursRemaining) };
  };

  useEffect(() => {
    loadOrders();
  }, [activeTab]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      
      // If returns tab, fetch returns instead
      if (activeTab === 'returns') {
        const returnsData = await api.get<{ returns: any[] }>('/user/returns');
        const orderIds = returnsData.returns?.map(r => r.orderId?._id) || [];
        
        // Fetch full order details for these orders
        const ordersWithReturns: Order[] = [];
        const returnMap: Record<string, ReturnInfo> = {};
        
        for (const ret of returnsData.returns || []) {
          if (ret.orderId) {
            ordersWithReturns.push({
              ...ret.orderId,
              hasReturnRequest: true,
              returnStatus: ret.status,
              returnId: ret._id
            });
            returnMap[ret.orderId._id] = {
              orderId: ret.orderId._id,
              returnId: ret._id,
              status: ret.status
            };
          }
        }
        
        setOrders(ordersWithReturns);
        setReturnInfoMap(returnMap);
      } else {
        const status = activeTab === 'all' ? undefined : activeTab;
        const params = status ? `?status=${status}` : '';
        const [ordersData, returnsData] = await Promise.all([
          api.get<{ orders: Order[]; total: number }>(`/user/orders${params}`),
          api.get<{ returns: any[] }>('/user/returns')
        ]);
        
        // Build return info map
        const returnMap: Record<string, ReturnInfo> = {};
        for (const ret of returnsData.returns || []) {
          if (ret.orderId?._id) {
            returnMap[ret.orderId._id] = {
              orderId: ret.orderId._id,
              returnId: ret._id,
              status: ret.status
            };
          }
        }
        setReturnInfoMap(returnMap);
        
        // Mark orders that have returns
        const ordersWithReturnInfo = (ordersData.orders || []).map(order => ({
          ...order,
          hasReturnRequest: !!returnMap[order._id],
          returnStatus: returnMap[order._id]?.status,
          returnId: returnMap[order._id]?.returnId
        }));
        
        setOrders(ordersWithReturnInfo);
      }
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
    
    if (!returnReason.trim()) {
      toast({ title: 'Please provide a return reason', variant: 'destructive' });
      return;
    }
    
    if (!bankAccountNumber.trim() && !upiId.trim()) {
      toast({ title: 'Please provide bank account number or UPI ID for refund', variant: 'destructive' });
      return;
    }
    
    if (upiId && !/^[\w.-]+@[\w]+$/.test(upiId)) {
      toast({ title: 'Invalid UPI ID format (e.g., name@upi)', variant: 'destructive' });
      return;
    }
    
    try {
      setIsSubmitting(true);
      await api.post(`/user/orders/${selectedOrder._id}/return`, { 
        reason: returnReason,
        bankAccountNumber: bankAccountNumber.trim() || undefined,
        upiId: upiId.trim() || undefined,
        accountHolderName: accountHolderName.trim() || undefined
      });
      toast({ title: 'Return request submitted successfully' });
      setShowReturnDialog(false);
      setReturnReason('');
      setBankAccountNumber('');
      setUpiId('');
      setAccountHolderName('');
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
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-semibold">Order #{order.orderId}</span>
                          {getStatusBadge(order.orderStatus)}
                          {order.hasReturnRequest && order.returnStatus && getReturnStatusBadge(order.returnStatus)}
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

                      {order.hasReturnRequest ? (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={async () => {
                            try {
                              const returnData = await api.get<{ return: any }>(`/user/returns/${order.returnId}`);
                              setSelectedReturnInfo(returnData.return);
                              setShowReturnDetailsDialog(true);
                            } catch (error) {
                              toast({ title: 'Failed to load return details', variant: 'destructive' });
                            }
                          }}
                          data-testid={`button-view-return-${order.orderId}`}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Return
                        </Button>
                      ) : order.orderStatus === 'delivered' && (() => {
                        const eligibility = getReturnEligibility(order);
                        if (eligibility.eligible) {
                          return (
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
                          );
                        } else {
                          return (
                            <Button 
                              variant="outline" 
                              size="sm"
                              disabled
                              className="opacity-50"
                              data-testid={`button-return-${order.orderId}`}
                            >
                              <AlertCircle className="h-4 w-4 mr-1" />
                              {eligibility.reason}
                            </Button>
                          );
                        }
                      })()}
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Return Order</DialogTitle>
            <DialogDescription>
              Request a return for order #{selectedOrder?.orderId}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedOrder && selectedOrder.deliveredAt && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Return window: {Math.max(0, 72 - differenceInHours(new Date(), new Date(selectedOrder.deliveredAt)))} hours remaining
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="returnReason">Reason for return *</Label>
              <Textarea
                id="returnReason"
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                placeholder="Please describe why you want to return this order"
              />
            </div>
            
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-3">Refund Details (Bank Account OR UPI required)</p>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="bankAccountNumber">Bank Account Number</Label>
                  <Input
                    id="bankAccountNumber"
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                    placeholder="Enter your bank account number"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="upiId">UPI ID</Label>
                  <Input
                    id="upiId"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g., yourname@upi"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="accountHolderName">Account Holder Name (Optional)</Label>
                  <Input
                    id="accountHolderName"
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value)}
                    placeholder="Name as per bank account"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => {
                setShowReturnDialog(false);
                setReturnReason('');
                setBankAccountNumber('');
                setUpiId('');
                setAccountHolderName('');
              }}>
                Cancel
              </Button>
              <Button 
                onClick={handleReturnOrder}
                disabled={isSubmitting || !returnReason.trim() || (!bankAccountNumber.trim() && !upiId.trim())}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Return Request'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showReturnDetailsDialog} onOpenChange={setShowReturnDetailsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Return Request Details</DialogTitle>
            <DialogDescription>
              View the status and details of your return request
            </DialogDescription>
          </DialogHeader>
          {selectedReturnInfo && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Status:</span>
                {getReturnStatusBadge(selectedReturnInfo.status)}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Return ID</p>
                  <p className="font-medium">{selectedReturnInfo.returnId}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Requested On</p>
                  <p className="font-medium">{format(new Date(selectedReturnInfo.createdAt), 'MMM dd, yyyy')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Refund Amount</p>
                  <p className="font-medium">{formatPrice(selectedReturnInfo.refundAmount || 0)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Refund Status</p>
                  <p className="font-medium capitalize">{selectedReturnInfo.refundStatus || 'Pending'}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-1">Reason</p>
                <p className="text-sm bg-muted p-3 rounded-lg">{selectedReturnInfo.reason}</p>
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Items</h4>
                <div className="space-y-2">
                  {selectedReturnInfo.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{item.name} x {item.quantity}</span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setShowReturnDetailsDialog(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
