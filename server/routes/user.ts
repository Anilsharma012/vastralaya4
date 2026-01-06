import { Router, Response } from 'express';
import mongoose from 'mongoose';
import { User, Order, Ticket, Wallet, Transaction, Address, Wishlist, Cart, Review, Influencer, Referral, Product } from '../models';
import { verifyToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(verifyToken);

// ========== ORDERS ==========
router.get('/orders', async (req: AuthRequest, res: Response) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query: any = { userId: req.userId };
    if (status && status !== 'all') query.orderStatus = status;
    
    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Order.countDocuments(query)
    ]);
    
    res.json({ orders, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/orders/:id', async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.userId });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/orders', async (req: AuthRequest, res: Response) => {
  try {
    const { items, shippingAddress, paymentMethod, couponCode, referralCode } = req.body;
    
    if (!items || !items.length || !shippingAddress) {
      return res.status(400).json({ message: 'Items and shipping address are required' });
    }
    
    let subtotal = 0;
    const orderItems = [];
    
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({ message: `Product not found: ${item.productId}` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }
      
      (orderItems as any[]).push({
        productId: product._id,
        name: product.name,
        image: product.images[0],
        price: product.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color
      });
      
      subtotal += product.price * item.quantity;
      product.stock -= item.quantity;
      await product.save();
    }
    
    if (orderItems.length === 0) {
      return res.status(400).json({ message: 'No valid items in order' });
    }
    
    const orderId = 'SBV' + Date.now().toString(36).toUpperCase();
    const shippingCharge = subtotal >= 999 ? 0 : 99;
    const total = subtotal + shippingCharge;
    
    const order = new Order({
      orderId,
      userId: req.userId,
      items: orderItems,
      subtotal,
      discount: 0,
      shippingCharge,
      tax: 0,
      total,
      shippingAddress,
      paymentMethod: paymentMethod || 'cod',
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
      orderStatus: 'pending',
      couponCode,
      referralCode
    });
    
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/orders/:id/cancel', async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.userId });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    if (!['pending', 'confirmed'].includes(order.orderStatus)) {
      return res.status(400).json({ message: 'Order cannot be cancelled' });
    }
    
    order.orderStatus = 'cancelled';
    order.cancelReason = req.body.reason || 'Cancelled by customer';
    await order.save();
    
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/orders/:id/return', async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.userId });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    if (order.orderStatus !== 'delivered') {
      return res.status(400).json({ message: 'Only delivered orders can be returned' });
    }
    
    order.returnReason = req.body.reason || 'Return requested by customer';
    await order.save();
    
    res.json({ message: 'Return request submitted', order });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== TICKETS ==========
router.get('/tickets', async (req: AuthRequest, res: Response) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query: any = { userId: req.userId };
    if (status && status !== 'all') query.status = status;
    
    const skip = (Number(page) - 1) * Number(limit);
    const [tickets, total] = await Promise.all([
      Ticket.find(query).populate('orderId', 'orderId').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Ticket.countDocuments(query)
    ]);
    
    res.json({ tickets, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/tickets/:id', async (req: AuthRequest, res: Response) => {
  try {
    const ticket = await Ticket.findOne({ _id: req.params.id, userId: req.userId }).populate('orderId', 'orderId total');
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/tickets', async (req: AuthRequest, res: Response) => {
  try {
    const { subject, category, priority, message, orderId } = req.body;
    
    if (!subject || !category || !message) {
      return res.status(400).json({ message: 'Subject, category, and message are required' });
    }
    
    const ticketId = 'TKT' + Date.now().toString(36).toUpperCase();
    
    const ticket = new Ticket({
      ticketId,
      userId: req.userId,
      orderId: orderId || undefined,
      subject,
      category,
      priority: priority || 'medium',
      status: 'open',
      messages: [{
        senderId: new mongoose.Types.ObjectId(req.userId!),
        senderType: 'user',
        message,
        createdAt: new Date()
      }]
    });
    
    await ticket.save();
    res.status(201).json(ticket);
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/tickets/:id/reply', async (req: AuthRequest, res: Response) => {
  try {
    const ticket = await Ticket.findOne({ _id: req.params.id, userId: req.userId });
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required' });
    
    ticket.messages.push({
      senderId: new mongoose.Types.ObjectId(req.userId!),
      senderType: 'user',
      message,
      createdAt: new Date()
    });
    
    if (ticket.status === 'waiting_customer') ticket.status = 'in_progress';
    
    await ticket.save();
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== WALLET ==========
router.get('/wallet', async (req: AuthRequest, res: Response) => {
  try {
    let wallet = await Wallet.findOne({ userId: req.userId });
    if (!wallet) {
      wallet = new Wallet({ userId: req.userId, balance: 0 });
      await wallet.save();
    }
    res.json(wallet);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/transactions', async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const [transactions, total] = await Promise.all([
      Transaction.find({ userId: req.userId }).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Transaction.countDocuments({ userId: req.userId })
    ]);
    
    res.json({ transactions, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== ADDRESSES ==========
router.get('/addresses', async (req: AuthRequest, res: Response) => {
  try {
    const addresses = await Address.find({ userId: req.userId }).sort({ isDefault: -1, createdAt: -1 });
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/addresses', async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, address, city, state, pincode, landmark, type, isDefault } = req.body;
    
    if (!name || !phone || !address || !city || !state || !pincode) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }
    
    if (isDefault) {
      await Address.updateMany({ userId: req.userId }, { isDefault: false });
    }
    
    const newAddress = new Address({
      userId: req.userId,
      name, phone, address, city, state, pincode, landmark,
      type: type || 'home',
      isDefault: isDefault || false
    });
    
    await newAddress.save();
    res.status(201).json(newAddress);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/addresses/:id', async (req: AuthRequest, res: Response) => {
  try {
    const addressDoc = await Address.findOne({ _id: req.params.id, userId: req.userId });
    if (!addressDoc) return res.status(404).json({ message: 'Address not found' });
    
    const updates = ['name', 'phone', 'address', 'city', 'state', 'pincode', 'landmark', 'type', 'isDefault'];
    updates.forEach(field => {
      if (req.body[field] !== undefined) (addressDoc as any)[field] = req.body[field];
    });
    
    if (req.body.isDefault) {
      await Address.updateMany({ userId: req.userId, _id: { $ne: req.params.id } }, { isDefault: false });
    }
    
    await addressDoc.save();
    res.json(addressDoc);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/addresses/:id', async (req: AuthRequest, res: Response) => {
  try {
    const addressDoc = await Address.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!addressDoc) return res.status(404).json({ message: 'Address not found' });
    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== WISHLIST ==========
router.get('/wishlist', async (req: AuthRequest, res: Response) => {
  try {
    let wishlist = await Wishlist.findOne({ userId: req.userId }).populate('items.productId');
    if (!wishlist) {
      wishlist = new Wishlist({ userId: req.userId, items: [] });
      await wishlist.save();
    }
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/wishlist', async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ message: 'Product ID is required' });

    let wishlist = await Wishlist.findOne({ userId: req.userId });
    if (!wishlist) {
      wishlist = new Wishlist({ userId: req.userId, items: [] });
    }

    const itemExists = wishlist.items.some(item => item.productId.toString() === productId);
    if (itemExists) return res.status(400).json({ message: 'Product already in wishlist' });

    wishlist.items.push({ productId: new mongoose.Types.ObjectId(productId), addedAt: new Date() });
    await wishlist.save();
    await wishlist.populate('items.productId');
    res.status(201).json(wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/wishlist/:productId', async (req: AuthRequest, res: Response) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.userId });
    if (!wishlist) return res.status(404).json({ message: 'Wishlist not found' });

    wishlist.items = wishlist.items.filter(item => item.productId.toString() !== req.params.productId);
    await wishlist.save();
    res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== CART ==========
router.get('/cart', async (req: AuthRequest, res: Response) => {
  try {
    let cart = await Cart.findOne({ userId: req.userId }).populate('items.productId');
    if (!cart) {
      cart = new Cart({ userId: req.userId, items: [] });
      await cart.save();
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/cart', async (req: AuthRequest, res: Response) => {
  try {
    const { productId, quantity, size, color } = req.body;
    if (!productId) return res.status(400).json({ message: 'Product ID is required' });
    
    let cart = await Cart.findOne({ userId: req.userId });
    if (!cart) {
      cart = new Cart({ userId: req.userId, items: [] });
    }
    
    const existingItemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId && item.size === size && item.color === color
    );
    
    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity || 1;
    } else {
      cart.items.push({
        productId: new mongoose.Types.ObjectId(productId),
        quantity: quantity || 1,
        size,
        color,
        addedAt: new Date()
      });
    }
    
    await cart.save();
    res.status(201).json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/cart/:itemId', async (req: AuthRequest, res: Response) => {
  try {
    const cart = await Cart.findOne({ userId: req.userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    
    const itemIndex = cart.items.findIndex((item: any) => item._id.toString() === req.params.itemId);
    if (itemIndex === -1) return res.status(404).json({ message: 'Cart item not found' });
    
    if (req.body.quantity !== undefined) cart.items[itemIndex].quantity = req.body.quantity;
    await cart.save();
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/cart/:itemId', async (req: AuthRequest, res: Response) => {
  try {
    const cart = await Cart.findOne({ userId: req.userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    
    cart.items = cart.items.filter(item => (item as any)._id.toString() !== req.params.itemId);
    await cart.save();
    res.json({ message: 'Removed from cart' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/cart', async (req: AuthRequest, res: Response) => {
  try {
    await Cart.findOneAndUpdate({ userId: req.userId }, { items: [] });
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== REVIEWS ==========
router.get('/reviews', async (req: AuthRequest, res: Response) => {
  try {
    const reviews = await Review.find({ userId: req.userId }).populate('productId', 'name images').sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/reviews', async (req: AuthRequest, res: Response) => {
  try {
    const { productId, orderId, rating, title, comment, images } = req.body;

    if (!productId || !rating) {
      return res.status(400).json({ message: 'Product ID and rating are required' });
    }

    if (!orderId) {
      return res.status(400).json({ message: 'Only verified buyers can leave reviews. Please purchase this product first.' });
    }

    // Verify that the user owns the order
    const order = await Order.findById(orderId);
    if (!order || !req.userId || order.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Invalid order. You can only review products from your own orders.' });
    }

    // Verify that the order contains the product
    const orderHasProduct = order.items.some((item: any) => item.productId.toString() === productId.toString());
    if (!orderHasProduct) {
      return res.status(400).json({ message: 'This product is not in your order. You can only review products you have purchased.' });
    }

    const existing = await Review.findOne({ userId: req.userId, productId });
    if (existing) return res.status(400).json({ message: 'You have already reviewed this product' });

    const review = new Review({
      productId,
      userId: req.userId,
      orderId: orderId,
      rating,
      title,
      comment,
      images: images || [],
      isVerifiedPurchase: true,
      isApproved: false
    });

    await review.save();
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== INFLUENCER ==========
router.get('/influencer', async (req: AuthRequest, res: Response) => {
  try {
    const influencer = await Influencer.findOne({ userId: req.userId });
    res.json(influencer);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/influencer/apply', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await Influencer.findOne({ userId: req.userId });
    if (existing) return res.status(400).json({ message: 'Application already exists' });

    // Fetch user's name and email from their profile
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { phone, username, bio, socialLinks } = req.body;
    const name = user.name;
    const email = user.email;

    if (!phone || !username) {
      return res.status(400).json({ message: 'Phone and username are required' });
    }
    
    const existingUsername = await Influencer.findOne({ username: username.toLowerCase() });
    if (existingUsername) return res.status(400).json({ message: 'Username already taken' });
    
    const referralCode = username.toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
    const referralLink = `/ref/${referralCode}`;
    
    const influencer = new Influencer({
      userId: req.userId,
      name,
      email,
      phone,
      username: username.toLowerCase(),
      referralCode,
      referralLink,
      status: 'pending',
      tier: 'bronze',
      level: 1,
      bio,
      socialLinks,
      kyc: { isVerified: false },
      bankDetails: { preferredMethod: 'bank' },
      stats: { totalClicks: 0, totalLeads: 0, totalOrders: 0, totalSales: 0, conversionRate: 0 },
      commission: { rate: 5, pendingAmount: 0, availableAmount: 0, paidAmount: 0, totalEarned: 0 }
    });
    
    await influencer.save();
    res.status(201).json(influencer);
  } catch (error) {
    console.error('Influencer apply error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/influencer/kyc', async (req: AuthRequest, res: Response) => {
  try {
    const influencer = await Influencer.findOne({ userId: req.userId });
    if (!influencer) return res.status(404).json({ message: 'Influencer not found' });
    
    const { panNumber, panImage, aadharNumber, aadharFrontImage, aadharBackImage, address } = req.body;
    
    if (panNumber) influencer.kyc.panNumber = panNumber;
    if (panImage) influencer.kyc.panImage = panImage;
    if (aadharNumber) influencer.kyc.aadharNumber = aadharNumber;
    if (aadharFrontImage) influencer.kyc.aadharFrontImage = aadharFrontImage;
    if (aadharBackImage) influencer.kyc.aadharBackImage = aadharBackImage;
    if (address) influencer.kyc.address = address;
    
    await influencer.save();
    res.json(influencer);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/influencer/bank', async (req: AuthRequest, res: Response) => {
  try {
    const influencer = await Influencer.findOne({ userId: req.userId });
    if (!influencer) return res.status(404).json({ message: 'Influencer not found' });
    
    const { accountHolderName, accountNumber, ifscCode, bankName, upiId, preferredMethod } = req.body;
    
    if (accountHolderName) influencer.bankDetails.accountHolderName = accountHolderName;
    if (accountNumber) influencer.bankDetails.accountNumber = accountNumber;
    if (ifscCode) influencer.bankDetails.ifscCode = ifscCode;
    if (bankName) influencer.bankDetails.bankName = bankName;
    if (upiId) influencer.bankDetails.upiId = upiId;
    if (preferredMethod) influencer.bankDetails.preferredMethod = preferredMethod;
    
    await influencer.save();
    res.json(influencer);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's referral information for dashboard
router.get('/referral-info', async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Generate or get referral code for regular users
    let referralCode = user.referralCode;
    if (!referralCode) {
      referralCode = 'SHRIBALAJI' + user._id.toString().slice(-6).toUpperCase();
      user.referralCode = referralCode;
      await user.save();
    }

    const referralLink = `https://shribalaji.com?ref=${referralCode}`;

    // Get referral stats
    const totalReferrals = await Referral.countDocuments({ referrerId: user._id });
    const successfulReferrals = await Referral.countDocuments({ referrerId: user._id, status: 'converted' });

    // Calculate rewards (assuming ₹100 per successful referral for now)
    const totalRewards = successfulReferrals * 100;
    const pendingReferrals = await Referral.countDocuments({ referrerId: user._id, status: 'pending' });
    const pendingRewards = pendingReferrals * 100;

    res.json({
      code: referralCode,
      link: referralLink,
      stats: {
        totalReferrals,
        successfulReferrals,
        totalRewards,
        pendingRewards
      }
    });
  } catch (error) {
    console.error('Failed to get referral info:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's referral history
router.get('/referral-history', async (req: AuthRequest, res: Response) => {
  try {
    const referrals = await Referral.find({ referrerId: req.userId })
      .populate('referredUserId', 'name email')
      .sort({ createdAt: -1 });

    const formattedReferrals = referrals.map(ref => ({
      _id: ref._id,
      name: (ref.referredUserId as any)?.name || 'Unknown',
      email: (ref.referredUserId as any)?.email || 'Unknown',
      status: ref.status,
      createdAt: ref.createdAt
    }));

    res.json({ referrals: formattedReferrals });
  } catch (error) {
    console.error('Failed to get referral history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/referrals', async (req: AuthRequest, res: Response) => {
  try {
    const influencer = await Influencer.findOne({ userId: req.userId });
    if (!influencer) return res.status(404).json({ message: 'Not an influencer' });

    const referrals = await Referral.find({ referrerId: influencer.userId }).populate('referredUserId', 'name email').sort({ createdAt: -1 });
    res.json(referrals);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== DASHBOARD STATS ==========
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const [orderCount, pendingOrders, wishlistData, walletData] = await Promise.all([
      Order.countDocuments({ userId: req.userId }),
      Order.countDocuments({ userId: req.userId, orderStatus: { $in: ['pending', 'confirmed', 'processing', 'shipped'] } }),
      Wishlist.findOne({ userId: req.userId }),
      Wallet.findOne({ userId: req.userId })
    ]);

    const wishlistItems = wishlistData?.items?.length || 0;

    res.json({
      totalOrders: orderCount,
      pendingOrders,
      wishlistItems,
      walletBalance: walletData?.balance || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== COMMISSION INFO ==========
router.get('/commission-info', async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const referredByUser = user.referredByUserId 
      ? await User.findById(user.referredByUserId).select('name email referralCode')
      : null;

    const commissionTiers = [
      { tier: 'Bronze', rate: 5, requirement: '0 successful referrals' },
      { tier: 'Silver', rate: 7, requirement: '5+ successful referrals' },
      { tier: 'Gold', rate: 10, requirement: '15+ successful referrals' },
      { tier: 'Platinum', rate: 12, requirement: '30+ successful referrals' },
      { tier: 'Diamond', rate: 15, requirement: '50+ successful referrals' },
    ];

    const successfulReferrals = await Referral.countDocuments({ 
      referrerId: user._id, 
      status: 'converted' 
    });

    let currentTier = 'Bronze';
    let currentRate = 5;
    if (successfulReferrals >= 50) { currentTier = 'Diamond'; currentRate = 15; }
    else if (successfulReferrals >= 30) { currentTier = 'Platinum'; currentRate = 12; }
    else if (successfulReferrals >= 15) { currentTier = 'Gold'; currentRate = 10; }
    else if (successfulReferrals >= 5) { currentTier = 'Silver'; currentRate = 7; }

    const totalCommissionEarned = await Referral.aggregate([
      { $match: { referrerId: user._id, commissionStatus: 'credited' } },
      { $group: { _id: null, total: { $sum: '$commissionAmount' } } }
    ]);

    const pendingCommission = await Referral.aggregate([
      { $match: { referrerId: user._id, commissionStatus: 'pending', status: 'converted' } },
      { $group: { _id: null, total: { $sum: '$commissionAmount' } } }
    ]);

    res.json({
      referredBy: user.referredBy || null,
      referredByUser: referredByUser ? {
        name: referredByUser.name,
        email: referredByUser.email
      } : null,
      currentTier,
      currentRate,
      successfulReferrals,
      totalCommissionEarned: totalCommissionEarned[0]?.total || 0,
      pendingCommission: pendingCommission[0]?.total || 0,
      commissionTiers
    });
  } catch (error) {
    console.error('Failed to get commission info:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== REFERRER STATS (My Stats) ==========
router.get('/referrer-stats', async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const totalUsersJoined = await Referral.countDocuments({ referrerId: user._id });
    const pendingReferrals = await Referral.countDocuments({ referrerId: user._id, status: 'pending' });
    const successfulReferrals = await Referral.countDocuments({ referrerId: user._id, status: 'converted' });

    const recentJoins = await Referral.find({ referrerId: user._id })
      .populate('referredUserId', 'name email createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    const joinHistory = recentJoins.map(ref => ({
      _id: ref._id,
      name: (ref.referredUserId as any)?.name || 'Unknown',
      email: (ref.referredUserId as any)?.email || 'Unknown',
      joinedAt: ref.createdAt,
      status: ref.status
    }));

    res.json({
      totalUsersJoined,
      pendingReferrals,
      successfulReferrals,
      referralCode: user.referralCode,
      referralLink: `https://shribalaji.com?ref=${user.referralCode}`,
      joinHistory
    });
  } catch (error) {
    console.error('Failed to get referrer stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
