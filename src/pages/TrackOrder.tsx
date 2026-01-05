import { useState } from "react";
import { Search, Package, Truck, CheckCircle, Clock, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";
import { storeInfo } from "@/data/products";

interface OrderItem {
  productId: { _id: string; name: string; images: string[]; slug: string } | null;
  name: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
}

interface TrackingData {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  items: OrderItem[];
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
  totalAmount: number;
  statusHistory: Array<{ status: string; timestamp: string; note?: string }>;
}

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: Package },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'processing', label: 'Processing', icon: Clock },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: MapPin },
];

const getStatusIndex = (status: string) => {
  const statusMap: Record<string, number> = {
    'pending': 0,
    'confirmed': 1,
    'processing': 2,
    'shipped': 3,
    'out_for_delivery': 3,
    'delivered': 4,
    'cancelled': -1,
    'return_requested': 4,
    'returned': 4,
    'refunded': 4,
  };
  return statusMap[status] ?? 0;
};

const TrackOrder = () => {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) {
      setError("Please enter an order ID");
      return;
    }

    setLoading(true);
    setError(null);
    setTracking(null);

    try {
      const params = new URLSearchParams({ orderId: orderId.trim() });
      if (email.trim()) params.append('email', email.trim());
      
      const data = await api.get<TrackingData>(`/public/track-order?${params}`);
      setTracking(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Order not found. Please check your order ID.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const currentStatusIndex = tracking ? getStatusIndex(tracking.status) : -1;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="bg-primary/10 py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2" data-testid="text-track-title">
            Track Your Order
          </h1>
          <p className="text-muted-foreground">Enter your order ID to track your shipment</p>
        </div>
      </div>

      <section className="py-10 md:py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <Card className="mb-8">
            <CardContent className="pt-6">
              <form onSubmit={handleTrack} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Order ID *</label>
                    <Input
                      placeholder="e.g., ORD-20241231-ABC123"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      data-testid="input-order-id"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Email (Optional)</label>
                    <Input
                      type="email"
                      placeholder="Your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      data-testid="input-email"
                    />
                  </div>
                </div>
                <Button type="submit" className="btn-primary w-full" disabled={loading} data-testid="button-track">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                  Track Order
                </Button>
              </form>
              {error && (
                <p className="text-red-500 text-sm mt-4 text-center" data-testid="text-error">{error}</p>
              )}
            </CardContent>
          </Card>

          {tracking && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg">Order #{tracking.orderNumber}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">Placed on {formatDate(tracking.createdAt)}</p>
                    </div>
                    <Badge 
                      variant={tracking.status === 'delivered' ? 'default' : tracking.status === 'cancelled' ? 'destructive' : 'secondary'}
                      className="text-sm"
                      data-testid="badge-status"
                    >
                      {tracking.status.replace(/_/g, ' ').toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {tracking.status !== 'cancelled' && (
                    <div className="mb-8">
                      <div className="flex items-center justify-between relative">
                        <div className="absolute top-5 left-0 right-0 h-0.5 bg-border" />
                        <div 
                          className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500"
                          style={{ width: `${Math.max(0, (currentStatusIndex / (statusSteps.length - 1)) * 100)}%` }}
                        />
                        {statusSteps.map((step, index) => {
                          const isCompleted = index <= currentStatusIndex;
                          const isCurrent = index === currentStatusIndex;
                          const Icon = step.icon;
                          return (
                            <div key={step.key} className="flex flex-col items-center relative z-10">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                                isCompleted ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                              } ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                                <Icon className="h-5 w-5" />
                              </div>
                              <span className={`text-xs mt-2 text-center ${isCompleted ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {tracking.trackingNumber && (
                    <div className="bg-muted/50 rounded-lg p-4 mb-6">
                      <p className="text-sm">
                        <strong>Tracking Number:</strong> {tracking.trackingNumber}
                      </p>
                      {tracking.trackingUrl && (
                        <a 
                          href={tracking.trackingUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary text-sm hover:underline mt-1 block"
                          data-testid="link-track-shipment"
                        >
                          Track on Courier Website
                        </a>
                      )}
                      {tracking.estimatedDelivery && (
                        <p className="text-sm mt-2">
                          <strong>Estimated Delivery:</strong> {formatDate(tracking.estimatedDelivery)}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-foreground mb-3">Shipping Address</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p className="font-medium text-foreground">{tracking.shippingAddress.name}</p>
                        <p>{tracking.shippingAddress.address}</p>
                        <p>{tracking.shippingAddress.city}, {tracking.shippingAddress.state} {tracking.shippingAddress.pincode}</p>
                        <p>Phone: {tracking.shippingAddress.phone}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-3">Order Summary</h4>
                      <div className="text-sm space-y-2">
                        {tracking.items.map((item, index) => (
                          <div key={index} className="flex justify-between">
                            <span className="text-muted-foreground">
                              {item.name} x{item.quantity}
                              {item.size && ` (${item.size})`}
                            </span>
                            <span className="text-foreground">{formatPrice(item.price * item.quantity)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between font-semibold pt-2 border-t">
                          <span>Total</span>
                          <span>{formatPrice(tracking.totalAmount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {tracking.statusHistory && tracking.statusHistory.length > 0 && (
                    <div className="mt-6 pt-6 border-t">
                      <h4 className="font-semibold text-foreground mb-3">Order Timeline</h4>
                      <div className="space-y-3">
                        {tracking.statusHistory.slice().reverse().map((entry, index) => (
                          <div key={index} className="flex gap-3 text-sm">
                            <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-foreground capitalize">
                                {entry.status.replace(/_/g, ' ')}
                              </p>
                              <p className="text-muted-foreground">{formatDate(entry.timestamp)}</p>
                              {entry.note && <p className="text-muted-foreground">{entry.note}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground text-sm mb-2">Need help with your order?</p>
                  <p className="font-medium">Contact us at <a href={`mailto:${storeInfo.email}`} className="text-primary hover:underline">{storeInfo.email}</a></p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TrackOrder;
