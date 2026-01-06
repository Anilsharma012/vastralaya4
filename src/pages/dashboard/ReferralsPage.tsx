import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Share2, Copy, Users, Gift, TrendingUp, CheckCircle, Crown, Percent, UserPlus } from 'lucide-react';
import { api } from '@/lib/api';

interface ReferralStats {
  totalReferrals: number;
  successfulReferrals: number;
  totalRewards: number;
  pendingRewards: number;
}

interface ReferralData {
  code: string;
  link: string;
  stats: ReferralStats;
}

interface CommissionInfo {
  referredBy: string | null;
  referredByUser: { name: string; email: string } | null;
  currentTier: string;
  currentRate: number;
  successfulReferrals: number;
  totalCommissionEarned: number;
  pendingCommission: number;
  commissionTiers: Array<{ tier: string; rate: number; requirement: string }>;
}

export default function ReferralsPage() {
  const { toast } = useToast();
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [commissionInfo, setCommissionInfo] = useState<CommissionInfo | null>(null);

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      setIsLoading(true);
      // Get user's referral info
      const response = await api.get<ReferralData>('/user/referral-info');
      setReferralData(response);

      // Get commission info
      try {
        const commissionResponse = await api.get<CommissionInfo>('/user/commission-info');
        setCommissionInfo(commissionResponse);
      } catch (error) {
        console.error('Failed to load commission info:', error);
      }

      // Get referral history
      try {
        const referralsResponse = await api.get<{ referrals: any[] }>('/user/referral-history');
        setReferrals(referralsResponse.referrals || []);
      } catch (error) {
        // If endpoint doesn't exist, just skip
        console.error('Failed to load referral history:', error);
      }
    } catch (error) {
      console.error('Failed to load referral data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load referral information',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (text: string, label: string) => {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(text);
          toast({
            title: 'Copied!',
            description: `${label} copied to clipboard`,
          });
          return;
        } catch (clipboardError) {
          console.error('Clipboard API failed:', clipboardError);
          // Fall through to fallback method
        }
      }

      // Fallback method for non-secure contexts
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);

      // Select text
      textArea.select();
      textArea.setSelectionRange(0, text.length);

      // Try to copy
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);

      if (successful) {
        toast({
          title: 'Copied!',
          description: `${label} copied to clipboard`,
        });
      } else {
        throw new Error('Copy command failed');
      }
    } catch (error) {
      console.error('Copy error:', error);
      toast({
        title: 'Copy failed',
        description: 'Please select and copy the text manually',
        variant: 'destructive',
      });
    }
  };

  const handleShare = async () => {
    if (!referralData) {
      toast({
        title: 'Error',
        description: 'Referral data not loaded yet',
        variant: 'destructive',
      });
      return;
    }

    const shareText = `Join me on Shri Balaji Vastralaya! Use my referral code ${referralData.code} and get ₹100 off on your first purchase! ${referralData.link}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Shri Balaji Vastralaya',
          text: shareText,
          url: referralData.link,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          handleCopy(referralData.link, 'Referral link');
        }
      }
    } else {
      handleCopy(referralData.link, 'Referral link');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Refer & Earn</h1>
          <p className="text-muted-foreground">Invite friends and earn rewards</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Loading referral data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = referralData ? [
    { icon: Users, label: 'Total Referrals', value: referralData.stats.totalReferrals.toString(), color: 'text-blue-500' },
    { icon: CheckCircle, label: 'Successful', value: referralData.stats.successfulReferrals.toString(), color: 'text-green-500' },
    { icon: Gift, label: 'Rewards Earned', value: `₹${referralData.stats.totalRewards}`, color: 'text-purple-500' },
    { icon: TrendingUp, label: 'Pending', value: `₹${referralData.stats.pendingRewards}`, color: 'text-amber-500' },
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Refer & Earn</h1>
        <p className="text-muted-foreground">Invite friends and earn rewards</p>
      </div>

      {referralData && (
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                <Gift className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Earn ₹100 for every friend!</h2>
                <p className="text-muted-foreground">
                  Share your referral code and get ₹100 when they make their first purchase
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Your Referral Code</label>
                <div className="flex gap-2">
                  <Input
                    value={referralData.code}
                    readOnly
                    className="font-mono text-lg font-bold"
                    data-testid="input-referral-code"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopy(referralData.code, 'Referral code')}
                    data-testid="button-copy-code"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Your Referral Link</label>
                <div className="flex gap-2">
                  <Input
                    value={referralData.link}
                    readOnly
                    className="text-sm"
                    data-testid="input-referral-link"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopy(referralData.link, 'Referral link')}
                    data-testid="button-copy-link"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button className="w-full" onClick={handleShare} data-testid="button-share">
                <Share2 className="h-4 w-4 mr-2" />
                Share with Friends
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {commissionInfo && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" />
              Commission Details
            </CardTitle>
            <CardDescription>Your referral commission tier and earnings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {commissionInfo.referredBy && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">You were referred by:</p>
                <p className="font-medium">{commissionInfo.referredByUser?.name || commissionInfo.referredBy}</p>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 bg-amber-500/10 rounded-lg text-center">
                <Crown className="h-6 w-6 mx-auto text-amber-500 mb-2" />
                <p className="text-lg font-bold">{commissionInfo.currentTier}</p>
                <p className="text-xs text-muted-foreground">Current Tier</p>
              </div>
              <div className="p-4 bg-green-500/10 rounded-lg text-center">
                <Percent className="h-6 w-6 mx-auto text-green-500 mb-2" />
                <p className="text-lg font-bold">{commissionInfo.currentRate}%</p>
                <p className="text-xs text-muted-foreground">Commission Rate</p>
              </div>
              <div className="p-4 bg-blue-500/10 rounded-lg text-center">
                <UserPlus className="h-6 w-6 mx-auto text-blue-500 mb-2" />
                <p className="text-lg font-bold">{commissionInfo.successfulReferrals}</p>
                <p className="text-xs text-muted-foreground">Successful Referrals</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">₹{commissionInfo.totalCommissionEarned}</p>
                <p className="text-xs text-muted-foreground">Total Earned</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">₹{commissionInfo.pendingCommission}</p>
                <p className="text-xs text-muted-foreground">Pending Commission</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-semibold mb-3">Commission Tiers</h4>
              <div className="space-y-2">
                {commissionInfo.commissionTiers.map((tier) => (
                  <div 
                    key={tier.tier} 
                    className={`flex items-center justify-between p-2 rounded ${
                      tier.tier === commissionInfo.currentTier ? 'bg-primary/10 border border-primary/30' : 'bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {tier.tier === commissionInfo.currentTier && <CheckCircle className="h-4 w-4 text-primary" />}
                      <span className="font-medium">{tier.tier}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-primary">{tier.rate}%</span>
                      <p className="text-xs text-muted-foreground">{tier.requirement}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Referral History</CardTitle>
          <CardDescription>Track your referrals and rewards</CardDescription>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No referrals yet. Start sharing!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {referrals.map((referral) => (
                <div key={referral._id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{referral.name || referral.email}</p>
                    <p className="text-sm text-muted-foreground">{referral.email}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={referral.status === 'converted' ? 'default' : 'secondary'}>
                      {referral.status === 'converted' ? 'Successful' : 'Pending'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How it Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-semibold mb-1">Share Your Code</h3>
              <p className="text-sm text-muted-foreground">
                Share your unique referral code with friends
              </p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-primary">2</span>
              </div>
              <h3 className="font-semibold mb-1">Friend Makes Purchase</h3>
              <p className="text-sm text-muted-foreground">
                Your friend signs up and makes their first order
              </p>
            </div>
            <div className="text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-primary">3</span>
              </div>
              <h3 className="font-semibold mb-1">You Earn Rewards</h3>
              <p className="text-sm text-muted-foreground">
                Get ₹100 credited to your wallet instantly
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
