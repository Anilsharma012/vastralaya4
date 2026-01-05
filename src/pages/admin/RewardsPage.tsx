import { useState, useEffect } from "react";
import { Gift, Save, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface RewardRule {
  id: string;
  name: string;
  type: "signup" | "order" | "referral" | "review" | "birthday";
  points: number;
  minOrderAmount?: number;
  isActive: boolean;
}

interface RewardsSettings {
  enabled: boolean;
  pointsPerRupee: number;
  redemptionRate: number;
  minRedeemPoints: number;
  maxRedeemPercent: number;
  expiryDays: number;
  rules: RewardRule[];
}

const defaultSettings: RewardsSettings = {
  enabled: true,
  pointsPerRupee: 1,
  redemptionRate: 0.25,
  minRedeemPoints: 100,
  maxRedeemPercent: 50,
  expiryDays: 365,
  rules: [
    { id: "1", name: "Signup Bonus", type: "signup", points: 100, isActive: true },
    { id: "2", name: "Order Points", type: "order", points: 1, minOrderAmount: 500, isActive: true },
    { id: "3", name: "Referral Bonus", type: "referral", points: 200, isActive: true },
    { id: "4", name: "Review Reward", type: "review", points: 50, isActive: true },
    { id: "5", name: "Birthday Bonus", type: "birthday", points: 500, isActive: true }
  ]
};

const RewardsPage = () => {
  const [settings, setSettings] = useState<RewardsSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await api.get<{ rewards: RewardsSettings }>('/admin/settings/rewards');
      if (data.rewards) {
        setSettings({ ...defaultSettings, ...data.rewards });
      }
    } catch (error) {
      console.log("Using default rewards settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.put('/admin/settings/rewards', settings);
      toast({ title: "Rewards settings saved" });
    } catch (error) {
      toast({ title: "Failed to save", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const updateRule = (id: string, updates: Partial<RewardRule>) => {
    setSettings({
      ...settings,
      rules: settings.rules.map(r => r.id === id ? { ...r, ...updates } : r)
    });
  };

  if (isLoading) {
    return <div className="p-6">Loading rewards settings...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold" data-testid="text-page-title">Rewards Rules</h1>
        <Button onClick={handleSave} disabled={isSaving} data-testid="button-save">
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            General Settings
          </CardTitle>
          <CardDescription>Configure your rewards program</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Rewards Program</Label>
              <p className="text-sm text-muted-foreground">Allow customers to earn and redeem points</p>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(checked) => setSettings({ ...settings, enabled: checked })}
              data-testid="switch-enabled"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Points per ₹1 Spent</Label>
              <Input
                type="number"
                value={settings.pointsPerRupee}
                onChange={(e) => setSettings({ ...settings, pointsPerRupee: parseFloat(e.target.value) || 1 })}
                data-testid="input-points-per-rupee"
              />
            </div>
            <div className="space-y-2">
              <Label>Redemption Rate (₹ per point)</Label>
              <Input
                type="number"
                step="0.01"
                value={settings.redemptionRate}
                onChange={(e) => setSettings({ ...settings, redemptionRate: parseFloat(e.target.value) || 0.25 })}
                data-testid="input-redemption-rate"
              />
            </div>
            <div className="space-y-2">
              <Label>Min Points to Redeem</Label>
              <Input
                type="number"
                value={settings.minRedeemPoints}
                onChange={(e) => setSettings({ ...settings, minRedeemPoints: parseInt(e.target.value) || 100 })}
                data-testid="input-min-redeem"
              />
            </div>
            <div className="space-y-2">
              <Label>Max Redeem % of Order</Label>
              <Input
                type="number"
                value={settings.maxRedeemPercent}
                onChange={(e) => setSettings({ ...settings, maxRedeemPercent: parseInt(e.target.value) || 50 })}
                data-testid="input-max-redeem-percent"
              />
            </div>
            <div className="space-y-2">
              <Label>Points Expiry (Days)</Label>
              <Input
                type="number"
                value={settings.expiryDays}
                onChange={(e) => setSettings({ ...settings, expiryDays: parseInt(e.target.value) || 365 })}
                data-testid="input-expiry-days"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Earning Rules</CardTitle>
          <CardDescription>Define how customers can earn points</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {settings.rules.map((rule) => (
              <div 
                key={rule.id} 
                className="flex flex-wrap items-center gap-4 p-4 border rounded-md"
                data-testid={`rule-${rule.id}`}
              >
                <Switch
                  checked={rule.isActive}
                  onCheckedChange={(checked) => updateRule(rule.id, { isActive: checked })}
                />
                <div className="flex-1 min-w-[200px]">
                  <Input
                    value={rule.name}
                    onChange={(e) => updateRule(rule.id, { name: e.target.value })}
                    placeholder="Rule name"
                  />
                </div>
                <div className="w-32">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={rule.points}
                      onChange={(e) => updateRule(rule.id, { points: parseInt(e.target.value) || 0 })}
                      placeholder="Points"
                    />
                    <span className="text-sm text-muted-foreground whitespace-nowrap">pts</span>
                  </div>
                </div>
                {rule.type === "order" && (
                  <div className="w-40">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Min ₹</span>
                      <Input
                        type="number"
                        value={rule.minOrderAmount || 0}
                        onChange={(e) => updateRule(rule.id, { minOrderAmount: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                )}
                <div className="text-sm text-muted-foreground capitalize px-2">
                  {rule.type}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RewardsPage;
