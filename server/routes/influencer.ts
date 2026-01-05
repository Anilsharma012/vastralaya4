import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Influencer, User, Referral, Order, Payout, Transaction, Wallet } from '../models';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface InfluencerRequest extends Request {
  influencerId?: string;
}

const verifyInfluencer = async (req: any, res: Response, next: any) => {
  const token = req.cookies.influencer_token || req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.type !== 'influencer') {
      return res.status(401).json({ message: 'Invalid token type' });
    }
    req.influencerId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

router.post('/login', async (req, res: Response) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    const influencer = await Influencer.findOne({ 
      $or: [{ username }, { email: username }],
      status: 'approved'
    });
    
    if (!influencer) {
      return res.status(401).json({ message: 'Invalid credentials or account not approved' });
    }
    
    const user = await User.findById(influencer.userId);
    if (!user) {
      return res.status(401).json({ message: 'User account not found' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: influencer._id, type: 'influencer' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.cookie('influencer_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    
    res.json({
      message: 'Login successful',
      influencer: {
        _id: influencer._id,
        name: influencer.name,
        email: influencer.email,
        username: influencer.username,
        tier: influencer.tier,
        referralCode: influencer.referralCode,
        profileImage: influencer.profileImage
      }
    });
  } catch (error) {
    console.error('Influencer login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/logout', (req, res: Response) => {
  res.clearCookie('influencer_token');
  res.json({ message: 'Logged out successfully' });
});

router.get('/me', verifyInfluencer, async (req: any, res: Response) => {
  try {
    const influencer = await Influencer.findById(req.influencerId);
    if (!influencer) {
      return res.status(404).json({ message: 'Influencer not found' });
    }
    res.json({ influencer });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/dashboard', verifyInfluencer, async (req: any, res: Response) => {
  try {
    const influencer = await Influencer.findById(req.influencerId);
    if (!influencer) {
      return res.status(404).json({ message: 'Influencer not found' });
    }
    
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    
    const [
      totalReferrals,
      monthlyReferrals,
      weeklyReferrals,
      totalOrders,
      monthlyOrders,
      pendingPayouts,
      recentReferrals
    ] = await Promise.all([
      Referral.countDocuments({ referrerId: influencer.userId }),
      Referral.countDocuments({ referrerId: influencer.userId, createdAt: { $gte: startOfMonth } }),
      Referral.countDocuments({ referrerId: influencer.userId, createdAt: { $gte: startOfWeek } }),
      Order.countDocuments({ influencerId: influencer._id, orderStatus: { $ne: 'cancelled' } }),
      Order.countDocuments({ influencerId: influencer._id, createdAt: { $gte: startOfMonth }, orderStatus: { $ne: 'cancelled' } }),
      Payout.countDocuments({ influencerId: influencer._id, status: 'pending' }),
      Referral.find({ referrerId: influencer.userId })
        .populate('referredId', 'name email')
        .sort({ createdAt: -1 })
        .limit(10)
    ]);
    
    const totalSales = await Order.aggregate([
      { $match: { influencerId: influencer._id, orderStatus: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    
    const monthlySales = await Order.aggregate([
      { $match: { influencerId: influencer._id, createdAt: { $gte: startOfMonth }, orderStatus: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    
    res.json({
      stats: {
        totalReferrals,
        monthlyReferrals,
        weeklyReferrals,
        totalOrders,
        monthlyOrders,
        totalSales: totalSales[0]?.total || 0,
        monthlySales: monthlySales[0]?.total || 0,
        pendingPayouts,
        ...influencer.commission,
        tier: influencer.tier,
        referralCode: influencer.referralCode,
        referralLink: influencer.referralLink
      },
      recentReferrals
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/referrals', verifyInfluencer, async (req: any, res: Response) => {
  try {
    const influencer = await Influencer.findById(req.influencerId);
    if (!influencer) {
      return res.status(404).json({ message: 'Influencer not found' });
    }
    
    const referrals = await Referral.find({ referrerId: influencer.userId })
      .populate('referredId', 'name email createdAt')
      .populate('orderId', 'orderId total orderStatus')
      .sort({ createdAt: -1 });
    
    res.json({ referrals });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/orders', verifyInfluencer, async (req: any, res: Response) => {
  try {
    const influencer = await Influencer.findById(req.influencerId);
    if (!influencer) {
      return res.status(404).json({ message: 'Influencer not found' });
    }
    
    const orders = await Order.find({ influencerId: influencer._id })
      .populate('userId', 'name email')
      .select('orderId total orderStatus paymentStatus createdAt')
      .sort({ createdAt: -1 });
    
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/earnings', verifyInfluencer, async (req: any, res: Response) => {
  try {
    const influencer = await Influencer.findById(req.influencerId);
    if (!influencer) {
      return res.status(404).json({ message: 'Influencer not found' });
    }
    
    const payouts = await Payout.find({ influencerId: influencer._id })
      .sort({ createdAt: -1 });
    
    const monthlyEarnings = await Order.aggregate([
      { 
        $match: { 
          influencerId: influencer._id,
          orderStatus: { $in: ['delivered'] }
        }
      },
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          sales: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);
    
    res.json({
      commission: influencer.commission,
      payouts,
      monthlyEarnings: monthlyEarnings.map(item => ({
        month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
        sales: item.sales,
        orders: item.orders,
        commission: item.sales * (influencer.commission.rate / 100)
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/request-payout', verifyInfluencer, async (req: any, res: Response) => {
  try {
    const influencer = await Influencer.findById(req.influencerId);
    if (!influencer) {
      return res.status(404).json({ message: 'Influencer not found' });
    }
    
    const { amount } = req.body;
    
    if (!amount || amount < 500) {
      return res.status(400).json({ message: 'Minimum payout amount is Rs. 500' });
    }
    
    if (amount > influencer.commission.availableAmount) {
      return res.status(400).json({ message: 'Insufficient available balance' });
    }
    
    if (!influencer.kyc.isVerified) {
      return res.status(400).json({ message: 'KYC verification required for payouts' });
    }
    
    const payout = new Payout({
      influencerId: influencer._id,
      amount,
      method: influencer.bankDetails.preferredMethod,
      bankDetails: influencer.bankDetails.preferredMethod === 'bank' ? {
        accountNumber: influencer.bankDetails.accountNumber,
        ifscCode: influencer.bankDetails.ifscCode,
        bankName: influencer.bankDetails.bankName,
        accountHolderName: influencer.bankDetails.accountHolderName
      } : undefined,
      upiId: influencer.bankDetails.preferredMethod === 'upi' ? influencer.bankDetails.upiId : undefined,
      status: 'pending'
    });
    
    await payout.save();
    
    influencer.commission.availableAmount -= amount;
    influencer.commission.pendingAmount += amount;
    await influencer.save();
    
    res.json({ message: 'Payout request submitted', payout });
  } catch (error) {
    console.error('Payout request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/profile', verifyInfluencer, async (req: any, res: Response) => {
  try {
    const influencer = await Influencer.findById(req.influencerId);
    if (!influencer) {
      return res.status(404).json({ message: 'Influencer not found' });
    }
    
    const { bio, socialLinks, profileImage, bankDetails } = req.body;
    
    if (bio !== undefined) influencer.bio = bio;
    if (socialLinks) influencer.socialLinks = { ...influencer.socialLinks, ...socialLinks };
    if (profileImage) influencer.profileImage = profileImage;
    if (bankDetails) influencer.bankDetails = { ...influencer.bankDetails, ...bankDetails };
    
    await influencer.save();
    res.json({ influencer });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/kyc', verifyInfluencer, async (req: any, res: Response) => {
  try {
    const influencer = await Influencer.findById(req.influencerId);
    if (!influencer) {
      return res.status(404).json({ message: 'Influencer not found' });
    }
    
    const { panNumber, panImage, aadharNumber, aadharFrontImage, aadharBackImage, address } = req.body;
    
    influencer.kyc = {
      ...influencer.kyc,
      panNumber: panNumber || influencer.kyc.panNumber,
      panImage: panImage || influencer.kyc.panImage,
      aadharNumber: aadharNumber || influencer.kyc.aadharNumber,
      aadharFrontImage: aadharFrontImage || influencer.kyc.aadharFrontImage,
      aadharBackImage: aadharBackImage || influencer.kyc.aadharBackImage,
      address: address || influencer.kyc.address,
      isVerified: false
    };
    
    await influencer.save();
    res.json({ message: 'KYC documents submitted for review', influencer });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
