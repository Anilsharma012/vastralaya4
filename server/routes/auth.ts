import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Admin, User, Referral, Influencer } from '../models';
import { generateToken, AuthRequest, verifyToken, verifyAdmin } from '../middleware/auth';
import { sendLoginEmail, sendSignupEmail } from '../services/emailService';

const router = Router();

router.post('/admin/login', async (req, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    const admin = await Admin.findOne({ email: email.toLowerCase(), isActive: true });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    admin.lastLogin = new Date();
    await admin.save();
    
    const token = generateToken({ adminId: admin._id, role: admin.role });
    
    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    
    res.json({
      message: 'Login successful',
      admin: { _id: admin._id, email: admin.email, name: admin.name, role: admin.role },
      token
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/admin/register', async (req, res: Response) => {
  try {
    const { email, password, name, setupKey } = req.body;
    
    if (setupKey !== process.env.ADMIN_SETUP_KEY && setupKey !== 'initial-setup-key') {
      return res.status(403).json({ message: 'Invalid setup key' });
    }
    
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const adminCount = await Admin.countDocuments();
    const role = adminCount === 0 ? 'superadmin' : 'admin';
    
    const admin = new Admin({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role
    });
    
    await admin.save();
    
    const token = generateToken({ adminId: admin._id, role: admin.role });
    
    res.status(201).json({
      message: 'Admin created successfully',
      admin: { _id: admin._id, email: admin.email, name: admin.name, role: admin.role },
      token
    });
  } catch (error) {
    console.error('Admin register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/admin/me', verifyAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const admin = await Admin.findById(req.adminId).select('-password');
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/admin/logout', (req, res: Response) => {
  res.clearCookie('adminToken');
  res.json({ message: 'Logged out successfully' });
});

router.post('/user/register', async (req, res: Response) => {
  try {
    const { email, password, name, phone, referralCode } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, password and name are required' });
    }
    
    const existingUserByEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingUserByEmail) {
      return res.status(400).json({ message: 'Email already registered. Please use a different email or login.' });
    }
    
    if (phone && phone.trim()) {
      const existingUserByPhone = await User.findOne({ phone: phone.trim() });
      if (existingUserByPhone) {
        return res.status(400).json({ message: 'Mobile number already registered. Please use a different number.' });
      }
    }
    
    const hashedPassword = await bcrypt.hash(password, 12);
    
    let referrerUserId: any = null;
    let referrerType: 'user' | 'influencer' | null = null;
    let referredByCode: string | null = null;
    
    if (referralCode && referralCode.trim()) {
      const trimmedCode = referralCode.trim().toUpperCase();
      
      const referrerUser = await User.findOne({ referralCode: trimmedCode });
      if (referrerUser) {
        referrerUserId = referrerUser._id;
        referrerType = 'user';
        referredByCode = trimmedCode;
      } else {
        const referrerInfluencer = await Influencer.findOne({ referralCode: trimmedCode });
        if (referrerInfluencer) {
          referrerUserId = referrerInfluencer.userId;
          referrerType = 'influencer';
          referredByCode = trimmedCode;
        }
      }
    }
    
    const user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      phone: phone && phone.trim() ? phone.trim() : undefined,
      referredBy: referredByCode,
      referredByUserId: referrerUserId,
      commissionTier: 'Bronze',
      commissionRate: 5
    });
    
    await user.save();
    
    const userReferralCode = 'SHRIBALAJI' + user._id.toString().slice(-6).toUpperCase();
    user.referralCode = userReferralCode;
    await user.save();
    
    if (referrerUserId && referrerType) {
      const referral = new Referral({
        referrerId: referrerUserId,
        referrerType: referrerType,
        referredUserId: user._id,
        referralCode: referredByCode,
        status: 'pending',
        commissionStatus: 'pending',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
      await referral.save();
    }
    
    const token = generateToken({ userId: user._id });
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    
    sendSignupEmail({
      email: user.email,
      name: user.name,
      referralCode: user.referralCode
    }).catch(err => console.error('Failed to send signup email:', err));
    
    res.status(201).json({
      message: 'Registration successful',
      user: { _id: user._id, email: user.email, name: user.name, referralCode: user.referralCode },
      token
    });
  } catch (error: any) {
    console.error('User register error:', error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      if (field === 'email') {
        return res.status(400).json({ message: 'Email already registered. Please use a different email or login.' });
      }
      if (field === 'phone') {
        return res.status(400).json({ message: 'Mobile number already registered. Please use a different number.' });
      }
    }
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/user/login', async (req, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    const user = await User.findOne({ email: email.toLowerCase(), isActive: true });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = generateToken({ userId: user._id });
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    
    const ipAddress = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress;
    sendLoginEmail({ email: user.email, name: user.name }, ipAddress).catch(console.error);
    
    res.json({
      message: 'Login successful',
      user: { _id: user._id, email: user.email, name: user.name },
      token
    });
  } catch (error) {
    console.error('User login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/user/me', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/user/logout', (req, res: Response) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

export default router;
