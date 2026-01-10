import { useState, useEffect } from "react";
import { Save, Store, Truck, CreditCard, Users, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface Settings {
  store: {
    name: string;
    email: string;
    phone: string;
    address: string;
    currency: string;
    taxRate: number;
  };
  shipping: {
    freeShippingThreshold: number;
    standardRate: number;
    expressRate: number;
    estimatedDays: number;
    shiprocketEnabled: boolean;
    shiprocketEmail: string;
    shiprocketPassword: string;
    shiprocketPickupLocation: string;
  };
  payments: {
    codEnabled: boolean;
    onlineEnabled: boolean;
    razorpayEnabled: boolean;
    razorpayKeyId: string;
    razorpayKeySecret: string;
    minOrderAmount: number;
  };
  referral: {
    enabled: boolean;
    referrerReward: number;
    refereeDiscount: number;
    minOrderForReward: number;
  };
  commission: {
    bronzeRate: number;
    silverRate: number;
    goldRate: number;
    platinumRate: number;
    diamondRate: number;
  };
  founderNote: {
    title: string;
    message: string;
    author: string;
    designation: string;
    imageUrl: string;
  };
}

const defaultSettings: Settings = {
  store: {
    name: "Shri Balaji Vastralya",
    email: "contact@shribalaji.com",
    phone: "+91 9876543210",
    address: "Railway Rd, Rohtak Station, Diary Mohalla, Rohtak, Haryana 124001",
    currency: "INR",
    taxRate: 18
  },
  shipping: {
    freeShippingThreshold: 999,
    standardRate: 99,
    expressRate: 199,
    estimatedDays: 5,
    shiprocketEnabled: false,
    shiprocketEmail: '',
    shiprocketPassword: '',
    shiprocketPickupLocation: ''
  },
  payments: {
    codEnabled: true,
    onlineEnabled: false,
    razorpayEnabled: false,
    razorpayKeyId: '',
    razorpayKeySecret: '',
    minOrderAmount: 500
  },
  referral: {
    enabled: true,
    referrerReward: 100,
    refereeDiscount: 10,
    minOrderForReward: 1000
  },
  commission: {
    bronzeRate: 5,
    silverRate: 6,
    goldRate: 7,
    platinumRate: 8,
    diamondRate: 10
  },
  founderNote: {
    title: 'A Message From Our Heart',
    message: 'We love you and so when you step into our store, we leave no stones unturned to make you feel special & close to us. We give a humane touch to your shopping experience.\n\nWe are personally available to help you find your perfect fit. Not only that, we suggest styling tips for your body types & individual expression. Thus, helping you to choose the right styles.',
    author: 'Chhavi Kumar Chaddha',
    designation: 'LA GLITS FOUNDER',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop'
  }
};

const SettingsPage = () => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await api.get<{ settings: any }>('/admin/settings');
      if (data.settings) {
        const loadedSettings = {
          store: { ...defaultSettings.store, ...data.settings.store },
          shipping: { 
            ...defaultSettings.shipping, 
            ...data.settings.shipping,
            shiprocketPassword: data.settings.shipping?.shiprocketPassword ? '********' : ''
          },
          payments: { 
            ...defaultSettings.payments, 
            ...data.settings.payments,
            razorpayKeySecret: data.settings.payments?.razorpayKeySecret ? '••••••••••••••••' : ''
          },
          referral: { ...defaultSettings.referral, ...data.settings.referral },
          commission: { ...defaultSettings.commission, ...data.settings.commission },
          founderNote: { ...defaultSettings.founderNote, ...data.settings.founderNote }
        };
        setSettings(loadedSettings);
      }
    } catch (error) {
      console.log('Using default settings');
      toast({ title: 'Failed to load settings', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await api.put<{ settings: Settings; message: string }>('/admin/settings', settings);
      toast({ 
        title: "Settings Saved",
        description: "All settings have been updated successfully."
      });
      if (result.settings) {
        const loadedSettings = {
          store: { ...defaultSettings.store, ...result.settings.store },
          shipping: { 
            ...defaultSettings.shipping, 
            ...result.settings.shipping,
            shiprocketPassword: (result.settings as any).shipping?.shiprocketPassword ? '********' : ''
          },
          payments: { 
            ...defaultSettings.payments, 
            ...result.settings.payments,
            razorpayKeySecret: (result.settings as any).payments?.razorpayKeySecret ? '••••••••••••••••' : ''
          },
          referral: { ...defaultSettings.referral, ...result.settings.referral },
          commission: { ...defaultSettings.commission, ...result.settings.commission },
          founderNote: { ...defaultSettings.founderNote, ...result.settings.founderNote }
        };
        setSettings(loadedSettings);
      }
    } catch (error: any) {
      toast({ 
        title: "Failed to save settings",
        description: error.message || "Please try again later.",
        variant: "destructive" 
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading settings...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold" data-testid="text-page-title">Settings</h1>
        <Button onClick={handleSave} disabled={isSaving} data-testid="button-save">
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Tabs defaultValue="store" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="store">Store</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="referral">Referral</TabsTrigger>
          <TabsTrigger value="commission">Commission</TabsTrigger>
          <TabsTrigger value="founder">Founder Note</TabsTrigger>
        </TabsList>

        <TabsContent value="store">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" /> Store Information
              </CardTitle>
              <CardDescription>Basic store details and configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Store Name</Label>
                  <Input
                    value={settings.store.name}
                    onChange={(e) => setSettings({
                      ...settings,
                      store: { ...settings.store, name: e.target.value }
                    })}
                    data-testid="input-store-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Email</Label>
                  <Input
                    type="email"
                    value={settings.store.email}
                    onChange={(e) => setSettings({
                      ...settings,
                      store: { ...settings.store, email: e.target.value }
                    })}
                    data-testid="input-store-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    value={settings.store.phone}
                    onChange={(e) => setSettings({
                      ...settings,
                      store: { ...settings.store, phone: e.target.value }
                    })}
                    data-testid="input-store-phone"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tax Rate (%)</Label>
                  <Input
                    type="number"
                    value={settings.store.taxRate}
                    onChange={(e) => setSettings({
                      ...settings,
                      store: { ...settings.store, taxRate: parseFloat(e.target.value) || 0 }
                    })}
                    data-testid="input-tax-rate"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Store Address</Label>
                <Textarea
                  value={settings.store.address}
                  onChange={(e) => setSettings({
                    ...settings,
                    store: { ...settings.store, address: e.target.value }
                  })}
                  data-testid="input-store-address"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shipping">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" /> Shipping Settings
              </CardTitle>
              <CardDescription>Configure shipping rates and policies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Free Shipping Threshold (₹)</Label>
                  <Input
                    type="number"
                    value={settings.shipping.freeShippingThreshold}
                    onChange={(e) => setSettings({
                      ...settings,
                      shipping: { ...settings.shipping, freeShippingThreshold: parseFloat(e.target.value) || 0 }
                    })}
                    data-testid="input-free-shipping"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Standard Shipping Rate (₹)</Label>
                  <Input
                    type="number"
                    value={settings.shipping.standardRate}
                    onChange={(e) => setSettings({
                      ...settings,
                      shipping: { ...settings.shipping, standardRate: parseFloat(e.target.value) || 0 }
                    })}
                    data-testid="input-standard-rate"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Express Shipping Rate (₹)</Label>
                  <Input
                    type="number"
                    value={settings.shipping.expressRate}
                    onChange={(e) => setSettings({
                      ...settings,
                      shipping: { ...settings.shipping, expressRate: parseFloat(e.target.value) || 0 }
                    })}
                    data-testid="input-express-rate"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estimated Delivery Days</Label>
                  <Input
                    type="number"
                    value={settings.shipping.estimatedDays}
                    onChange={(e) => setSettings({
                      ...settings,
                      shipping: { ...settings.shipping, estimatedDays: parseInt(e.target.value) || 5 }
                    })}
                    data-testid="input-estimated-days"
                  />
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label className="text-lg font-semibold">Shiprocket Integration</Label>
                    <p className="text-sm text-muted-foreground">Connect to Shiprocket for automated shipping</p>
                  </div>
                  <Switch
                    checked={settings.shipping.shiprocketEnabled}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      shipping: { ...settings.shipping, shiprocketEnabled: checked }
                    })}
                    data-testid="switch-shiprocket"
                  />
                </div>
                {settings.shipping.shiprocketEnabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Shiprocket Email</Label>
                      <Input
                        type="email"
                        value={settings.shipping.shiprocketEmail}
                        onChange={(e) => setSettings({
                          ...settings,
                          shipping: { ...settings.shipping, shiprocketEmail: e.target.value }
                        })}
                        placeholder="your@shiprocket-email.com"
                        data-testid="input-shiprocket-email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Shiprocket Password</Label>
                      <Input
                        type="password"
                        value={settings.shipping.shiprocketPassword}
                        onChange={(e) => setSettings({
                          ...settings,
                          shipping: { ...settings.shipping, shiprocketPassword: e.target.value }
                        })}
                        placeholder="Your API password"
                        data-testid="input-shiprocket-password"
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>Pickup Location Name</Label>
                      <Input
                        value={settings.shipping.shiprocketPickupLocation}
                        onChange={(e) => setSettings({
                          ...settings,
                          shipping: { ...settings.shipping, shiprocketPickupLocation: e.target.value }
                        })}
                        placeholder="e.g., Main Warehouse"
                        data-testid="input-shiprocket-pickup"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" /> Payment Settings
              </CardTitle>
              <CardDescription>Configure payment methods and options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Cash on Delivery</Label>
                    <p className="text-sm text-muted-foreground">Allow customers to pay on delivery</p>
                  </div>
                  <Switch
                    checked={settings.payments.codEnabled}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      payments: { ...settings.payments, codEnabled: checked }
                    })}
                    data-testid="switch-cod"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Online Payments</Label>
                    <p className="text-sm text-muted-foreground">Accept online payments via cards/UPI</p>
                  </div>
                  <Switch
                    checked={settings.payments.onlineEnabled}
                    onCheckedChange={(checked) => setSettings({
                      ...settings,
                      payments: { ...settings.payments, onlineEnabled: checked }
                    })}
                    data-testid="switch-online"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Minimum Order Amount (₹)</Label>
                  <Input
                    type="number"
                    value={settings.payments.minOrderAmount}
                    onChange={(e) => setSettings({
                      ...settings,
                      payments: { ...settings.payments, minOrderAmount: parseFloat(e.target.value) || 0 }
                    })}
                    className="max-w-xs"
                    data-testid="input-min-order"
                  />
                </div>
              </div>

              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-semibold mb-4">Razorpay Payment Gateway</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Razorpay</Label>
                      <p className="text-sm text-muted-foreground">Accept payments via Razorpay gateway</p>
                    </div>
                    <Switch
                      checked={settings.payments.razorpayEnabled}
                      onCheckedChange={(checked) => setSettings({
                        ...settings,
                        payments: { ...settings.payments, razorpayEnabled: checked }
                      })}
                      data-testid="switch-razorpay"
                    />
                  </div>
                  
                  {settings.payments.razorpayEnabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="space-y-2">
                        <Label>Razorpay Key ID</Label>
                        <Input
                          value={settings.payments.razorpayKeyId}
                          onChange={(e) => setSettings({
                            ...settings,
                            payments: { ...settings.payments, razorpayKeyId: e.target.value }
                          })}
                          placeholder="rzp_live_xxxxxxxxxx"
                          data-testid="input-razorpay-key-id"
                        />
                        <p className="text-xs text-muted-foreground">Your Razorpay Key ID from dashboard</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Razorpay Key Secret</Label>
                        <Input
                          type="password"
                          value={settings.payments.razorpayKeySecret}
                          onChange={(e) => setSettings({
                            ...settings,
                            payments: { ...settings.payments, razorpayKeySecret: e.target.value }
                          })}
                          placeholder="••••••••••••••••"
                          data-testid="input-razorpay-key-secret"
                        />
                        <p className="text-xs text-muted-foreground">Your Razorpay Key Secret (keep this secure)</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referral">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" /> Referral Program
              </CardTitle>
              <CardDescription>Configure referral rewards and discounts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Referral Program</Label>
                  <p className="text-sm text-muted-foreground">Allow users to refer friends</p>
                </div>
                <Switch
                  checked={settings.referral.enabled}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    referral: { ...settings.referral, enabled: checked }
                  })}
                  data-testid="switch-referral"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Referrer Reward (₹)</Label>
                  <Input
                    type="number"
                    value={settings.referral.referrerReward}
                    onChange={(e) => setSettings({
                      ...settings,
                      referral: { ...settings.referral, referrerReward: parseFloat(e.target.value) || 0 }
                    })}
                    data-testid="input-referrer-reward"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Referee Discount (%)</Label>
                  <Input
                    type="number"
                    value={settings.referral.refereeDiscount}
                    onChange={(e) => setSettings({
                      ...settings,
                      referral: { ...settings.referral, refereeDiscount: parseFloat(e.target.value) || 0 }
                    })}
                    data-testid="input-referee-discount"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Minimum Order for Reward (₹)</Label>
                  <Input
                    type="number"
                    value={settings.referral.minOrderForReward}
                    onChange={(e) => setSettings({
                      ...settings,
                      referral: { ...settings.referral, minOrderForReward: parseFloat(e.target.value) || 0 }
                    })}
                    data-testid="input-min-order-reward"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commission">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5" /> Commission Settings
              </CardTitle>
              <CardDescription>Configure influencer commission rates by tier</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label>Bronze (%)</Label>
                  <Input
                    type="number"
                    value={settings.commission.bronzeRate}
                    onChange={(e) => setSettings({
                      ...settings,
                      commission: { ...settings.commission, bronzeRate: parseFloat(e.target.value) || 5 }
                    })}
                    data-testid="input-bronze-rate"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Silver (%)</Label>
                  <Input
                    type="number"
                    value={settings.commission.silverRate}
                    onChange={(e) => setSettings({
                      ...settings,
                      commission: { ...settings.commission, silverRate: parseFloat(e.target.value) || 6 }
                    })}
                    data-testid="input-silver-rate"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gold (%)</Label>
                  <Input
                    type="number"
                    value={settings.commission.goldRate}
                    onChange={(e) => setSettings({
                      ...settings,
                      commission: { ...settings.commission, goldRate: parseFloat(e.target.value) || 7 }
                    })}
                    data-testid="input-gold-rate"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Platinum (%)</Label>
                  <Input
                    type="number"
                    value={settings.commission.platinumRate}
                    onChange={(e) => setSettings({
                      ...settings,
                      commission: { ...settings.commission, platinumRate: parseFloat(e.target.value) || 8 }
                    })}
                    data-testid="input-platinum-rate"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Diamond (%)</Label>
                  <Input
                    type="number"
                    value={settings.commission.diamondRate}
                    onChange={(e) => setSettings({
                      ...settings,
                      commission: { ...settings.commission, diamondRate: parseFloat(e.target.value) || 10 }
                    })}
                    data-testid="input-diamond-rate"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="founder">
          <Card>
            <CardHeader>
              <CardTitle>Founder Note Settings</CardTitle>
              <CardDescription>Manage the "Note by Founder" section on the homepage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Section Title</Label>
                <Input
                  value={settings.founderNote.title}
                  onChange={(e) => setSettings({
                    ...settings,
                    founderNote: { ...settings.founderNote, title: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Founder Name</Label>
                <Input
                  value={settings.founderNote.author}
                  onChange={(e) => setSettings({
                    ...settings,
                    founderNote: { ...settings.founderNote, author: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Designation</Label>
                <Input
                  value={settings.founderNote.designation}
                  onChange={(e) => setSettings({
                    ...settings,
                    founderNote: { ...settings.founderNote, designation: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input
                  value={settings.founderNote.imageUrl}
                  onChange={(e) => setSettings({
                    ...settings,
                    founderNote: { ...settings.founderNote, imageUrl: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Message Content</Label>
                <Textarea
                  className="min-h-[200px]"
                  value={settings.founderNote.message}
                  onChange={(e) => setSettings({
                    ...settings,
                    founderNote: { ...settings.founderNote, message: e.target.value }
                  })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
