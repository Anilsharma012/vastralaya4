import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Trash2, 
  Plus,
  CheckCircle,
  Lock
} from 'lucide-react';

interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'netbanking';
  name: string;
  lastFour: string;
  expiryDate?: string;
  isDefault: boolean;
  createdAt: string;
}

export default function PaymentMethodsPage() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      name: 'Visa Card',
      lastFour: '4242',
      expiryDate: '12/25',
      isDefault: true,
      createdAt: '2024-01-15'
    }
  ]);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSetDefault = (id: string) => {
    setPaymentMethods(paymentMethods.map(method => ({
      ...method,
      isDefault: method.id === id
    })));
  };

  const handleDelete = (id: string) => {
    setPaymentMethods(paymentMethods.filter(method => method.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Payment Methods</h1>
          <p className="text-muted-foreground">Manage your payment methods</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} data-testid="button-add-payment">
          <Plus className="h-4 w-4 mr-2" />
          Add Payment Method
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Payment Method</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Card Holder Name</Label>
              <Input placeholder="John Doe" data-testid="input-cardholder" />
            </div>

            <div className="space-y-2">
              <Label>Card Number</Label>
              <Input placeholder="1234 5678 9012 3456" data-testid="input-cardnumber" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Expiry Date</Label>
                <Input placeholder="MM/YY" data-testid="input-expiry" />
              </div>
              <div className="space-y-2">
                <Label>CVV</Label>
                <Input placeholder="123" type="password" data-testid="input-cvv" />
              </div>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1" data-testid="button-save-payment">Save</Button>
              <Button variant="outline" className="flex-1" onClick={() => setShowAddForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {paymentMethods.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No payment methods added yet</p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>
            </CardContent>
          </Card>
        ) : (
          paymentMethods.map((method) => (
            <Card key={method.id} data-testid={`card-payment-${method.id}`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{method.name}</h3>
                        {method.isDefault && (
                          <Badge variant="default" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Default
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">•••• {method.lastFour}</p>
                      {method.expiryDate && (
                        <p className="text-xs text-muted-foreground">Expires {method.expiryDate}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!method.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(method.id)}
                        data-testid={`button-default-${method.id}`}
                      >
                        Set Default
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(method.id)}
                      data-testid={`button-delete-${method.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Your payment data is secure</h3>
            <p className="text-sm text-muted-foreground mb-3">
              All payment information is encrypted and stored securely. We use industry-standard security protocols to protect your financial data.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                SSL/TLS encryption
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                PCI DSS compliance
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Secure payment gateway
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
