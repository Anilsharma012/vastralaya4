import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  UserCheck, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Link as LinkIcon,
  Instagram,
  Youtube,
  Award,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

export default function InfluencerPage() {
  const [isInfluencer, setIsInfluencer] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      setApplicationStatus('pending');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (applicationStatus === 'none' && !isInfluencer) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Become an Influencer</h1>
          <p className="text-muted-foreground">Join our influencer program and start earning</p>
        </div>

        <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center mb-8">
              <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <Award className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Join Our Influencer Program</h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Earn commission on every sale through your referral. Get access to exclusive products, 
                early releases, and special discounts for your followers.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4 rounded-lg bg-background/50">
                <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold">Up to 10% Commission</h3>
                <p className="text-sm text-muted-foreground">Earn on every sale</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-background/50">
                <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold">Dedicated Support</h3>
                <p className="text-sm text-muted-foreground">Personal manager assigned</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-background/50">
                <DollarSign className="h-8 w-8 text-primary mx-auto mb-2" />
                <h3 className="font-semibold">Weekly Payouts</h3>
                <p className="text-sm text-muted-foreground">Fast & secure payments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Apply Now</CardTitle>
            <CardDescription>Fill in your details to join our influencer program</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Preferred Username</Label>
                  <Input id="username" placeholder="@yourname" required data-testid="input-username" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="+91 9876543210" required data-testid="input-phone" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">About You</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself and your audience..."
                  required
                  data-testid="input-bio"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram Profile</Label>
                  <div className="relative">
                    <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="instagram" placeholder="instagram.com/username" className="pl-10" data-testid="input-instagram" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="youtube">YouTube Channel</Label>
                  <div className="relative">
                    <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="youtube" placeholder="youtube.com/@channel" className="pl-10" data-testid="input-youtube" />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isSubmitting}
                  data-testid="button-apply"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tier System</CardTitle>
            <CardDescription>Earn more as you grow</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-5 gap-4">
              {[
                { tier: 'Bronze', commission: '5%', sales: '₹0 - ₹10K', color: 'bg-amber-600' },
                { tier: 'Silver', commission: '6%', sales: '₹10K - ₹50K', color: 'bg-gray-400' },
                { tier: 'Gold', commission: '7%', sales: '₹50K - ₹1L', color: 'bg-yellow-500' },
                { tier: 'Platinum', commission: '8%', sales: '₹1L - ₹5L', color: 'bg-cyan-400' },
                { tier: 'Diamond', commission: '10%', sales: '₹5L+', color: 'bg-purple-500' },
              ].map((item) => (
                <div key={item.tier} className="text-center p-4 rounded-lg border">
                  <div className={`h-10 w-10 rounded-full ${item.color} mx-auto mb-2 flex items-center justify-center`}>
                    <Award className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="font-semibold">{item.tier}</h4>
                  <p className="text-lg font-bold text-primary">{item.commission}</p>
                  <p className="text-xs text-muted-foreground">{item.sales}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (applicationStatus === 'pending') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Influencer Application</h1>
          <p className="text-muted-foreground">Your application is under review</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="h-20 w-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                <Clock className="h-10 w-10 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold mb-2">Application Pending</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Your influencer application is currently under review. 
                We'll notify you once it's approved. This usually takes 1-2 business days.
              </p>
              <Badge variant="outline" className="mt-4">
                <Clock className="h-3 w-3 mr-1" />
                Under Review
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Influencer Dashboard</h1>
          <p className="text-muted-foreground">Track your performance and earnings</p>
        </div>
        <Badge className="bg-green-500">
          <CheckCircle className="h-3 w-3 mr-1" />
          Verified Influencer
        </Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <LinkIcon className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-muted-foreground">Total Clicks</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-muted-foreground">Total Orders</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <TrendingUp className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">0%</p>
              <p className="text-xs text-muted-foreground">Conversion Rate</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <DollarSign className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">₹0</p>
              <p className="text-xs text-muted-foreground">Total Earned</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
