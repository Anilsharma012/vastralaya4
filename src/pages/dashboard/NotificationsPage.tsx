import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell,
  Trash2,
  Package,
  LogIn,
  UserPlus,
  Truck,
  CheckCircle,
  Loader2,
  CheckCheck
} from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  _id: string;
  type: 'signup' | 'login' | 'order_confirmed' | 'order_delivered' | 'order_shipped' | 'promotion' | 'reward' | 'system';
  title: string;
  message: string;
  orderId?: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await api.get<Notification[]>('/user/notifications');
      setNotifications(data);
    } catch (error: any) {
      toast({ title: error.message || 'Failed to load notifications', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.put(`/user/notifications/${id}/read`, {});
      setNotifications(notifications.map(n => 
        n._id === id ? { ...n, read: true } : n
      ));
    } catch (error: any) {
      toast({ title: 'Failed to mark as read', variant: 'destructive' });
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/user/notifications/mark-all-read', {});
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      toast({ title: 'All notifications marked as read' });
    } catch (error: any) {
      toast({ title: 'Failed to mark all as read', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/user/notifications/${id}`);
      setNotifications(notifications.filter(n => n._id !== id));
      toast({ title: 'Notification deleted' });
    } catch (error: any) {
      toast({ title: 'Failed to delete notification', variant: 'destructive' });
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'signup':
        return <UserPlus className="h-5 w-5 text-green-600" />;
      case 'login':
        return <LogIn className="h-5 w-5 text-blue-600" />;
      case 'order_confirmed':
        return <Package className="h-5 w-5 text-purple-600" />;
      case 'order_shipped':
        return <Truck className="h-5 w-5 text-orange-600" />;
      case 'order_delivered':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return <Bell className="h-5 w-5 text-primary" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">Stay updated with your orders and account activity</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <>
              <Badge variant="default">
                <Bell className="h-3 w-3 mr-1" />
                {unreadCount} New
              </Badge>
              <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
                <CheckCheck className="h-4 w-4 mr-1" />
                Mark All Read
              </Button>
            </>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No notifications yet</h3>
            <p className="text-muted-foreground">We'll notify you about important updates here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card 
              key={notification._id} 
              className={notification.read ? '' : 'border-primary/50 bg-primary/5'}
              data-testid={`notification-${notification._id}`}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div 
                    className="flex items-start gap-4 flex-1 cursor-pointer"
                    onClick={() => !notification.read && handleMarkAsRead(notification._id)}
                  >
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{notification.title}</h3>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0"
                    onClick={() => handleDelete(notification._id)}
                    data-testid={`button-delete-${notification._id}`}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
