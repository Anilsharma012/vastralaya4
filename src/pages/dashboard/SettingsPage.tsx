import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { 
  Bell,
  Mail,
  Eye,
  Lock,
  LogOut
} from 'lucide-react';

export default function SettingsPage() {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    promotionalEmails: false,
    orderUpdates: true,
    newArrivals: false,
    twoFactorAuth: false,
  });

  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handlePreferenceChange = (key: string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    toast({
      title: 'Preference updated',
      description: 'Your preference has been saved'
    });
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangingPassword(false);
    toast({
      title: 'Password changed',
      description: 'Your password has been updated successfully'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>Choose how you want to receive updates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Order Updates</Label>
              <p className="text-sm text-muted-foreground">Get notified about order status changes</p>
            </div>
            <Switch
              checked={preferences.orderUpdates}
              onCheckedChange={() => handlePreferenceChange('orderUpdates')}
              data-testid="switch-order-updates"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive notifications via email</p>
            </div>
            <Switch
              checked={preferences.emailNotifications}
              onCheckedChange={() => handlePreferenceChange('emailNotifications')}
              data-testid="switch-email-notifications"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Promotional Emails</Label>
              <p className="text-sm text-muted-foreground">Receive special offers and discounts</p>
            </div>
            <Switch
              checked={preferences.promotionalEmails}
              onCheckedChange={() => handlePreferenceChange('promotionalEmails')}
              data-testid="switch-promotional-emails"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>New Arrivals</Label>
              <p className="text-sm text-muted-foreground">Get notified about new products</p>
            </div>
            <Switch
              checked={preferences.newArrivals}
              onCheckedChange={() => handlePreferenceChange('newArrivals')}
              data-testid="switch-new-arrivals"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Security
          </CardTitle>
          <CardDescription>Manage your account security settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isChangingPassword ? (
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Password</Label>
                <p className="text-sm text-muted-foreground">Last changed 3 months ago</p>
              </div>
              <Button
                variant="outline"
                onClick={() => setIsChangingPassword(true)}
                data-testid="button-change-password"
              >
                Change Password
              </Button>
            </div>
          ) : (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current">Current Password</Label>
                <Input
                  id="current"
                  type="password"
                  placeholder="Enter current password"
                  required
                  data-testid="input-current-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new">New Password</Label>
                <Input
                  id="new"
                  type="password"
                  placeholder="Enter new password"
                  required
                  data-testid="input-new-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm Password</Label>
                <Input
                  id="confirm"
                  type="password"
                  placeholder="Confirm new password"
                  required
                  data-testid="input-confirm-password"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" data-testid="button-save-password">Save</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsChangingPassword(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          <div className="border-t pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
              </div>
              <Switch
                checked={preferences.twoFactorAuth}
                onCheckedChange={() => handlePreferenceChange('twoFactorAuth')}
                data-testid="switch-two-factor"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogOut className="h-5 w-5" />
            Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full" data-testid="button-logout">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
          <Button variant="destructive" className="w-full" data-testid="button-delete-account">
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
