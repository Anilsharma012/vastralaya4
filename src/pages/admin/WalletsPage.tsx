import { useState, useEffect } from "react";
import { Search, Wallet, Plus, Minus, Eye, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface WalletData {
  _id: string;
  userId: { _id: string; name: string; email: string };
  balance: number;
  currency: string;
  isActive: boolean;
  totalCredits: number;
  totalDebits: number;
  createdAt: string;
}

interface Props {
  type?: "user" | "influencer";
}

const WalletsPage = ({ type = "user" }: Props) => {
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedWallet, setSelectedWallet] = useState<WalletData | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<"credit" | "debit">("credit");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadWallets();
  }, [type]);

  const loadWallets = async () => {
    try {
      const data = await api.get<{ wallets: WalletData[] }>(`/admin/wallets?type=${type}`);
      setWallets(data.wallets || []);
    } catch (error) {
      setWallets([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdjustment = async () => {
    if (!selectedWallet || !amount || !description) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }

    try {
      await api.post(`/admin/wallets/${selectedWallet._id}/adjust`, {
        type: adjustmentType,
        amount: parseFloat(amount),
        description
      });
      
      const adjustedAmount = parseFloat(amount);
      setWallets(wallets.map(w => w._id === selectedWallet._id ? {
        ...w,
        balance: adjustmentType === "credit" 
          ? w.balance + adjustedAmount 
          : w.balance - adjustedAmount
      } : w));
      
      toast({ title: `Wallet ${adjustmentType}ed successfully` });
      closeDialog();
    } catch (error: any) {
      toast({ title: error.message || "Adjustment failed", variant: "destructive" });
    }
  };

  const closeDialog = () => {
    setSelectedWallet(null);
    setAmount("");
    setDescription("");
    setAdjustmentType("credit");
  };

  const filteredWallets = wallets.filter(w =>
    w.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
    w.userId?.email?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: wallets.length,
    totalBalance: wallets.reduce((sum, w) => sum + w.balance, 0),
    active: wallets.filter(w => w.isActive).length
  };

  const pageTitle = type === "influencer" ? "Influencer Wallets" : "User Wallets";

  if (isLoading) {
    return <div className="p-6">Loading wallets...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold" data-testid="text-page-title">{pageTitle}</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Total Wallets</div>
                <div className="text-2xl font-bold">{stats.total}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Balance</div>
            <div className="text-2xl font-bold text-green-600">₹{stats.totalBalance.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Active Wallets</div>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
          data-testid="input-search"
        />
      </div>

      <div className="border rounded-md">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium">User</th>
              <th className="text-right p-3 font-medium">Balance</th>
              <th className="text-right p-3 font-medium">Total Credits</th>
              <th className="text-right p-3 font-medium">Total Debits</th>
              <th className="text-center p-3 font-medium">Status</th>
              <th className="text-center p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredWallets.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-muted-foreground">
                  No wallets found
                </td>
              </tr>
            ) : (
              filteredWallets.map((wallet) => (
                <tr key={wallet._id} className="border-t" data-testid={`row-wallet-${wallet._id}`}>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">{wallet.userId?.name || "Unknown"}</div>
                        <div className="text-xs text-muted-foreground">{wallet.userId?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-right font-bold text-lg">
                    ₹{wallet.balance.toLocaleString()}
                  </td>
                  <td className="p-3 text-right text-green-600">
                    +₹{(wallet.totalCredits || 0).toLocaleString()}
                  </td>
                  <td className="p-3 text-right text-red-600">
                    -₹{(wallet.totalDebits || 0).toLocaleString()}
                  </td>
                  <td className="p-3 text-center">
                    <Badge variant={wallet.isActive ? "default" : "secondary"}>
                      {wallet.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedWallet(wallet);
                          setAdjustmentType("credit");
                        }}
                        data-testid={`button-credit-${wallet._id}`}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Credit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedWallet(wallet);
                          setAdjustmentType("debit");
                        }}
                        data-testid={`button-debit-${wallet._id}`}
                      >
                        <Minus className="h-4 w-4 mr-1" /> Debit
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!selectedWallet} onOpenChange={closeDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {adjustmentType === "credit" ? "Add Credit" : "Debit Amount"}
            </DialogTitle>
          </DialogHeader>
          {selectedWallet && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-md">
                <div className="font-medium">{selectedWallet.userId?.name}</div>
                <div className="text-sm text-muted-foreground">{selectedWallet.userId?.email}</div>
                <div className="text-lg font-bold mt-1">
                  Current Balance: ₹{selectedWallet.balance.toLocaleString()}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Transaction Type</Label>
                <Select value={adjustmentType} onValueChange={(v: any) => setAdjustmentType(v)}>
                  <SelectTrigger data-testid="select-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit">Credit (Add Money)</SelectItem>
                    <SelectItem value="debit">Debit (Subtract Money)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Amount (₹)</Label>
                <Input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  data-testid="input-amount"
                />
              </div>

              <div className="space-y-2">
                <Label>Description / Reason</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter reason for this transaction"
                  data-testid="input-description"
                />
              </div>

              {amount && (
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm">
                    New Balance: <span className="font-bold">
                      ₹{(adjustmentType === "credit" 
                        ? selectedWallet.balance + parseFloat(amount || "0")
                        : selectedWallet.balance - parseFloat(amount || "0")
                      ).toLocaleString()}
                    </span>
                  </p>
                </div>
              )}

              <Button 
                onClick={handleAdjustment} 
                className="w-full"
                disabled={!amount || !description}
                data-testid="button-submit"
              >
                {adjustmentType === "credit" ? "Add Credit" : "Debit Amount"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WalletsPage;
