import { useState, useEffect } from "react";
import { Search, ArrowUpRight, ArrowDownLeft, DollarSign, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface Transaction {
  _id: string;
  walletId: { userId: { name: string; email: string } };
  type: "credit" | "debit";
  amount: number;
  description: string;
  reference?: string;
  status: "pending" | "completed" | "failed";
  createdAt: string;
}

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const data = await api.get<{ transactions: Transaction[] }>('/admin/transactions');
      setTransactions(data.transactions || []);
    } catch (error) {
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(t => {
    const matchSearch = t.description?.toLowerCase().includes(search.toLowerCase()) ||
                       t.reference?.toLowerCase().includes(search.toLowerCase()) ||
                       t.walletId?.userId?.name?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || t.type === typeFilter;
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const stats = {
    total: transactions.length,
    credits: transactions.filter(t => t.type === "credit").reduce((sum, t) => sum + t.amount, 0),
    debits: transactions.filter(t => t.type === "debit").reduce((sum, t) => sum + t.amount, 0),
    pending: transactions.filter(t => t.status === "pending").length
  };

  if (isLoading) {
    return <div className="p-6">Loading transactions...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold" data-testid="text-page-title">Transactions</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Total Transactions</div>
                <div className="text-2xl font-bold">{stats.total}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ArrowDownLeft className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-sm text-muted-foreground">Total Credits</div>
                <div className="text-2xl font-bold text-green-600">₹{stats.credits.toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5 text-red-600" />
              <div>
                <div className="text-sm text-muted-foreground">Total Debits</div>
                <div className="text-2xl font-bold text-red-600">₹{stats.debits.toLocaleString()}</div>
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
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-32" data-testid="select-type">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="credit">Credit</SelectItem>
            <SelectItem value="debit">Debit</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32" data-testid="select-status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-md">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium">Date</th>
              <th className="text-left p-3 font-medium">User</th>
              <th className="text-left p-3 font-medium">Description</th>
              <th className="text-left p-3 font-medium">Reference</th>
              <th className="text-center p-3 font-medium">Type</th>
              <th className="text-right p-3 font-medium">Amount</th>
              <th className="text-center p-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-muted-foreground">
                  No transactions found
                </td>
              </tr>
            ) : (
              filteredTransactions.map((txn) => (
                <tr key={txn._id} className="border-t" data-testid={`row-transaction-${txn._id}`}>
                  <td className="p-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {new Date(txn.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(txn.createdAt).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="font-medium">{txn.walletId?.userId?.name || "Unknown"}</div>
                    <div className="text-xs text-muted-foreground">{txn.walletId?.userId?.email}</div>
                  </td>
                  <td className="p-3 max-w-xs truncate">{txn.description}</td>
                  <td className="p-3 font-mono text-sm">{txn.reference || "-"}</td>
                  <td className="p-3 text-center">
                    <Badge variant={txn.type === "credit" ? "default" : "secondary"}>
                      {txn.type === "credit" ? (
                        <><ArrowDownLeft className="h-3 w-3 mr-1" /> Credit</>
                      ) : (
                        <><ArrowUpRight className="h-3 w-3 mr-1" /> Debit</>
                      )}
                    </Badge>
                  </td>
                  <td className={`p-3 text-right font-bold ${txn.type === "credit" ? "text-green-600" : "text-red-600"}`}>
                    {txn.type === "credit" ? "+" : "-"}₹{txn.amount.toLocaleString()}
                  </td>
                  <td className="p-3 text-center">
                    <Badge variant={
                      txn.status === "completed" ? "default" :
                      txn.status === "pending" ? "secondary" : "destructive"
                    }>
                      {txn.status}
                    </Badge>
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

export default TransactionsPage;
