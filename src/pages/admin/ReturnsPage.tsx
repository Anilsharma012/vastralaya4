import { useState, useEffect } from "react";
import { Search, Eye, Check, X, Truck, RefreshCw, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface ReturnRequest {
  _id: string;
  returnId: string;
  orderId: { _id: string; orderId: string; total: number; orderStatus: string; deliveredAt?: string };
  userId: { _id: string; name: string; email: string; phone?: string };
  items: { productId: string; name: string; quantity: number; price: number; reason: string; images?: string[] }[];
  status: string;
  type: 'return' | 'exchange' | 'refund';
  reason: string;
  additionalNotes?: string;
  images?: string[];
  refundAmount?: number;
  refundMethod?: string;
  refundStatus?: string;
  bankAccountNumber?: string;
  upiId?: string;
  accountHolderName?: string;
  awbNumber?: string;
  courierName?: string;
  trackingUrl?: string;
  adminNotes?: string;
  createdAt: string;
}

const statusOptions = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500' },
  { value: 'approved', label: 'Approved', color: 'bg-blue-500' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-500' },
  { value: 'pickup_scheduled', label: 'Pickup Scheduled', color: 'bg-purple-500' },
  { value: 'picked_up', label: 'Picked Up', color: 'bg-indigo-500' },
  { value: 'received', label: 'Received', color: 'bg-cyan-500' },
  { value: 'inspecting', label: 'Inspecting', color: 'bg-orange-500' },
  { value: 'refund_initiated', label: 'Refund Initiated', color: 'bg-teal-500' },
  { value: 'refund_completed', label: 'Refund Completed', color: 'bg-green-500' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-gray-500' }
];

const ReturnsPage = () => {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [updateData, setUpdateData] = useState({ status: '', refundAmount: 0, refundMethod: 'wallet', adminNotes: '', awbNumber: '', courierName: '', trackingUrl: '' });
  const { toast } = useToast();

  useEffect(() => {
    loadReturns();
  }, [statusFilter]);

  const loadReturns = async () => {
    try {
      const query = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const data = await api.get<{ returns: ReturnRequest[] }>(`/admin/returns${query}`);
      setReturns(data.returns || []);
    } catch (error) {
      toast({ title: "Error loading returns", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewReturn = (ret: ReturnRequest) => {
    setSelectedReturn(ret);
    setUpdateData({
      status: ret.status,
      refundAmount: ret.refundAmount || ret.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      refundMethod: ret.refundMethod || 'wallet',
      adminNotes: ret.adminNotes || '',
      awbNumber: ret.awbNumber || '',
      courierName: ret.courierName || '',
      trackingUrl: ret.trackingUrl || ''
    });
    setShowDialog(true);
  };

  const handleUpdateReturn = async () => {
    if (!selectedReturn) return;
    
    try {
      await api.put(`/admin/returns/${selectedReturn._id}`, updateData);
      toast({ title: "Return request updated" });
      setShowDialog(false);
      loadReturns();
    } catch (error) {
      toast({ title: "Update failed", variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    const option = statusOptions.find(s => s.value === status);
    return option ? (
      <Badge className={option.color}>{option.label}</Badge>
    ) : (
      <Badge variant="secondary">{status}</Badge>
    );
  };

  const filteredReturns = returns.filter(ret => 
    ret.returnId?.toLowerCase().includes(search.toLowerCase()) ||
    ret.orderId?.orderId?.toLowerCase().includes(search.toLowerCase()) ||
    ret.userId?.name?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return <div className="p-6">Loading returns...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold" data-testid="text-page-title">Returns & Refunds</h1>
        <div className="flex flex-wrap items-center gap-2">
          {statusOptions.slice(0, 4).map(status => (
            <Badge 
              key={status.value}
              variant={statusFilter === status.value ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setStatusFilter(status.value)}
            >
              {status.label} ({returns.filter(r => r.status === status.value).length})
            </Badge>
          ))}
          <Badge 
            variant={statusFilter === "all" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setStatusFilter("all")}
          >
            All ({returns.length})
          </Badge>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by return ID, order ID, or customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
          data-testid="input-search"
        />
      </div>

      <div className="grid gap-4">
        {filteredReturns.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No return requests found
            </CardContent>
          </Card>
        ) : (
          filteredReturns.map((ret) => (
            <Card key={ret._id} data-testid={`card-return-${ret._id}`}>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-bold">#{ret.returnId}</span>
                      {getStatusBadge(ret.status)}
                      <Badge variant="outline">{ret.type.toUpperCase()}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Order: #{ret.orderId?.orderId}</p>
                      <p>Customer: {ret.userId?.name} ({ret.userId?.email})</p>
                      <p>Reason: {ret.reason}</p>
                      <p>Items: {ret.items?.length || 0} | Total: Rs. {ret.items?.reduce((s, i) => s + i.price * i.quantity, 0).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-sm text-muted-foreground">
                      {new Date(ret.createdAt).toLocaleDateString()}
                    </span>
                    <Button size="sm" onClick={() => handleViewReturn(ret)} data-testid={`button-view-${ret._id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View & Process
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Return Request #{selectedReturn?.returnId}</DialogTitle>
          </DialogHeader>
          
          {selectedReturn && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Order ID</p>
                  <p className="font-medium">#{selectedReturn.orderId?.orderId}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Customer</p>
                  <p className="font-medium">{selectedReturn.userId?.name}</p>
                  <p className="text-xs">{selectedReturn.userId?.email}</p>
                  {selectedReturn.userId?.phone && <p className="text-xs">{selectedReturn.userId.phone}</p>}
                </div>
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-medium">{selectedReturn.type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Reason</p>
                  <p className="font-medium">{selectedReturn.reason}</p>
                </div>
                {selectedReturn.orderId?.deliveredAt && (
                  <div>
                    <p className="text-muted-foreground">Delivered On</p>
                    <p className="font-medium">{new Date(selectedReturn.orderId.deliveredAt).toLocaleDateString()}</p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">Requested On</p>
                  <p className="font-medium">{new Date(selectedReturn.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="border p-4 rounded-lg bg-muted/30">
                <h4 className="font-semibold mb-3">Refund Details (Customer Provided)</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {selectedReturn.bankAccountNumber && (
                    <div>
                      <p className="text-muted-foreground">Bank Account Number</p>
                      <p className="font-medium font-mono">{selectedReturn.bankAccountNumber}</p>
                    </div>
                  )}
                  {selectedReturn.upiId && (
                    <div>
                      <p className="text-muted-foreground">UPI ID</p>
                      <p className="font-medium">{selectedReturn.upiId}</p>
                    </div>
                  )}
                  {selectedReturn.accountHolderName && (
                    <div>
                      <p className="text-muted-foreground">Account Holder Name</p>
                      <p className="font-medium">{selectedReturn.accountHolderName}</p>
                    </div>
                  )}
                  {!selectedReturn.bankAccountNumber && !selectedReturn.upiId && (
                    <div className="col-span-2 text-muted-foreground italic">
                      No refund details provided by customer
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-sm text-muted-foreground">Items</Label>
                <div className="mt-2 space-y-2">
                  {selectedReturn.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between p-2 bg-muted rounded">
                      <span>{item.name} x{item.quantity}</span>
                      <span>Rs. {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedReturn.images && selectedReturn.images.length > 0 && (
                <div>
                  <Label className="text-sm text-muted-foreground">Customer Images</Label>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {selectedReturn.images.map((img, idx) => (
                      <img key={idx} src={img} alt="" className="w-20 h-20 object-cover rounded" />
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <Select value={updateData.status} onValueChange={(v) => setUpdateData({ ...updateData, status: v })}>
                    <SelectTrigger data-testid="select-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Refund Amount</Label>
                  <Input
                    type="number"
                    value={updateData.refundAmount}
                    onChange={(e) => setUpdateData({ ...updateData, refundAmount: Number(e.target.value) })}
                    data-testid="input-refund-amount"
                  />
                </div>
                <div>
                  <Label>Refund Method</Label>
                  <Select value={updateData.refundMethod} onValueChange={(v) => setUpdateData({ ...updateData, refundMethod: v })}>
                    <SelectTrigger data-testid="select-refund-method">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wallet">Wallet</SelectItem>
                      <SelectItem value="original">Original Payment Method</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Courier Name</Label>
                  <Input
                    value={updateData.courierName}
                    onChange={(e) => setUpdateData({ ...updateData, courierName: e.target.value })}
                    placeholder="e.g., BlueDart, Delhivery"
                    data-testid="input-courier"
                  />
                </div>
              </div>

              <div>
                <Label>AWB / Tracking Number</Label>
                <Input
                  value={updateData.awbNumber}
                  onChange={(e) => setUpdateData({ ...updateData, awbNumber: e.target.value })}
                  placeholder="Enter pickup AWB number"
                  data-testid="input-awb"
                />
              </div>

              <div>
                <Label>Tracking URL</Label>
                <Input
                  value={updateData.trackingUrl}
                  onChange={(e) => setUpdateData({ ...updateData, trackingUrl: e.target.value })}
                  placeholder="https://tracking.courier.com/..."
                  data-testid="input-tracking-url"
                />
              </div>

              <div>
                <Label>Admin Notes</Label>
                <Textarea
                  value={updateData.adminNotes}
                  onChange={(e) => setUpdateData({ ...updateData, adminNotes: e.target.value })}
                  placeholder="Internal notes about this return..."
                  data-testid="input-notes"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdateReturn} data-testid="button-save">
              Update Return
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReturnsPage;
