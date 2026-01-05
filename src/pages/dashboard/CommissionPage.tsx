import { useState, useEffect } from "react";
import { DollarSign, Clock, AlertCircle, CheckCircle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface CommissionData {
  rate: number;
  pendingAmount: number;
  availableAmount: number;
  paidAmount: number;
  totalEarned: number;
}

interface Payout {
  _id: string;
  amount: number;
  method: string;
  status: string;
  createdAt: string;
  processedAt?: string;
}

export default function CommissionPage() {
  const { toast } = useToast();
  const [commission, setCommission] = useState<CommissionData | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequestingPayout, setIsRequestingPayout] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState<'bank' | 'upi'>('bank');
  const [payoutAmount, setPayoutAmount] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const influencer = await api.get<any>('/user/influencer');
      if (!influencer || influencer.status !== 'approved') {
        toast({
          title: 'Not an Influencer',
          description: 'You need to be an approved influencer to view commission',
          variant: 'destructive'
        });
        return;
      }

      const earnings = await api.get<{ payouts: Payout[], monthlyEarnings: any[], commission: any }>('/influencer/earnings');
      
      setCommission(earnings?.commission);
      setPayouts(earnings?.payouts || []);
    } catch (error) {
      console.error('Failed to load commission data:', error);
      toast({
        title: 'Failed to load commission data',
        description: 'Please try again later',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayoutRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!payoutAmount || isNaN(Number(payoutAmount))) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount',
        variant: 'destructive'
      });
      return;
    }

    const amount = Number(payoutAmount);
    
    if (!commission || amount > commission.availableAmount) {
      toast({
        title: 'Insufficient Balance',
        description: `Available balance is Rs. ${commission?.availableAmount.toLocaleString() || 0}`,
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsRequestingPayout(true);
      await api.post('/influencer/request-payout', {
        amount,
        method: payoutMethod
      });

      toast({
        title: 'Payout Requested',
        description: `Your payout request for Rs. ${amount.toLocaleString()} has been submitted`,
      });

      setPayoutAmount('');
      await loadData();
    } catch (error: any) {
      toast({
        title: 'Payout Request Failed',
        description: error.response?.data?.message || 'Please try again later',
        variant: 'destructive'
      });
    } finally {
      setIsRequestingPayout(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading commission data...</p>
      </div>
    );
  }

  if (!commission) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Commission</h1>
          <p className="text-muted-foreground">Manage your earnings and payouts</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">You are not an approved influencer. <a href="/dashboard/influencer" className="text-primary underline">Apply now</a></p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Commission</h1>
        <p className="text-muted-foreground">Manage your earnings and payouts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Commission Rate</p>
                <p className="text-3xl font-bold text-primary">{commission.rate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Amount</p>
                <p className="text-2xl font-bold text-yellow-600">Rs. {commission.pendingAmount?.toLocaleString() || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available Balance</p>
                <p className="text-2xl font-bold text-green-600">Rs. {commission.availableAmount?.toLocaleString() || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Earned</p>
                <p className="text-2xl font-bold">Rs. {commission.totalEarned?.toLocaleString() || 0}</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Request Payout</CardTitle>
            <CardDescription>Request a withdrawal of your available commission</CardDescription>
          </CardHeader>
          <CardContent>
            {commission.availableAmount === 0 ? (
              <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <p className="text-sm text-blue-800">You don't have any available balance to request a payout</p>
              </div>
            ) : (
              <form onSubmit={handlePayoutRequest} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Payout Amount (Rs.)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    max={commission.availableAmount}
                    min={100}
                    step={100}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Available: Rs. {commission.availableAmount?.toLocaleString() || 0}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="method">Payout Method</Label>
                  <Select value={payoutMethod} onValueChange={(value: any) => setPayoutMethod(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full" disabled={isRequestingPayout}>
                  {isRequestingPayout ? 'Processing...' : 'Request Payout'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Earned</span>
              <span className="font-bold">Rs. {commission.totalEarned?.toLocaleString() || 0}</span>
            </div>
            <div className="border-t pt-4 flex justify-between">
              <span className="text-muted-foreground">Total Paid</span>
              <span className="font-bold text-green-600">Rs. {commission.paidAmount?.toLocaleString() || 0}</span>
            </div>
            <div className="border-t pt-4 flex justify-between">
              <span className="text-muted-foreground">Pending</span>
              <span className="font-bold text-yellow-600">Rs. {commission.pendingAmount?.toLocaleString() || 0}</span>
            </div>
            <div className="border-t pt-4 flex justify-between bg-green-50 p-3 rounded-lg">
              <span className="font-semibold">Available to Withdraw</span>
              <span className="font-bold text-green-600">Rs. {commission.availableAmount?.toLocaleString() || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
          <CardDescription>Your previous payout requests and transfers</CardDescription>
        </CardHeader>
        <CardContent>
          {payouts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No payout requests yet</p>
          ) : (
            <div className="space-y-4">
              {payouts.map((payout) => (
                <div key={payout._id} className="flex flex-wrap items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-bold">Rs. {payout.amount.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">via {payout.method.toUpperCase()}</p>
                  </div>
                  <Badge variant={payout.status === 'completed' ? 'default' : payout.status === 'pending' ? 'secondary' : 'destructive'}>
                    {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                  </Badge>
                  <div className="text-right text-sm text-muted-foreground">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {new Date(payout.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
