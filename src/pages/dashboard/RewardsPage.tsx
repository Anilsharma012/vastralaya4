import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Star, 
  Gift,
  Zap,
  Trophy,
  TrendingUp,
  Calendar
} from 'lucide-react';

interface Reward {
  id: string;
  title: string;
  description: string;
  starsRequired: number;
  type: 'discount' | 'product' | 'exclusive';
  value: string;
  expiresAt?: string;
  claimed?: boolean;
}

export default function RewardsPage() {
  const userStars = 450;
  const nextTierStars = 500;
  const totalStarsEarned = 1250;

  const rewards: Reward[] = [
    {
      id: '1',
      title: '₹100 Discount Voucher',
      description: 'Get ₹100 off on your next purchase',
      starsRequired: 100,
      type: 'discount',
      value: '₹100',
      expiresAt: '2025-02-28'
    },
    {
      id: '2',
      title: '₹250 Discount Voucher',
      description: 'Get ₹250 off on purchases above ₹1000',
      starsRequired: 250,
      type: 'discount',
      value: '₹250',
      expiresAt: '2025-03-31'
    },
    {
      id: '3',
      title: 'Free Shipping Coupon',
      description: 'Free shipping on your next order',
      starsRequired: 150,
      type: 'exclusive',
      value: 'Free'
    },
    {
      id: '4',
      title: 'Exclusive Product Access',
      description: 'Early access to new collection',
      starsRequired: 500,
      type: 'product',
      value: 'Exclusive'
    }
  ];

  const tiers = [
    { name: 'Bronze', minStars: 0, maxStars: 500, benefits: ['1% Bonus Stars', 'Standard Support'] },
    { name: 'Silver', minStars: 500, maxStars: 1500, benefits: ['2% Bonus Stars', 'Priority Support', 'Early Access'] },
    { name: 'Gold', minStars: 1500, maxStars: 3000, benefits: ['3% Bonus Stars', 'VIP Support', 'Exclusive Previews'] },
    { name: 'Platinum', minStars: 3000, maxStars: Infinity, benefits: ['5% Bonus Stars', 'Personal Manager', 'Special Gifts'] }
  ];

  const currentTier = tiers.find(tier => userStars >= tier.minStars && userStars < tier.maxStars) || tiers[0];

  const progressPercentage = (userStars / nextTierStars) * 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Stars & Rewards</h1>
        <p className="text-muted-foreground">Collect stars and claim exclusive rewards</p>
      </div>

      <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-yellow-200 dark:border-yellow-900">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-16 w-16 rounded-full bg-yellow-400/20 flex items-center justify-center">
                  <Star className="h-8 w-8 text-yellow-500" fill="currentColor" />
                </div>
                <div>
                  <p className="text-4xl font-bold text-yellow-600">{userStars}</p>
                  <p className="text-sm text-muted-foreground">Your Current Stars</p>
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-sm font-medium">{currentTier.name} Tier</span>
                <Badge variant="outline">{Math.round(progressPercentage)}%</Badge>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {nextTierStars - userStars} stars to next tier
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{totalStarsEarned}</p>
            <p className="text-xs text-muted-foreground">Total Earned</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Gift className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">8</p>
            <p className="text-xs text-muted-foreground">Rewards Available</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Trophy className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{currentTier.name}</p>
            <p className="text-xs text-muted-foreground">Current Tier</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Zap className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">2%</p>
            <p className="text-xs text-muted-foreground">Bonus Rate</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tier Benefits</CardTitle>
          <CardDescription>See what benefits you get at each tier</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            {tiers.map((tier) => {
              const isCurrent = currentTier.name === tier.name;
              return (
                <div
                  key={tier.name}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    isCurrent
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-muted/30'
                  }`}
                >
                  <h3 className={`font-semibold mb-3 ${isCurrent ? 'text-primary' : ''}`}>
                    {tier.name}
                    {isCurrent && (
                      <Badge className="ml-2 text-xs">Current</Badge>
                    )}
                  </h3>
                  <ul className="space-y-2 text-sm">
                    {tier.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Star className="h-3 w-3 text-yellow-500 flex-shrink-0 mt-0.5" fill="currentColor" />
                        <span className="text-muted-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Rewards</CardTitle>
          <CardDescription>Claim rewards using your stars</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {rewards.map((reward) => {
              const canClaim = userStars >= reward.starsRequired;
              return (
                <div
                  key={reward.id}
                  className="p-4 rounded-lg border hover:shadow-md transition-shadow"
                  data-testid={`reward-${reward.id}`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold">{reward.title}</h3>
                      <p className="text-sm text-muted-foreground">{reward.description}</p>
                    </div>
                    <Badge variant={canClaim ? 'default' : 'secondary'}>
                      {reward.starsRequired} ⭐
                    </Badge>
                  </div>
                  
                  {reward.expiresAt && (
                    <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Expires {new Date(reward.expiresAt).toLocaleDateString()}
                    </p>
                  )}
                  
                  {canClaim ? (
                    <button className="w-full px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
                      Claim Reward
                    </button>
                  ) : (
                    <div className="w-full px-3 py-2 rounded-md bg-muted text-muted-foreground text-sm text-center">
                      Need {reward.starsRequired - userStars} more stars
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How to Earn Stars</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <Zap className="h-6 w-6 text-primary mx-auto mb-2" />
              <h4 className="font-semibold text-sm mb-1">Every Purchase</h4>
              <p className="text-xs text-muted-foreground">1 star per ₹100 spent</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <Star className="h-6 w-6 text-primary mx-auto mb-2" fill="currentColor" />
              <h4 className="font-semibold text-sm mb-1">Leave Reviews</h4>
              <p className="text-xs text-muted-foreground">10 stars per review</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <Gift className="h-6 w-6 text-primary mx-auto mb-2" />
              <h4 className="font-semibold text-sm mb-1">Referrals</h4>
              <p className="text-xs text-muted-foreground">50 stars per successful referral</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <Calendar className="h-6 w-6 text-primary mx-auto mb-2" />
              <h4 className="font-semibold text-sm mb-1">Birthday Month</h4>
              <p className="text-xs text-muted-foreground">Bonus 100 stars</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
