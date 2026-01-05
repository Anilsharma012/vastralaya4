import { useState, useEffect } from "react";
import { Search, DollarSign, Check, X, Clock, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface Payout {
  _id: string;
  influencerId: { 
    _id: string; 
    userId: { name: string; email: string };
    referralCode: string;
    bankDetails?: { bankName: string; accountNumber: string };
    upiId?: string;
  };
  amount: number;
  status: "pending" | "processing" | "completed" | "rejected";
  paymentMethod: "bank" | "upi";
  transactionId?: string;
  adminNote?: string;
  requestedAt: string;
  processedAt?: string;
}

const PayoutsPage = () => {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadPayouts();
  }, []);

  const loadPayouts = async () => {
    try {
      const data = await api.get<{ payouts: Payout[] }>('/admin/payouts');
      setPayouts(data.payouts || []);
    } catch (error) {
      setPayouts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const payload: any = { status };
      if (status === "completed" && transactionId) {
        payload.transactionId = transactionId;
      }
      if (adminNote) {
        payload.adminNote = adminNote;
      }

      await api.put(`/admin/payouts/${id}`, payload);
      setPayouts(payouts.map(p => p._id === id ? { ...p, status: status as any, transactionId, adminNote } : p));
      toast({ title: `Payout ${status}` });
      closeDialog();
    } catch (error) {
      toast({ title: "Update failed", variant: "destructive" });
    }
  };

  const closeDialog = () => {
    setSelectedPayout(null);
    setTransactionId("");
    setAdminNote("");
  };

  const filteredPayouts = payouts.filter(p => {
    const matchSearch = p.influencerId?.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
                       p.influencerId?.userId?.email?.toLowerCase().includes(search.toLowerCase()) ||
                       p.influencerId?.referralCode?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: payouts.length,
    pending: payouts.filter(p => p.status === "pending").length,
    pendingAmount: payouts.filter(p => p.status === "pending").reduce((sum, p) => sum + p.amount, 0),
    completed: payouts.filter(p => p.status === "completed").length,
    completedAmount: payouts.filter(p => p.status === "completed").reduce((sum, p) => sum + p.amount, 0)
  };

  if (isLoading) {
    return <div className="p-6">Loading payouts...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold" data-testid="text-page-title">Payout Requests</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Requests</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <div className="text-sm text-muted-foreground">Pending</div>
                <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Pending Amount</div>
            <div className="text-2xl font-bold text-orange-600">₹{stats.pendingAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Paid</div>
            <div className="text-2xl font-bold text-green-600">₹{stats.completedAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by influencer..."
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
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-md">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium">Influencer</th>
              <th className="text-right p-3 font-medium">Amount</th>
              <th className="text-center p-3 font-medium">Method</th>
              <th className="text-left p-3 font-medium">Requested</th>
              <th className="text-center p-3 font-medium">Status</th>
              <th className="text-center p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayouts.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-muted-foreground">
                  No payout requests found
                </td>
              </tr>
            ) : (
              filteredPayouts.map((payout) => (
                <tr key={payout._id} className="border-t" data-testid={`row-payout-${payout._id}`}>
                  <td className="p-3">
                    <div className="font-medium">{payout.influencerId?.userId?.name || "Unknown"}</div>
                    <div className="text-xs text-muted-foreground">{payout.influencerId?.userId?.email}</div>
                    <div className="text-xs font-mono">{payout.influencerId?.referralCode}</div>
                  </td>
                  <td className="p-3 text-right">
                    <span className="text-lg font-bold">₹{payout.amount.toLocaleString()}</span>
                  </td>
                  <td className="p-3 text-center">
                    <Badge variant="outline">
                      {payout.paymentMethod === "bank" ? "Bank Transfer" : "UPI"}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="text-sm">{new Date(payout.requestedAt).toLocaleDateString()}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(payout.requestedAt).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <Badge variant={
                      payout.status === "completed" ? "default" :
                      payout.status === "pending" ? "secondary" :
                      payout.status === "processing" ? "outline" : "destructive"
                    }>
                      {payout.status}
                    </Badge>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setSelectedPayout(payout)}
                        data-testid={`button-view-${payout._id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {payout.status === "pending" && (
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setSelectedPayout(payout);
                            }}
                            data-testid={`button-process-${payout._id}`}
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleStatusUpdate(payout._id, "rejected")}
                            data-testid={`button-reject-${payout._id}`}
                          >
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!selectedPayout} onOpenChange={closeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Payout Details</DialogTitle>
          </DialogHeader>
          {selectedPayout && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Influencer</Label>
                  <p className="font-medium">{selectedPayout.influencerId?.userId?.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Amount</Label>
                  <p className="text-xl font-bold">₹{selectedPayout.amount.toLocaleString()}</p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Payment Method</Label>
                {selectedPayout.paymentMethod === "bank" ? (
                  <div className="text-sm mt-1">
                    <p>Bank: {selectedPayout.influencerId?.bankDetails?.bankName}</p>
                    <p>Account: {selectedPayout.influencerId?.bankDetails?.accountNumber}</p>
                  </div>
                ) : (
                  <p className="font-mono">{selectedPayout.influencerId?.upiId}</p>
                )}
              </div>

              {selectedPayout.status === "pending" && (
                <>
                  <div className="space-y-2">
                    <Label>Transaction ID (for completed payments)</Label>
                    <Input
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="Enter transaction reference"
                      data-testid="input-transaction-id"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Admin Note</Label>
                    <Textarea
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      placeholder="Optional note"
                      data-testid="input-admin-note"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => handleStatusUpdate(selectedPayout._id, "processing")}
                      data-testid="button-mark-processing"
                    >
                      Mark Processing
                    </Button>
                    <Button
                      className="flex-1"
                      variant="default"
                      onClick={() => handleStatusUpdate(selectedPayout._id, "completed")}
                      data-testid="button-mark-completed"
                    >
                      Mark Completed
                    </Button>
                  </div>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => handleStatusUpdate(selectedPayout._id, "rejected")}
                    data-testid="button-reject"
                  >
                    Reject Payout
                  </Button>
                </>
              )}

              {selectedPayout.status !== "pending" && (
                <div className="space-y-2">
                  {selectedPayout.transactionId && (
                    <div>
                      <Label className="text-muted-foreground">Transaction ID</Label>
                      <p className="font-mono">{selectedPayout.transactionId}</p>
                    </div>
                  )}
                  {selectedPayout.adminNote && (
                    <div>
                      <Label className="text-muted-foreground">Admin Note</Label>
                      <p>{selectedPayout.adminNote}</p>
                    </div>
                  )}
                  {selectedPayout.processedAt && (
                    <div>
                      <Label className="text-muted-foreground">Processed At</Label>
                      <p>{new Date(selectedPayout.processedAt).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PayoutsPage;
