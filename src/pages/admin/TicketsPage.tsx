import { useState, useEffect } from "react";
import { Search, MessageSquare, Send, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

interface TicketMessage {
  _id: string;
  senderId: string;
  senderType: 'user' | 'admin';
  message: string;
  createdAt: string;
}

interface Ticket {
  _id: string;
  ticketId: string;
  userId: { _id: string; name: string; email: string };
  orderId?: { orderId: string };
  subject: string;
  category: string;
  priority: string;
  status: string;
  messages: TicketMessage[];
  createdAt: string;
}

const statusColors: Record<string, string> = {
  open: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  in_progress: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  waiting_customer: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  resolved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  closed: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
};

const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  medium: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
};

const TicketsPage = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTickets();
  }, [statusFilter]);

  const loadTickets = async () => {
    try {
      setIsLoading(true);
      const query = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const data = await api.get<{ tickets: Ticket[] }>(`/admin/tickets${query}`);
      setTickets(data.tickets);
    } catch (error) {
      toast({ title: "Error loading tickets", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId: string, newStatus: string) => {
    try {
      await api.put(`/admin/tickets/${ticketId}`, { status: newStatus });
      toast({ title: `Ticket status updated to ${newStatus.replace('_', ' ')}` });
      loadTickets();
      if (selectedTicket?._id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status: newStatus });
      }
    } catch (error) {
      toast({ title: "Error updating ticket", variant: "destructive" });
    }
  };

  const updateTicketPriority = async (ticketId: string, newPriority: string) => {
    try {
      await api.put(`/admin/tickets/${ticketId}`, { priority: newPriority });
      toast({ title: `Priority updated to ${newPriority}` });
      loadTickets();
    } catch (error) {
      toast({ title: "Error updating priority", variant: "destructive" });
    }
  };

  const sendReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;
    try {
      setIsSending(true);
      const updated = await api.post<Ticket>(`/admin/tickets/${selectedTicket._id}/reply`, { message: replyMessage });
      setSelectedTicket(updated);
      setReplyMessage("");
      toast({ title: "Reply sent successfully" });
      loadTickets();
    } catch (error) {
      toast({ title: "Error sending reply", variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };

  const filteredTickets = tickets.filter(t =>
    t.ticketId.toLowerCase().includes(search.toLowerCase()) ||
    t.subject.toLowerCase().includes(search.toLowerCase()) ||
    t.userId?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const openTicketDetail = async (ticket: Ticket) => {
    try {
      const full = await api.get<Ticket>(`/admin/tickets/${ticket._id}`);
      setSelectedTicket(full);
      setIsDetailOpen(true);
    } catch (error) {
      toast({ title: "Error loading ticket details", variant: "destructive" });
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', { 
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Support Tickets</h1>
          <p className="text-muted-foreground">Manage customer support requests</p>
        </div>
        <Button onClick={loadTickets} variant="outline" data-testid="button-refresh">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
        <TabsList className="flex flex-wrap w-full justify-start gap-1">
          <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
          <TabsTrigger value="open" data-testid="tab-open">Open</TabsTrigger>
          <TabsTrigger value="in_progress" data-testid="tab-in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="waiting_customer" data-testid="tab-waiting">Waiting</TabsTrigger>
          <TabsTrigger value="resolved" data-testid="tab-resolved">Resolved</TabsTrigger>
          <TabsTrigger value="closed" data-testid="tab-closed">Closed</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by ticket ID, subject, or customer..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" data-testid="input-search-tickets" />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="h-16 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredTickets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No tickets found</h3>
            <p className="text-muted-foreground">Support tickets will appear here when customers create them</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map((ticket) => (
            <Card key={ticket._id} className="cursor-pointer hover-elevate" onClick={() => openTicketDetail(ticket)} data-testid={`card-ticket-${ticket._id}`}>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-mono font-bold">{ticket.ticketId}</span>
                      <Badge className={statusColors[ticket.status]}>
                        {ticket.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <Badge className={priorityColors[ticket.priority]}>
                        {ticket.priority.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">{ticket.category}</Badge>
                    </div>
                    <p className="font-medium">{ticket.subject}</p>
                    <p className="text-sm text-muted-foreground">{ticket.userId?.name} - {ticket.userId?.email}</p>
                    {ticket.orderId && <p className="text-xs text-muted-foreground">Order: {ticket.orderId.orderId}</p>}
                    <p className="text-xs text-muted-foreground mt-1">{formatDate(ticket.createdAt)} | {ticket.messages.length} message(s)</p>
                  </div>
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <Select value={ticket.status} onValueChange={(v) => updateTicketStatus(ticket._id, v)}>
                      <SelectTrigger className="w-[130px]" data-testid={`select-status-${ticket._id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="waiting_customer">Waiting</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Ticket {selectedTicket?.ticketId} - {selectedTicket?.subject}</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="flex flex-col flex-1 min-h-0">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Select value={selectedTicket.status} onValueChange={(v) => updateTicketStatus(selectedTicket._id, v)}>
                    <SelectTrigger data-testid="select-detail-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="waiting_customer">Waiting</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-muted-foreground">Priority</Label>
                  <Select value={selectedTicket.priority} onValueChange={(v) => updateTicketPriority(selectedTicket._id, v)}>
                    <SelectTrigger data-testid="select-detail-priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mb-4">
                <Label className="text-muted-foreground">Customer</Label>
                <p className="font-medium">{selectedTicket.userId?.name}</p>
                <p className="text-sm text-muted-foreground">{selectedTicket.userId?.email}</p>
              </div>

              <Label className="text-muted-foreground mb-2">Conversation</Label>
              <ScrollArea className="flex-1 border rounded-md p-4 mb-4 max-h-[300px]">
                <div className="space-y-4">
                  {selectedTicket.messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-lg ${msg.senderType === 'admin' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        <p className="text-xs mb-1 opacity-70">{msg.senderType === 'admin' ? 'Support Team' : selectedTicket.userId?.name}</p>
                        <p>{msg.message}</p>
                        <p className="text-xs mt-1 opacity-70">{formatDate(msg.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="flex gap-2">
                <Textarea 
                  placeholder="Type your reply..." 
                  value={replyMessage} 
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="flex-1"
                  data-testid="input-reply"
                />
                <Button onClick={sendReply} disabled={!replyMessage.trim() || isSending} data-testid="button-send-reply">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TicketsPage;
