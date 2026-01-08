import { useState, useEffect } from "react";
import { Search, Users, TrendingUp, DollarSign, Calendar, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface Referral {
  _id: string;
  referrer: { name: string; email: string; type: string } | null;
  referredUser: { _id: string; name: string; email: string; createdAt: string } | null;
  referralCode: string;
  status: "pending" | "converted" | "expired";
  order?: { _id: string; orderId: string; total: number; orderStatus: string } | null;
  orderAmount?: number;
  commissionAmount?: number;
  commissionStatus?: string;
  createdAt: string;
}

interface Stats {
  total: number;
  converted: number;
  pending: number;
  totalCommission: number;
}

const ReferralsPage = () => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, converted: 0, pending: 0, totalCommission: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    loadReferrals();
  }, [statusFilter]);

  const loadReferrals = async () => {
    try {
      const data = await api.get<{ referrals: Referral[]; stats: Stats }>(`/admin/referrals?status=${statusFilter}`);
      setReferrals(data.referrals || []);
      setStats(data.stats || { total: 0, converted: 0, pending: 0, totalCommission: 0 });
    } catch (error) {
      setReferrals([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.put(`/admin/referrals/${id}`, { status: 'converted' });
      toast({ title: 'Referral approved successfully' });
      loadReferrals();
    } catch (error) {
      toast({ title: 'Failed to approve referral', variant: 'destructive' });
    }
  };

  const filteredReferrals = referrals.filter(r => {
    const matchSearch = r.referrer?.name?.toLowerCase().includes(search.toLowerCase()) ||
                       r.referredUser?.name?.toLowerCase().includes(search.toLowerCase()) ||
                       r.referralCode?.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  if (isLoading) {
    return <div className="p-6">Loading referrals...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold" data-testid="text-page-title">Referrals</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Total Referrals</div>
                <div className="text-2xl font-bold">{stats.total}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-sm text-muted-foreground">Converted</div>
                <div className="text-2xl font-bold text-green-600">{stats.converted}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Pending</div>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Total Commission</div>
                <div className="text-2xl font-bold">₹{stats.totalCommission.toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search referrals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40" data-testid="select-status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-md">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium">Referrer</th>
              <th className="text-left p-3 font-medium">Referred User</th>
              <th className="text-left p-3 font-medium">Code</th>
              <th className="text-left p-3 font-medium">Order</th>
              <th className="text-right p-3 font-medium">Commission</th>
              <th className="text-center p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Date</th>
              <th className="text-center p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReferrals.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-muted-foreground">
                  No referrals found
                </td>
              </tr>
            ) : (
              filteredReferrals.map((referral) => (
                <tr key={referral._id} className="border-t" data-testid={`row-referral-${referral._id}`}>
                  <td className="p-3">
                    <div className="font-medium">{referral.referrer?.name || "Unknown"}</div>
                    <div className="text-xs text-muted-foreground">{referral.referrer?.email}</div>
                    {referral.referrer?.type && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        {referral.referrer.type}
                      </Badge>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="font-medium">{referral.referredUser?.name || "Unknown"}</div>
                    <div className="text-xs text-muted-foreground">{referral.referredUser?.email}</div>
                  </td>
                  <td className="p-3 font-mono text-sm">{referral.referralCode}</td>
                  <td className="p-3">
                    {referral.order ? (
                      <div>
                        <div className="font-mono text-sm">{referral.order.orderId}</div>
                        <div className="text-xs text-muted-foreground">₹{referral.order.total?.toLocaleString()}</div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="p-3 text-right font-bold">
                    {referral.commissionAmount ? `₹${referral.commissionAmount.toLocaleString()}` : "-"}
                  </td>
                  <td className="p-3 text-center">
                    <Badge variant={
                      referral.status === "converted" ? "default" :
                      referral.status === "pending" ? "secondary" : "destructive"
                    }>
                      {referral.status}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {new Date(referral.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    {referral.status === "pending" && (
                      <Button
                        size="sm"
                        onClick={() => handleApprove(referral._id)}
                        className="gap-1"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Approve
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReferralsPage;
