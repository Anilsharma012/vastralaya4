import { useState, useEffect } from "react";
import { Search, RefreshCw, Truck, Package, MapPin, Eye, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface ShiprocketOrder {
  _id: string;
  orderId: {
    _id: string;
    orderId: string;
    total: number;
    orderStatus: string;
    shippingAddress: {
      name: string;
      phone: string;
      address: string;
      city: string;
      state: string;
      pincode: string;
    };
    userId: { name: string; email: string };
  };
  shiprocketOrderId: string;
  shiprocketShipmentId?: string;
  awbNumber?: string;
  courierName?: string;
  status: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
  syncedAt: string;
  createdAt: string;
}

const statusOptions = [
  { value: 'new', label: 'New', color: 'bg-blue-500' },
  { value: 'pickup_scheduled', label: 'Pickup Scheduled', color: 'bg-purple-500' },
  { value: 'pickup_generated', label: 'Pickup Generated', color: 'bg-indigo-500' },
  { value: 'manifested', label: 'Manifested', color: 'bg-cyan-500' },
  { value: 'shipped', label: 'Shipped', color: 'bg-orange-500' },
  { value: 'in_transit', label: 'In Transit', color: 'bg-yellow-500' },
  { value: 'out_for_delivery', label: 'Out for Delivery', color: 'bg-teal-500' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-500' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500' },
  { value: 'rto_initiated', label: 'RTO Initiated', color: 'bg-pink-500' },
  { value: 'rto_delivered', label: 'RTO Delivered', color: 'bg-gray-500' }
];

const ShiprocketPage = () => {
  const [orders, setOrders] = useState<ShiprocketOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<ShiprocketOrder | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [updateData, setUpdateData] = useState({ status: '', awbNumber: '', courierName: '', trackingUrl: '', shiprocketShipmentId: '', estimatedDelivery: '' });
  const { toast } = useToast();

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const loadOrders = async () => {
    try {
      const query = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const data = await api.get<{ orders: ShiprocketOrder[] }>(`/admin/shiprocket/orders${query}`);
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error loading Shiprocket orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const result = await api.post<{ message: string; synced: number }>('/admin/shiprocket/sync', {});
      toast({ title: result.message });
      loadOrders();
    } catch (error: any) {
      toast({ title: error.message || "Sync failed", variant: "destructive" });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleViewOrder = (order: ShiprocketOrder) => {
    setSelectedOrder(order);
    setUpdateData({
      status: order.status,
      awbNumber: order.awbNumber || '',
      courierName: order.courierName || '',
      trackingUrl: order.trackingUrl || '',
      shiprocketShipmentId: order.shiprocketShipmentId || '',
      estimatedDelivery: order.estimatedDelivery ? new Date(order.estimatedDelivery).toISOString().split('T')[0] : ''
    });
    setShowDialog(true);
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;
    
    try {
      await api.put(`/admin/shiprocket/orders/${selectedOrder._id}`, updateData);
      toast({ title: "Order updated successfully" });
      setShowDialog(false);
      loadOrders();
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

  const filteredOrders = orders.filter(order => 
    order.orderId?.orderId?.toLowerCase().includes(search.toLowerCase()) ||
    order.awbNumber?.toLowerCase().includes(search.toLowerCase()) ||
    order.shiprocketOrderId?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return <div className="p-6">Loading Shiprocket orders...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Shiprocket Integration</h1>
          <p className="text-sm text-muted-foreground">Manage shipping and track orders</p>
        </div>
        <Button onClick={handleSync} disabled={isSyncing} data-testid="button-sync">
          <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing...' : 'Sync Orders'}
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">New</p>
                <p className="text-2xl font-bold">{orders.filter(o => o.status === 'new').length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Transit</p>
                <p className="text-2xl font-bold">{orders.filter(o => ['shipped', 'in_transit', 'out_for_delivery'].includes(o.status)).length}</p>
              </div>
              <Truck className="h-8 w-8 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Delivered</p>
                <p className="text-2xl font-bold">{orders.filter(o => o.status === 'delivered').length}</p>
              </div>
              <MapPin className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{orders.length}</p>
              </div>
              <Package className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by order ID, AWB..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]" data-testid="select-status-filter">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {statusOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No Shiprocket orders found. Click "Sync Orders" to import confirmed orders.
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order._id} data-testid={`card-order-${order._id}`}>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-bold">#{order.orderId?.orderId}</span>
                      {getStatusBadge(order.status)}
                      {order.awbNumber && (
                        <Badge variant="outline">AWB: {order.awbNumber}</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Customer: {order.orderId?.userId?.name}</p>
                      <p>Destination: {order.orderId?.shippingAddress?.city}, {order.orderId?.shippingAddress?.state} - {order.orderId?.shippingAddress?.pincode}</p>
                      {order.courierName && <p>Courier: {order.courierName}</p>}
                      {order.estimatedDelivery && <p>Est. Delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}</p>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="font-bold">Rs. {order.orderId?.total?.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground">
                      Synced: {new Date(order.syncedAt).toLocaleString()}
                    </span>
                    <div className="flex gap-2">
                      {order.trackingUrl && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Track
                          </a>
                        </Button>
                      )}
                      <Button size="sm" onClick={() => handleViewOrder(order)} data-testid={`button-view-${order._id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        Update
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Update Shipment #{selectedOrder?.orderId?.orderId}</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg text-sm">
                <p><strong>Customer:</strong> {selectedOrder.orderId?.userId?.name}</p>
                <p><strong>Address:</strong> {selectedOrder.orderId?.shippingAddress?.address}, {selectedOrder.orderId?.shippingAddress?.city}, {selectedOrder.orderId?.shippingAddress?.state} - {selectedOrder.orderId?.shippingAddress?.pincode}</p>
              </div>

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
                  <Label>Courier Name</Label>
                  <Input
                    value={updateData.courierName}
                    onChange={(e) => setUpdateData({ ...updateData, courierName: e.target.value })}
                    placeholder="e.g., BlueDart"
                    data-testid="input-courier"
                  />
                </div>
              </div>

              <div>
                <Label>AWB Number</Label>
                <Input
                  value={updateData.awbNumber}
                  onChange={(e) => setUpdateData({ ...updateData, awbNumber: e.target.value })}
                  placeholder="Enter AWB/tracking number"
                  data-testid="input-awb"
                />
              </div>

              <div>
                <Label>Shiprocket Shipment ID</Label>
                <Input
                  value={updateData.shiprocketShipmentId}
                  onChange={(e) => setUpdateData({ ...updateData, shiprocketShipmentId: e.target.value })}
                  placeholder="Shiprocket shipment ID"
                  data-testid="input-shipment-id"
                />
              </div>

              <div>
                <Label>Tracking URL</Label>
                <Input
                  value={updateData.trackingUrl}
                  onChange={(e) => setUpdateData({ ...updateData, trackingUrl: e.target.value })}
                  placeholder="https://..."
                  data-testid="input-tracking-url"
                />
              </div>

              <div>
                <Label>Estimated Delivery</Label>
                <Input
                  type="date"
                  value={updateData.estimatedDelivery}
                  onChange={(e) => setUpdateData({ ...updateData, estimatedDelivery: e.target.value })}
                  data-testid="input-est-delivery"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdateOrder} data-testid="button-save">
              Update Shipment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShiprocketPage;
