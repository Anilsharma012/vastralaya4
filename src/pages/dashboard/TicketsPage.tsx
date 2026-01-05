import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MessageSquare, Plus, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { Label } from '@/components/ui/label';

interface Ticket {
  _id: string;
  ticketId: string;
  subject: string;
  category: string;
  status: string;
  createdAt: string;
}

const statusIcons: Record<string, React.ReactNode> = {
  open: <AlertCircle className="h-4 w-4" />,
  in_progress: <Clock className="h-4 w-4" />,
  resolved: <CheckCircle className="h-4 w-4" />,
  closed: <CheckCircle className="h-4 w-4" />,
  waiting_customer: <Clock className="h-4 w-4" />,
};

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    subject: '',
    category: 'general',
    message: ''
  });

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setIsLoading(true);
      const data = await api.get<{ tickets: Ticket[] }>('/user/tickets');
      setTickets(data.tickets || []);
    } catch (error) {
      console.error('Error loading tickets:', error);
      toast({ 
        title: 'Error loading tickets', 
        variant: 'destructive' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTicket = async () => {
    if (!formData.subject.trim() || !formData.message.trim()) {
      toast({
        title: 'Please fill all fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post('/user/tickets', {
        subject: formData.subject,
        category: formData.category,
        message: formData.message
      });

      toast({
        title: 'Ticket created successfully',
        description: 'We will get back to you soon'
      });

      setFormData({ subject: '', category: 'general', message: '' });
      setIsCreateOpen(false);
      await loadTickets();
    } catch (error: any) {
      console.error('Error creating ticket:', error);
      toast({
        title: error.response?.data?.message || 'Failed to create ticket',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Support Tickets</h1>
          <p className="text-muted-foreground">Get help with your orders and account</p>
        </div>
        <Button 
          onClick={() => setIsCreateOpen(true)}
          data-testid="button-create-ticket"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Ticket
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading tickets...</p>
            </div>
          </CardContent>
        </Card>
      ) : tickets.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No support tickets</h3>
              <p className="text-muted-foreground mb-6">
                Need help? Create a support ticket and we'll get back to you.
              </p>
              <Button 
                onClick={() => setIsCreateOpen(true)}
                data-testid="button-create-ticket-empty"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Ticket
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <Card key={ticket._id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="font-mono text-sm text-muted-foreground">
                        {ticket.ticketId}
                      </span>
                      <Badge 
                        variant={ticket.status === 'open' || ticket.status === 'in_progress' ? 'default' : 'secondary'}
                        className="inline-flex items-center gap-1"
                      >
                        {statusIcons[ticket.status]}
                        <span className="capitalize">{ticket.status.replace('_', ' ')}</span>
                      </Badge>
                      <Badge variant="outline">{ticket.category}</Badge>
                    </div>
                    <h3 className="font-semibold text-foreground">{ticket.subject}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Created on {formatDate(ticket.createdAt)}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">View Details</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Support Ticket</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Describe your issue and we'll help you as soon as possible
            </p>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Brief description of your issue"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger id="category" disabled={isSubmitting}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Inquiry</SelectItem>
                  <SelectItem value="order">Order Issue</SelectItem>
                  <SelectItem value="delivery">Delivery Problem</SelectItem>
                  <SelectItem value="product">Product Quality</SelectItem>
                  <SelectItem value="return">Return/Refund</SelectItem>
                  <SelectItem value="payment">Payment Issue</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <textarea
                id="message"
                placeholder="Please provide detailed information about your issue"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                rows={5}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateTicket}
              disabled={isSubmitting}
              data-testid="button-submit-ticket"
            >
              {isSubmitting ? 'Creating...' : 'Create Ticket'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
