import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search, Ticket, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface Coupon {
  _id: string;
  code: string;
  name: string;
  type: "percentage" | "fixed";
  value: number;
  minOrderAmount: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  description?: string;
}

const CouponsPage = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    code: "",
    type: "percentage" as "percentage" | "fixed",
    value: "",
    minOrderAmount: "0",
    maxDiscount: "",
    usageLimit: "100",
    startDate: "",
    endDate: "",
    isActive: true,
    description: ""
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      const data = await api.get<{ coupons: Coupon[] }>('/admin/coupons');
      setCoupons(data.coupons || []);
    } catch (error) {
      toast({ title: "Error loading coupons", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        value: parseFloat(formData.value),
        minOrderAmount: parseFloat(formData.minOrderAmount) || 0,
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : undefined,
        usageLimit: parseInt(formData.usageLimit) || 100,
        validFrom: formData.startDate || undefined,
        validUntil: formData.endDate || undefined
      };

      if (editingCoupon) {
        await api.put(`/admin/coupons/${editingCoupon._id}`, payload);
        toast({ title: "Coupon updated" });
      } else {
        await api.post('/admin/coupons', payload);
        toast({ title: "Coupon created" });
      }
      loadCoupons();
      closeDialog();
    } catch (error: any) {
      toast({ title: error.message || "Operation failed", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    try {
      await api.delete(`/admin/coupons/${id}`);
      setCoupons(coupons.filter(c => c._id !== id));
      toast({ title: "Coupon deleted" });
    } catch (error) {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  const handleToggleActive = async (coupon: Coupon) => {
    try {
      await api.put(`/admin/coupons/${coupon._id}`, { isActive: !coupon.isActive });
      setCoupons(coupons.map(c => c._id === coupon._id ? { ...c, isActive: !c.isActive } : c));
    } catch (error) {
      toast({ title: "Update failed", variant: "destructive" });
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const openEditDialog = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value.toString(),
      minOrderAmount: coupon.minOrderAmount.toString(),
      maxDiscount: coupon.maxDiscount?.toString() || "",
      usageLimit: coupon.usageLimit.toString(),
      startDate: coupon.startDate?.split('T')[0] || "",
      endDate: coupon.endDate?.split('T')[0] || "",
      isActive: coupon.isActive,
      description: coupon.description || ""
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingCoupon(null);
    setFormData({
      code: "",
      type: "percentage",
      value: "",
      minOrderAmount: "0",
      maxDiscount: "",
      usageLimit: "100",
      startDate: "",
      endDate: "",
      isActive: true,
      description: ""
    });
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, code });
  };

  const isExpired = (coupon: Coupon) => coupon.endDate ? new Date(coupon.endDate) < new Date() : false;
  const isNotStarted = (coupon: Coupon) => coupon.startDate ? new Date(coupon.startDate) > new Date() : false;

  const filteredCoupons = coupons.filter(c => 
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return <div className="p-6">Loading coupons...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold" data-testid="text-page-title">Coupons</h1>
        <Button onClick={() => setIsDialogOpen(true)} data-testid="button-add-coupon">
          <Plus className="mr-2 h-4 w-4" /> Add Coupon
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search coupons..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
          data-testid="input-search"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCoupons.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-6 text-center text-muted-foreground">
              No coupons found
            </CardContent>
          </Card>
        ) : (
          filteredCoupons.map((coupon) => (
            <Card key={coupon._id} data-testid={`card-coupon-${coupon._id}`}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Ticket className="h-5 w-5 text-primary" />
                    <code className="font-mono font-bold text-lg">{coupon.code}</code>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => copyCode(coupon.code)}
                    >
                      {copiedCode === coupon.code ? (
                        <Check className="h-3 w-3 text-green-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                  <Switch
                    checked={coupon.isActive}
                    onCheckedChange={() => handleToggleActive(coupon)}
                    data-testid={`switch-active-${coupon._id}`}
                  />
                </div>

                <div className="text-2xl font-bold text-primary">
                  {coupon.type === "percentage" ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                </div>

                <div className="flex flex-wrap gap-1">
                  {isExpired(coupon) && <Badge variant="destructive">Expired</Badge>}
                  {isNotStarted(coupon) && <Badge variant="secondary">Scheduled</Badge>}
                  {!coupon.isActive && <Badge variant="outline">Inactive</Badge>}
                  {coupon.isActive && !isExpired(coupon) && !isNotStarted(coupon) && (
                    <Badge variant="default">Active</Badge>
                  )}
                </div>

                <div className="text-sm text-muted-foreground space-y-1">
                  {coupon.minOrderAmount > 0 && (
                    <p>Min order: ₹{coupon.minOrderAmount}</p>
                  )}
                  {coupon.maxDiscount && (
                    <p>Max discount: ₹{coupon.maxDiscount}</p>
                  )}
                  <p>Usage: {coupon.usedCount}/{coupon.usageLimit}</p>
                  {coupon.startDate && coupon.endDate && (
                    <p>Valid: {new Date(coupon.startDate).toLocaleDateString()} - {new Date(coupon.endDate).toLocaleDateString()}</p>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(coupon)}
                    data-testid={`button-edit-${coupon._id}`}
                  >
                    <Pencil className="mr-1 h-3 w-3" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(coupon._id)}
                    data-testid={`button-delete-${coupon._id}`}
                  >
                    <Trash2 className="mr-1 h-3 w-3" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCoupon ? "Edit Coupon" : "Add Coupon"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Coupon Code</Label>
              <div className="flex gap-2">
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="SAVE20"
                  required
                  data-testid="input-code"
                />
                <Button type="button" variant="outline" onClick={generateCode}>
                  Generate
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v: "percentage" | "fixed") => setFormData({ ...formData, type: v })}
                >
                  <SelectTrigger data-testid="select-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Value</Label>
                <Input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder={formData.type === "percentage" ? "20" : "500"}
                  required
                  data-testid="input-value"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min Order Amount</Label>
                <Input
                  type="number"
                  value={formData.minOrderAmount}
                  onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                  data-testid="input-min-order"
                />
              </div>
              <div className="space-y-2">
                <Label>Max Discount</Label>
                <Input
                  type="number"
                  value={formData.maxDiscount}
                  onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                  placeholder="Optional"
                  data-testid="input-max-discount"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valid From</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  data-testid="input-valid-from"
                />
              </div>
              <div className="space-y-2">
                <Label>Valid Until</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  data-testid="input-valid-until"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Usage Limit</Label>
              <Input
                type="number"
                value={formData.usageLimit}
                onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                data-testid="input-usage-limit"
              />
            </div>

            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Get 20% off on your first order"
                data-testid="input-description"
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                data-testid="switch-active"
              />
              <Label>Active</Label>
            </div>

            <Button type="submit" className="w-full" data-testid="button-submit">
              {editingCoupon ? "Update Coupon" : "Create Coupon"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CouponsPage;
