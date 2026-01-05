import { useState, useEffect } from "react";
import { Search, User, Check, X, Eye, DollarSign, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface Influencer {
  _id: string;
  userId: { _id: string; name: string; email: string; phone?: string };
  tier: "bronze" | "silver" | "gold" | "platinum" | "diamond";
  status: "pending" | "approved" | "rejected" | "suspended";
  referralCode: string;
  commission: { rate: number; totalEarned: number; pendingAmount: number; paidAmount: number };
  kyc: { panNumber?: string; aadharNumber?: string; isVerified: boolean };
  bankDetails?: { accountName: string; accountNumber: string; ifscCode: string; bankName: string };
  upiId?: string;
  stats: { totalReferrals: number; successfulReferrals: number; totalOrders: number; totalSales: number };
  createdAt: string;
}

const tierColors = {
  bronze: "bg-amber-700 text-white",
  silver: "bg-gray-400 text-white",
  gold: "bg-yellow-500 text-white",
  platinum: "bg-slate-600 text-white",
  diamond: "bg-cyan-400 text-white"
};

const tierRates = { bronze: 5, silver: 6, gold: 7, platinum: 8, diamond: 10 };

const InfluencersPage = () => {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedInfluencer, setSelectedInfluencer] = useState<Influencer | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadInfluencers();
  }, []);

  const loadInfluencers = async () => {
    try {
      const data = await api.get<{ influencers: Influencer[] }>('/admin/influencers');
      setInfluencers(data.influencers || []);
    } catch (error) {
      toast({ title: "Error loading influencers", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await api.put(`/admin/influencers/${id}`, { status });
      setInfluencers(influencers.map(i => i._id === id ? { ...i, status: status as any } : i));
      toast({ title: `Status updated to ${status}` });
    } catch (error) {
      toast({ title: "Update failed", variant: "destructive" });
    }
  };

  const handleTierChange = async (id: string, tier: string) => {
    try {
      const newRate = tierRates[tier as keyof typeof tierRates];
      await api.put(`/admin/influencers/${id}`, { tier, 'commission.rate': newRate });
      setInfluencers(influencers.map(i => i._id === id ? { 
        ...i, 
        tier: tier as any,
        commission: { ...i.commission, rate: newRate }
      } : i));
      toast({ title: `Tier updated to ${tier}` });
    } catch (error) {
      toast({ title: "Update failed", variant: "destructive" });
    }
  };

  const handleKycVerify = async (id: string, verified: boolean) => {
    try {
      await api.put(`/admin/influencers/${id}`, { 'kyc.isVerified': verified });
      setInfluencers(influencers.map(i => i._id === id ? { 
        ...i, 
        kyc: { ...i.kyc, isVerified: verified }
      } : i));
      toast({ title: verified ? "KYC verified" : "KYC rejected" });
    } catch (error) {
      toast({ title: "Update failed", variant: "destructive" });
    }
  };

  const filteredInfluencers = influencers.filter(i => {
    const matchSearch = i.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
                       i.userId?.email?.toLowerCase().includes(search.toLowerCase()) ||
                       i.referralCode?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || i.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: influencers.length,
    pending: influencers.filter(i => i.status === "pending").length,
    approved: influencers.filter(i => i.status === "approved").length,
    totalEarnings: influencers.reduce((sum, i) => sum + (i.commission?.totalEarned || 0), 0)
  };

  if (isLoading) {
    return <div className="p-6">Loading influencers...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold" data-testid="text-page-title">Influencer Management</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Influencers</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Pending Approval</div>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Active</div>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Earnings</div>
            <div className="text-2xl font-bold">₹{stats.totalEarnings.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search influencers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40" data-testid="select-status-filter">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredInfluencers.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No influencers found
            </CardContent>
          </Card>
        ) : (
          filteredInfluencers.map((influencer) => (
            <Card key={influencer._id} data-testid={`card-influencer-${influencer._id}`}>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{influencer.userId?.name || "Unknown"}</span>
                        <Badge className={tierColors[influencer.tier]}>
                          {influencer.tier.toUpperCase()}
                        </Badge>
                        <Badge variant={
                          influencer.status === "approved" ? "default" :
                          influencer.status === "pending" ? "secondary" :
                          "destructive"
                        }>
                          {influencer.status}
                        </Badge>
                        {influencer.kyc?.isVerified && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            <Check className="h-3 w-3 mr-1" /> KYC Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{influencer.userId?.email}</p>
                      <p className="text-sm font-mono mt-1">Code: {influencer.referralCode}</p>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          {influencer.stats?.successfulReferrals || 0} referrals
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          ₹{influencer.commission?.totalEarned || 0} earned
                        </span>
                        <span>{influencer.commission?.rate || 5}% commission</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedInfluencer(influencer)}
                      data-testid={`button-view-${influencer._id}`}
                    >
                      <Eye className="mr-1 h-4 w-4" /> View
                    </Button>
                    {influencer.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleStatusChange(influencer._id, "approved")}
                          data-testid={`button-approve-${influencer._id}`}
                        >
                          <Check className="mr-1 h-4 w-4" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleStatusChange(influencer._id, "rejected")}
                          data-testid={`button-reject-${influencer._id}`}
                        >
                          <X className="mr-1 h-4 w-4" /> Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={!!selectedInfluencer} onOpenChange={() => setSelectedInfluencer(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Influencer Details</DialogTitle>
          </DialogHeader>
          {selectedInfluencer && (
            <Tabs defaultValue="info" className="mt-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="info">Info</TabsTrigger>
                <TabsTrigger value="kyc">KYC</TabsTrigger>
                <TabsTrigger value="earnings">Earnings</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Name</Label>
                    <p className="font-medium">{selectedInfluencer.userId?.name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="font-medium">{selectedInfluencer.userId?.email}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Phone</Label>
                    <p className="font-medium">{selectedInfluencer.userId?.phone || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Referral Code</Label>
                    <p className="font-mono font-medium">{selectedInfluencer.referralCode}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Total Referrals</Label>
                    <p className="font-medium">{selectedInfluencer.stats?.totalReferrals || 0}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Successful Referrals</Label>
                    <p className="font-medium">{selectedInfluencer.stats?.successfulReferrals || 0}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Joined</Label>
                    <p className="font-medium">{new Date(selectedInfluencer.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="kyc" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">PAN Number</Label>
                    <p className="font-mono">{selectedInfluencer.kyc?.panNumber || "Not provided"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Aadhar Number</Label>
                    <p className="font-mono">{selectedInfluencer.kyc?.aadharNumber || "Not provided"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Bank Name</Label>
                    <p>{selectedInfluencer.bankDetails?.bankName || "Not provided"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Account Number</Label>
                    <p className="font-mono">{selectedInfluencer.bankDetails?.accountNumber || "Not provided"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">IFSC Code</Label>
                    <p className="font-mono">{selectedInfluencer.bankDetails?.ifscCode || "Not provided"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">UPI ID</Label>
                    <p>{selectedInfluencer.upiId || "Not provided"}</p>
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  {!selectedInfluencer.kyc?.isVerified ? (
                    <Button
                      onClick={() => handleKycVerify(selectedInfluencer._id, true)}
                      data-testid="button-verify-kyc"
                    >
                      <Check className="mr-2 h-4 w-4" /> Verify KYC
                    </Button>
                  ) : (
                    <Button
                      variant="destructive"
                      onClick={() => handleKycVerify(selectedInfluencer._id, false)}
                      data-testid="button-reject-kyc"
                    >
                      <X className="mr-2 h-4 w-4" /> Revoke KYC
                    </Button>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="earnings" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-muted-foreground">Total Earned</div>
                      <div className="text-2xl font-bold">₹{selectedInfluencer.commission?.totalEarned || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-muted-foreground">Pending Amount</div>
                      <div className="text-2xl font-bold text-orange-600">₹{selectedInfluencer.commission?.pendingAmount || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-muted-foreground">Paid Amount</div>
                      <div className="text-2xl font-bold text-green-600">₹{selectedInfluencer.commission?.paidAmount || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-muted-foreground">Commission Rate</div>
                      <div className="text-2xl font-bold">{selectedInfluencer.commission?.rate || 5}%</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={selectedInfluencer.status}
                      onValueChange={(v) => {
                        handleStatusChange(selectedInfluencer._id, v);
                        setSelectedInfluencer({ ...selectedInfluencer, status: v as any });
                      }}
                    >
                      <SelectTrigger data-testid="select-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tier</Label>
                    <Select
                      value={selectedInfluencer.tier}
                      onValueChange={(v) => {
                        handleTierChange(selectedInfluencer._id, v);
                        setSelectedInfluencer({ 
                          ...selectedInfluencer, 
                          tier: v as any,
                          commission: { 
                            ...selectedInfluencer.commission, 
                            rate: tierRates[v as keyof typeof tierRates] 
                          }
                        });
                      }}
                    >
                      <SelectTrigger data-testid="select-tier">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bronze">Bronze (5%)</SelectItem>
                        <SelectItem value="silver">Silver (6%)</SelectItem>
                        <SelectItem value="gold">Gold (7%)</SelectItem>
                        <SelectItem value="platinum">Platinum (8%)</SelectItem>
                        <SelectItem value="diamond">Diamond (10%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InfluencersPage;
