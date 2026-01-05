import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Plus, Edit2, Trash2, Home, Briefcase } from 'lucide-react';

export default function AddressesPage() {
  const [addresses] = useState<any[]>([]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">My Addresses</h1>
          <p className="text-muted-foreground">Manage your delivery addresses</p>
        </div>
        <Button data-testid="button-add-address">
          <Plus className="h-4 w-4 mr-2" />
          Add New Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <MapPin className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No addresses saved</h3>
              <p className="text-muted-foreground mb-6">
                Add your delivery address to make checkout faster.
              </p>
              <Button data-testid="button-add-first-address">
                <Plus className="h-4 w-4 mr-2" />
                Add Address
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <Card key={address._id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    {address.type === 'home' ? (
                      <Home className="h-4 w-4 text-primary" />
                    ) : (
                      <Briefcase className="h-4 w-4 text-primary" />
                    )}
                    <span className="font-semibold capitalize">{address.type}</span>
                    {address.isDefault && <Badge variant="secondary">Default</Badge>}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="font-medium">{address.name}</p>
                <p className="text-sm text-muted-foreground">{address.phone}</p>
                <p className="text-sm mt-2">{address.address}</p>
                <p className="text-sm">{address.city}, {address.state} - {address.pincode}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
