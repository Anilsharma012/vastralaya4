import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { MapPin, Plus, Edit2, Trash2, Home, Briefcase, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Address {
  _id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  type: 'home' | 'work' | 'other';
  isDefault: boolean;
}

const emptyAddress: Omit<Address, '_id'> = {
  name: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  landmark: '',
  type: 'home',
  isDefault: false
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState(emptyAddress);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const data = await api.get<Address[]>('/user/addresses');
      setAddresses(data);
    } catch (error: any) {
      toast({ title: error.message || 'Failed to load addresses', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const openAddDialog = () => {
    setEditingAddress(null);
    setFormData(emptyAddress);
    setShowDialog(true);
  };

  const openEditDialog = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      name: address.name,
      phone: address.phone,
      address: address.address,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      landmark: address.landmark || '',
      type: address.type,
      isDefault: address.isDefault
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.phone || !formData.address || !formData.city || !formData.state || !formData.pincode) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    try {
      setSaving(true);
      if (editingAddress) {
        await api.put(`/user/addresses/${editingAddress._id}`, formData);
        toast({ title: 'Address updated successfully' });
      } else {
        await api.post('/user/addresses', formData);
        toast({ title: 'Address added successfully' });
      }
      setShowDialog(false);
      fetchAddresses();
    } catch (error: any) {
      toast({ title: error.message || 'Failed to save address', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    
    try {
      await api.delete(`/user/addresses/${addressId}`);
      toast({ title: 'Address deleted successfully' });
      setAddresses(addresses.filter(a => a._id !== addressId));
    } catch (error: any) {
      toast({ title: error.message || 'Failed to delete address', variant: 'destructive' });
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      await api.put(`/user/addresses/${addressId}`, { isDefault: true });
      toast({ title: 'Default address updated' });
      fetchAddresses();
    } catch (error: any) {
      toast({ title: error.message || 'Failed to update', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">My Addresses</h1>
          <p className="text-muted-foreground">Manage your delivery addresses</p>
        </div>
        <Button onClick={openAddDialog} data-testid="button-add-address">
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
              <Button onClick={openAddDialog} data-testid="button-add-first-address">
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
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(address)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(address._id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="font-medium">{address.name}</p>
                <p className="text-sm text-muted-foreground">{address.phone}</p>
                <p className="text-sm mt-2">{address.address}</p>
                {address.landmark && <p className="text-sm text-muted-foreground">{address.landmark}</p>}
                <p className="text-sm">{address.city}, {address.state} - {address.pincode}</p>
                {!address.isDefault && (
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => handleSetDefault(address._id)}>
                    Set as Default
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input 
                id="phone" 
                value={formData.phone} 
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input 
                id="address" 
                value={formData.address} 
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="House/Flat No., Street, Area"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="landmark">Landmark (Optional)</Label>
              <Input 
                id="landmark" 
                value={formData.landmark} 
                onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                placeholder="Near..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input 
                  id="city" 
                  value={formData.city} 
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="City"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input 
                  id="state" 
                  value={formData.state} 
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="State"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode *</Label>
                <Input 
                  id="pincode" 
                  value={formData.pincode} 
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  placeholder="Pincode"
                />
              </div>
              <div className="space-y-2">
                <Label>Address Type</Label>
                <Select value={formData.type} onValueChange={(v: 'home' | 'work' | 'other') => setFormData({ ...formData, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">Home</SelectItem>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox 
                id="isDefault" 
                checked={formData.isDefault}
                onCheckedChange={(checked) => setFormData({ ...formData, isDefault: checked as boolean })}
              />
              <Label htmlFor="isDefault" className="cursor-pointer">Set as default address</Label>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingAddress ? 'Update' : 'Add'} Address
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
