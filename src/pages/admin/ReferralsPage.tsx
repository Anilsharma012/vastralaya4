import { useState, useEffect } from "react";
import { Search, Users, TrendingUp, DollarSign, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface Referral {
  _id: string;
  referrerId: { _id: string; name: string; email: string };
  referredId: { _id: string; name: string; email: string };
  referralCode: string;
  status: "pending" | "completed" | "expired";
  orderId?: { _id: string; orderNumber: string; total: number };
  commission: number;
  createdAt: string;
  convertedAt?: string;
}

const ReferralsPage = () => {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    loadReferrals();
  }, []);

  const loadReferrals = async () => {
    try {
      const data = await api.get<{ referrals: Referral[] }>('/admin/referrals');
      setReferrals(data.referrals || []);
    } catch (error) {
      setReferrals([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReferrals = referrals.filter(r => {
    const matchSearch = r.referrerId?.name?.toLowerCase().includes(search.toLowerCase()) ||
                       r.referredId?.name?.toLowerCase().includes(search.toLowerCase()) ||
                       r.referralCode?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: referrals.length,
    completed: referrals.filter(r => r.status === "completed").length,
    pending: referrals.filter(r => r.status === "pending").length,
    totalCommission: referrals.filter(r => r.status === "completed").reduce((sum, r) => sum + (r.commission || 0), 0)
  };

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
                <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
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
            <SelectItem value="completed">Completed</SelectItem>
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
            </tr>
          </thead>
          <tbody>
            {filteredReferrals.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-muted-foreground">
                  No referrals found
                </td>
              </tr>
            ) : (
              filteredReferrals.map((referral) => (
                <tr key={referral._id} className="border-t" data-testid={`row-referral-${referral._id}`}>
                  <td className="p-3">
                    <div className="font-medium">{referral.referrerId?.name || "Unknown"}</div>
                    <div className="text-xs text-muted-foreground">{referral.referrerId?.email}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-medium">{referral.referredId?.name || "Unknown"}</div>
                    <div className="text-xs text-muted-foreground">{referral.referredId?.email}</div>
                  </td>
                  <td className="p-3 font-mono text-sm">{referral.referralCode}</td>
                  <td className="p-3">
                    {referral.orderId ? (
                      <div>
                        <div className="font-mono text-sm">{referral.orderId.orderNumber}</div>
                        <div className="text-xs text-muted-foreground">₹{referral.orderId.total}</div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="p-3 text-right font-bold">
                    {referral.commission ? `₹${referral.commission}` : "-"}
                  </td>
                  <td className="p-3 text-center">
                    <Badge variant={
                      referral.status === "completed" ? "default" :
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
