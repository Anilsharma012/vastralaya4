import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MapPin, CreditCard, Check, Banknote, Smartphone } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { api } from "@/lib/api";

interface Address {
  _id: string;
  type: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

interface PaymentSettings {
  codEnabled: boolean;
  onlineEnabled: boolean;
  razorpayEnabled: boolean;
  razorpayKeyId: string;
  minOrderAmount: number;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const CheckoutPage = () => {
  const { cart, total, clearCart, isLoading: cartLoading } = useCart();
  const location = useLocation();
  const buyNowProduct = (location.state as any)?.buyNowProduct;

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("cod");
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    codEnabled: true,
    onlineEnabled: false,
    razorpayEnabled: false,
    razorpayKeyId: '',
    minOrderAmount: 500
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const [newAddress, setNewAddress] = useState({
    type: 'home',
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [addressData, settingsData] = await Promise.all([
        api.get<Address[]>('/user/addresses').catch(() => []),
        api.get<{ settings: any }>('/public/settings').catch(() => ({ settings: null }))
      ]);
      
      setAddresses(addressData);
      const defaultAddr = addressData.find(a => a.isDefault);
      if (defaultAddr) setSelectedAddress(defaultAddr._id);
      
      if (settingsData.settings?.payments) {
        setPaymentSettings(settingsData.settings.payments);
        if (!settingsData.settings.payments.codEnabled && settingsData.settings.payments.onlineEnabled) {
          setPaymentMethod('online');
        }
      }
    } catch {
      setAddresses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAddress = async () => {
    try {
      const saved = await api.post<Address>('/user/addresses', newAddress);
      setAddresses([...addresses, saved]);
      setSelectedAddress(saved._id);
      setShowAddressForm(false);
      setNewAddress({ type: 'home', name: '', phone: '', address: '', city: '', state: '', pincode: '', isDefault: true });
      toast({ title: 'Address saved successfully' });
    } catch (error: any) {
      toast({ title: error.message || 'Failed to save address', variant: 'destructive' });
    }
  };

  const initiateRazorpayPayment = async (orderId: string, amount: number) => {
    if (!paymentSettings.razorpayKeyId) {
      toast({ title: 'Online payment not configured', variant: 'destructive' });
      return false;
    }

    return new Promise<boolean>((resolve) => {
      const options = {
        key: paymentSettings.razorpayKeyId,
        amount: amount * 100,
        currency: 'INR',
        name: 'Shri Balaji Vastralya',
        description: `Order #${orderId}`,
        handler: async function(response: any) {
          try {
            await api.post('/user/orders/verify-payment', {
              orderId,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            });
            resolve(true);
          } catch {
            resolve(false);
          }
        },
        prefill: {
          name: addresses.find(a => a._id === selectedAddress)?.name || '',
          contact: addresses.find(a => a._id === selectedAddress)?.phone || ''
        },
        theme: {
          color: '#1e3a5f'
        },
        modal: {
          ondismiss: function() {
            resolve(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    });
  };

  const placeOrder = async () => {
    if (!selectedAddress) {
      toast({ title: 'Please select a delivery address', variant: 'destructive' });
      return;
    }

    if (!buyNowProduct && !cart?.items.length) {
      toast({ title: 'Your cart is empty', variant: 'destructive' });
      return;
    }

    try {
      setIsPlacingOrder(true);
      const address = addresses.find(a => a._id === selectedAddress);

      // Use buyNowProduct if available, otherwise use cart items
      const items = buyNowProduct
        ? [{
            productId: buyNowProduct.productId,
            quantity: buyNowProduct.quantity,
            size: buyNowProduct.size,
            color: buyNowProduct.color
          }]
        : cart.items.map(item => ({
            productId: item.productId._id,
            quantity: item.quantity,
            size: item.size,
            color: item.color
          }));

      const orderData = {
        items,
        shippingAddress: {
          name: address?.name || '',
          phone: address?.phone || '',
          address: address?.address || '',
          city: address?.city || '',
          state: address?.state || '',
          pincode: address?.pincode || ''
        },
        paymentMethod
      };

      const order = await api.post<{ _id: string; orderId: string; total: number }>('/user/orders', orderData);

      if (paymentMethod === 'online' && paymentSettings.razorpayEnabled) {
        const paymentSuccess = await initiateRazorpayPayment(order.orderId, order.total);
        if (!paymentSuccess) {
          toast({ title: 'Payment failed or cancelled. Your order is saved as pending.', variant: 'destructive' });
          navigate('/dashboard/orders');
          return;
        }
      }

      // Only clear cart if using cart items, not for buy now
      if (!buyNowProduct) {
        await clearCart();
      }
      toast({ title: 'Order placed successfully!' });
      navigate('/dashboard/orders');
    } catch (error: any) {
      toast({ title: error.message || 'Failed to place order', variant: 'destructive' });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Calculate total for buy now or cart
  const checkoutTotal = buyNowProduct
    ? (buyNowProduct.price * buyNowProduct.quantity)
    : total;

  const shippingCharge = checkoutTotal >= 999 ? 0 : 99;
  const grandTotal = checkoutTotal + shippingCharge;

  if (isLoading || cartLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-8" data-testid="text-checkout-title">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                {addresses.length > 0 ? (
                  <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress}>
                    {addresses.map((addr) => (
                      <div key={addr._id} className="flex items-start space-x-3 p-4 border rounded-lg mb-2">
                        <RadioGroupItem value={addr._id} id={addr._id} data-testid={`radio-address-${addr._id}`} />
                        <label htmlFor={addr._id} className="flex-1 cursor-pointer">
                          <div className="font-medium">{addr.name} ({addr.type})</div>
                          <div className="text-sm text-muted-foreground">{addr.phone}</div>
                          <div className="text-sm text-muted-foreground">{addr.address}, {addr.city}, {addr.state} - {addr.pincode}</div>
                        </label>
                      </div>
                    ))}
                  </RadioGroup>
                ) : null}
                
                {!showAddressForm ? (
                  <Button variant="outline" onClick={() => setShowAddressForm(true)} className="mt-4" data-testid="button-add-address">
                    Add New Address
                  </Button>
                ) : (
                  <div className="mt-4 space-y-4 p-4 border rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Full Name</Label>
                        <Input value={newAddress.name} onChange={(e) => setNewAddress({...newAddress, name: e.target.value})} data-testid="input-address-name" />
                      </div>
                      <div>
                        <Label>Phone Number</Label>
                        <Input value={newAddress.phone} onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})} data-testid="input-address-phone" />
                      </div>
                    </div>
                    <div>
                      <Label>Address</Label>
                      <Input value={newAddress.address} onChange={(e) => setNewAddress({...newAddress, address: e.target.value})} data-testid="input-address-street" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>City</Label>
                        <Input value={newAddress.city} onChange={(e) => setNewAddress({...newAddress, city: e.target.value})} data-testid="input-address-city" />
                      </div>
                      <div>
                        <Label>State</Label>
                        <Input value={newAddress.state} onChange={(e) => setNewAddress({...newAddress, state: e.target.value})} data-testid="input-address-state" />
                      </div>
                      <div>
                        <Label>Pincode</Label>
                        <Input value={newAddress.pincode} onChange={(e) => setNewAddress({...newAddress, pincode: e.target.value})} data-testid="input-address-pincode" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={saveAddress} data-testid="button-save-address">Save Address</Button>
                      <Button variant="outline" onClick={() => setShowAddressForm(false)}>Cancel</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  {paymentSettings.codEnabled && (
                    <div className="flex items-center space-x-3 p-4 border rounded-lg mb-2">
                      <RadioGroupItem value="cod" id="cod" data-testid="radio-payment-cod" />
                      <label htmlFor="cod" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Banknote className="h-5 w-5 text-green-600" />
                          <span className="font-medium">Cash on Delivery</span>
                        </div>
                        <div className="text-sm text-muted-foreground">Pay when you receive your order</div>
                      </label>
                    </div>
                  )}
                  
                  {paymentSettings.onlineEnabled && paymentSettings.razorpayEnabled && (
                    <div className="flex items-center space-x-3 p-4 border rounded-lg mb-2">
                      <RadioGroupItem value="online" id="online" data-testid="radio-payment-online" />
                      <label htmlFor="online" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-5 w-5 text-blue-600" />
                          <span className="font-medium">Online Payment</span>
                        </div>
                        <div className="text-sm text-muted-foreground">UPI, Cards, Net Banking via Razorpay</div>
                      </label>
                    </div>
                  )}

                  {!paymentSettings.codEnabled && !paymentSettings.onlineEnabled && (
                    <div className="text-center py-6 text-muted-foreground">
                      No payment methods available. Please contact support.
                    </div>
                  )}
                </RadioGroup>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold mb-4">Order Summary</h2>
                
                <div className="space-y-3 mb-4">
                  {buyNowProduct ? (
                    <div className="flex gap-3">
                      <div className="w-12 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                        {buyNowProduct.image && (
                          <img src={buyNowProduct.image} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm line-clamp-1">{buyNowProduct.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {buyNowProduct.quantity}</p>
                        {buyNowProduct.size && <p className="text-xs text-muted-foreground">Size: {buyNowProduct.size}</p>}
                        <p className="text-sm font-medium">{formatPrice(buyNowProduct.price * buyNowProduct.quantity)}</p>
                      </div>
                    </div>
                  ) : (
                    cart?.items.map((item) => (
                      <div key={item._id} className="flex gap-3">
                        <div className="w-12 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                          {item.productId?.images?.[0] && (
                            <img src={item.productId.images[0]} alt="" className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm line-clamp-1">{item.productId?.name}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                          <p className="text-sm font-medium">{formatPrice((item.productId?.price || 0) * item.quantity)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(checkoutTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{shippingCharge > 0 ? formatPrice(shippingCharge) : 'FREE'}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatPrice(grandTotal)}</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full mt-6 gap-2" 
                  size="lg"
                  onClick={placeOrder}
                  disabled={isPlacingOrder || !selectedAddress || (!paymentSettings.codEnabled && !paymentSettings.onlineEnabled)}
                  data-testid="button-place-order"
                >
                  {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
                  <Check className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CheckoutPage;
