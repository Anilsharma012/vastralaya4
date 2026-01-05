import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Admin, User } from '../models';
import { generateToken, AuthRequest, verifyToken, verifyAdmin } from '../middleware/auth';

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
    const { email, password, name, phone } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, password and name are required' });
    }
    
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      phone
    });
    
    await user.save();
    
    const token = generateToken({ userId: user._id });
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    
    res.status(201).json({
      message: 'Registration successful',
      user: { _id: user._id, email: user.email, name: user.name },
      token
    });
  } catch (error) {
    console.error('User register error:', error);
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
