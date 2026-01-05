import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell,
  Trash2,
  Mail,
  Package,
  Star,
  Gift
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'order' | 'promotion' | 'review' | 'reward';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const notifications: Notification[] = [
    {
      id: '1',
      type: 'order',
      title: 'Order Delivered',
      message: 'Your order #ORD-2025-001 has been delivered successfully',
      read: false,
      createdAt: '2025-01-05'
    },
    {
      id: '2',
      type: 'promotion',
      title: 'Special Offer',
      message: 'Get 20% off on all ethnic wear this weekend!',
      read: false,
      createdAt: '2025-01-04'
    },
    {
      id: '3',
      type: 'review',
      title: 'Share Your Review',
      message: 'How was your experience with the Designer Long-Sleeve Crop Blouse?',
      read: true,
      createdAt: '2025-01-03'
    },
    {
      id: '4',
      type: 'reward',
      title: 'Rewards Earned',
      message: 'You earned 35 stars on your recent purchase!',
      read: true,
      createdAt: '2025-01-02'
    }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Package className="h-5 w-5 text-blue-600" />;
      case 'promotion':
        return <Gift className="h-5 w-5 text-purple-600" />;
      case 'review':
        return <Star className="h-5 w-5 text-yellow-600" />;
      case 'reward':
        return <Badge className="h-5 w-5 text-green-600" />;
      default:
        return <Mail className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">Stay updated with your orders and offers</p>
        </div>
        {unreadCount > 0 && (
          <Badge variant="default">
            <Bell className="h-3 w-3 mr-1" />
            {unreadCount} New
          </Badge>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No notifications yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={notification.read ? '' : 'border-primary/50 bg-primary/5'}
              data-testid={`notification-${notification.id}`}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
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
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0"
                    data-testid={`button-delete-${notification.id}`}
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
