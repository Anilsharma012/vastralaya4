import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  Filter
} from 'lucide-react';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  description: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  reference?: string;
}

export default function TransactionsPage() {
  const transactions: Transaction[] = [
    {
      id: '1',
      type: 'debit',
      description: 'Purchase - Designer Long-Sleeve Crop Blouse',
      amount: 3900,
      date: '2025-01-05',
      status: 'completed',
      reference: 'ORD-2025-001'
    },
    {
      id: '2',
      type: 'credit',
      description: 'Refund - Product Return',
      amount: 2500,
      date: '2025-01-03',
      status: 'completed',
      reference: 'RET-2025-001'
    },
    {
      id: '3',
      type: 'credit',
      description: 'Wallet Top-up',
      amount: 5000,
      date: '2025-01-02',
      status: 'completed',
      reference: 'TRX-2025-001'
    },
    {
      id: '4',
      type: 'debit',
      description: 'Purchase - Saree Collection',
      amount: 7850,
      date: '2024-12-28',
      status: 'completed',
      reference: 'ORD-2024-999'
    },
    {
      id: '5',
      type: 'credit',
      description: 'Referral Bonus',
      amount: 100,
      date: '2024-12-25',
      status: 'completed',
      reference: 'REF-2024-001'
    }
  ];

  const totalDebit = transactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalCredit = transactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">View all your transaction history</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ArrowDownLeft className="h-5 w-5 text-red-500" />
                <span className="text-sm text-muted-foreground">Total Spent</span>
              </div>
              <p className="text-2xl font-bold">₹{totalDebit.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ArrowUpRight className="h-5 w-5 text-green-500" />
                <span className="text-sm text-muted-foreground">Total Received</span>
              </div>
              <p className="text-2xl font-bold">₹{totalCredit.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Total Transactions</span>
              </div>
              <p className="text-2xl font-bold">{transactions.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>All your transactions in one place</CardDescription>
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No transactions found</p>
              </div>
            ) : (
              transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between gap-4 p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                  data-testid={`transaction-${transaction.id}`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      transaction.type === 'debit' 
                        ? 'bg-red-100 dark:bg-red-950' 
                        : 'bg-green-100 dark:bg-green-950'
                    }`}>
                      {transaction.type === 'debit' ? (
                        <ArrowDownLeft className="h-5 w-5 text-red-600 dark:text-red-400" />
                      ) : (
                        <ArrowUpRight className="h-5 w-5 text-green-600 dark:text-green-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{transaction.description}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                        {transaction.reference && (
                          <p className="text-xs text-muted-foreground">
                            • {transaction.reference}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <p className={`font-semibold text-lg ${
                        transaction.type === 'debit' 
                          ? 'text-red-600 dark:text-red-400' 
                          : 'text-green-600 dark:text-green-400'
                      }`}>
                        {transaction.type === 'debit' ? '-' : '+'}₹{transaction.amount.toLocaleString()}
                      </p>
                      <Badge 
                        variant={
                          transaction.status === 'completed' ? 'default' :
                          transaction.status === 'pending' ? 'secondary' :
                          'destructive'
                        }
                        className="text-xs mt-1"
                      >
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
