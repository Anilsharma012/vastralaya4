import { Router, Response } from 'express';
import mongoose from 'mongoose';
import { Category, Subcategory, Banner, User, Product, Order, Ticket, Influencer, Wallet, Transaction, Payout, Coupon, Review, Page, Settings, AuditLog, FAQ, Announcement, Media, Attribute, Referral, SocialMediaPost, ShiprocketOrder, Return, EmailLog } from '../models';
import { verifyAdmin, AuthRequest } from '../middleware/auth';
import { sendOrderShippedEmail, sendOrderDeliveredEmail } from '../services/emailService';

const router = Router();

router.use(verifyAdmin);

router.get('/categories', async (req, res: Response) => {
  try {
    const categories = await Category.find().sort({ sortOrder: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/categories', async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, image, sortOrder, isActive } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }
    
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }
    
    const category = new Category({
      name,
      slug,
      description,
      image,
      sortOrder: sortOrder || 0,
      isActive: isActive !== undefined ? isActive : true
    });
    
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/categories/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, image, sortOrder, isActive } = req.body;
    
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    if (name && name !== category.name) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const existingCategory = await Category.findOne({ slug, _id: { $ne: req.params.id } });
      if (existingCategory) {
        return res.status(400).json({ message: 'Category with this name already exists' });
      }
      category.slug = slug;
      category.name = name;
    }
    
    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    if (sortOrder !== undefined) category.sortOrder = sortOrder;
    if (isActive !== undefined) category.isActive = isActive;
    
    await category.save();
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/categories/:id', async (req, res: Response) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    await Subcategory.deleteMany({ categoryId: req.params.id });
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/subcategories', async (req, res: Response) => {
  try {
    const { categoryId } = req.query;
    const query = categoryId ? { categoryId } : {};
    const subcategories = await Subcategory.find(query).populate('categoryId').sort({ sortOrder: 1 });
    res.json(subcategories);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/subcategories', async (req: AuthRequest, res: Response) => {
  try {
    const { categoryId, name, description, image, sortOrder, isActive } = req.body;
    
    if (!categoryId || !name) {
      return res.status(400).json({ message: 'Category and name are required' });
    }
    
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const subcategory = new Subcategory({
      categoryId,
      name,
      slug,
      description,
      image,
      sortOrder: sortOrder || 0,
      isActive: isActive !== undefined ? isActive : true
    });
    
    await subcategory.save();
    res.status(201).json(subcategory);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/subcategories/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { categoryId, name, description, image, sortOrder, isActive } = req.body;
    
    const subcategory = await Subcategory.findById(req.params.id);
    if (!subcategory) {
      return res.status(404).json({ message: 'Subcategory not found' });
    }
    
    if (categoryId) subcategory.categoryId = categoryId;
    if (name) {
      subcategory.name = name;
      subcategory.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    if (description !== undefined) subcategory.description = description;
    if (image !== undefined) subcategory.image = image;
    if (sortOrder !== undefined) subcategory.sortOrder = sortOrder;
    if (isActive !== undefined) subcategory.isActive = isActive;
    
    await subcategory.save();
    res.json(subcategory);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/subcategories/:id', async (req, res: Response) => {
  try {
    const subcategory = await Subcategory.findByIdAndDelete(req.params.id);
    if (!subcategory) {
      return res.status(404).json({ message: 'Subcategory not found' });
    }
    res.json({ message: 'Subcategory deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/banners', async (req, res: Response) => {
  try {
    const { placement } = req.query;
    const query = placement ? { placement } : {};
    const banners = await Banner.find(query).sort({ priority: -1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/banners', async (req: AuthRequest, res: Response) => {
  try {
    const { title, subtitle, imageUrl, targetLink, buttonText, placement, isActive, priority } = req.body;
    
    if (!title || !imageUrl) {
      return res.status(400).json({ message: 'Title and image URL are required' });
    }
    
    const banner = new Banner({
      title,
      subtitle,
      imageUrl,
      targetLink,
      buttonText,
      placement: placement || 'hero',
      isActive: isActive !== undefined ? isActive : true,
      priority: priority || 0
    });
    
    await banner.save();
    res.status(201).json(banner);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/banners/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { title, subtitle, imageUrl, targetLink, buttonText, placement, isActive, priority } = req.body;
    
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    
    if (title) banner.title = title;
    if (subtitle !== undefined) banner.subtitle = subtitle;
    if (imageUrl) banner.imageUrl = imageUrl;
    if (targetLink !== undefined) banner.targetLink = targetLink;
    if (buttonText !== undefined) banner.buttonText = buttonText;
    if (placement) banner.placement = placement;
    if (isActive !== undefined) banner.isActive = isActive;
    if (priority !== undefined) banner.priority = priority;
    
    await banner.save();
    res.json(banner);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/banners/:id', async (req, res: Response) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    res.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/users', async (req, res: Response) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/users/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { isActive } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (isActive !== undefined) user.isActive = isActive;
    
    await user.save();
    res.json({ id: user._id, email: user.email, name: user.name, isActive: user.isActive });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/stats', async (req, res: Response) => {
  try {
    const [categoryCount, subcategoryCount, bannerCount, userCount, productCount, orderCount, ticketCount] = await Promise.all([
      Category.countDocuments(),
      Subcategory.countDocuments(),
      Banner.countDocuments(),
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Ticket.countDocuments()
    ]);
    
    res.json({
      categories: categoryCount,
      subcategories: subcategoryCount,
      banners: bannerCount,
      users: userCount,
      products: productCount,
      orders: orderCount,
      tickets: ticketCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== PRODUCTS ==========
router.get('/products', async (req, res: Response) => {
  try {
    const { search, categoryId, isActive, page = 1, limit = 20 } = req.query;
    const query: any = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }
    if (categoryId) query.categoryId = categoryId;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(query).populate('categoryId subcategoryId').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Product.countDocuments(query)
    ]);
    
    res.json({ products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/products/:id', async (req, res: Response) => {
  try {
    const product = await Product.findById(req.params.id).populate('categoryId subcategoryId');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/products', async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, shortDescription, categoryId, subcategoryId, images, price, comparePrice, sku, stock, variants, attributes, tags, sizeChart, sizeInventory, colorVariants, isActive, isFeatured, isNewArrival, isBestSeller } = req.body;

    if (!name || !categoryId || !price || !sku) {
      return res.status(400).json({ message: 'Name, category, price, and SKU are required' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();

    const existingSku = await Product.findOne({ sku });
    if (existingSku) {
      return res.status(400).json({ message: 'Product with this SKU already exists' });
    }

    const product = new Product({
      name, slug, description, shortDescription, categoryId, subcategoryId,
      images: images || [], price, comparePrice, sku, stock: stock || 0,
      variants: variants || [], attributes: attributes || {},
      tags: tags || [], sizeChart: sizeChart || undefined, sizeInventory: sizeInventory || undefined,
      colorVariants: colorVariants || undefined,
      isActive: isActive !== undefined ? isActive : true,
      isFeatured: isFeatured || false, isNewArrival: isNewArrival || false, isBestSeller: isBestSeller || false
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/products/:id', async (req: AuthRequest, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const updates = ['name', 'description', 'shortDescription', 'categoryId', 'subcategoryId', 'images', 'price', 'comparePrice', 'sku', 'stock', 'variants', 'attributes', 'tags', 'sizeChart', 'sizeInventory', 'colorVariants', 'isActive', 'isFeatured', 'isNewArrival', 'isBestSeller'];
    updates.forEach(field => {
      if (req.body[field] !== undefined) (product as any)[field] = req.body[field];
    });

    if (req.body.name && req.body.name !== product.name) {
      product.slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
    }

    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/products/:id', async (req, res: Response) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== ORDERS ==========
router.get('/orders', async (req, res: Response) => {
  try {
    const { search, status, paymentStatus, page = 1, limit = 20 } = req.query;
    const query: any = {};
    
    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { 'shippingAddress.name': { $regex: search, $options: 'i' } },
        { 'shippingAddress.phone': { $regex: search, $options: 'i' } }
      ];
    }
    if (status) query.orderStatus = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    
    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(query).populate('userId', 'name email phone').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Order.countDocuments(query)
    ]);
    
    res.json({ orders, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/orders/:id', async (req, res: Response) => {
  try {
    const order = await Order.findById(req.params.id).populate('userId', 'name email phone');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/orders/:id', async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    const { orderStatus, paymentStatus, trackingNumber, trackingUrl, notes } = req.body;
    const previousPaymentStatus = order.paymentStatus;
    
    const previousStatus = order.orderStatus;
    
    if (orderStatus) {
      order.orderStatus = orderStatus;
      if (orderStatus === 'delivered') order.deliveredAt = new Date();
    }
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
    if (trackingUrl !== undefined) order.trackingUrl = trackingUrl;
    if (notes !== undefined) order.notes = notes;
    if (req.body.courierName !== undefined) order.courierName = req.body.courierName;
    if (req.body.expectedDelivery !== undefined) order.expectedDelivery = req.body.expectedDelivery;
    
    await order.save();
    
    // Send status emails
    const user = await User.findById(order.userId);
    if (user) {
      if (orderStatus === 'shipped' && previousStatus !== 'shipped' && !order.shippedEmailSent) {
        sendOrderShippedEmail(user.email, order).then(async (sent) => {
          if (sent) {
            order.shippedEmailSent = true;
            await order.save();
          }
        }).catch(console.error);
      }
      
      if (orderStatus === 'delivered' && previousStatus !== 'delivered' && !order.deliveredEmailSent) {
        sendOrderDeliveredEmail(user.email, order).then(async (sent) => {
          if (sent) {
            order.deliveredEmailSent = true;
            await order.save();
          }
        }).catch(console.error);
      }
    }
    
    if (paymentStatus === 'paid' && previousPaymentStatus !== 'paid') {
      let wallet = await Wallet.findOne({ userId: order.userId, userType: 'user' });
      if (!wallet) {
        wallet = new Wallet({ userId: order.userId, userType: 'user', balance: 0, totalCredits: 0, totalDebits: 0 });
      }
      
      wallet.totalDebits = (wallet.totalDebits || 0) + order.total;
      await wallet.save();
      
      const transactionId = 'TXN' + Date.now().toString(36).toUpperCase();
      const transaction = new Transaction({
        transactionId,
        walletId: wallet._id,
        userId: order.userId,
        userType: 'user',
        type: 'debit',
        amount: order.total,
        balanceAfter: wallet.balance,
        category: 'order_payment',
        referenceType: 'order',
        referenceId: order._id,
        description: `Payment received for order ${order.orderId} (${order.paymentMethod === 'cod' ? 'COD' : 'Online'})`,
        status: 'completed'
      });
      await transaction.save();
    }
    
    res.json(order);
  } catch (error) {
    console.error('Order update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/orders/:id/refund', async (req: AuthRequest, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    order.paymentStatus = 'refunded';
    order.orderStatus = 'returned';
    await order.save();
    
    let wallet = await Wallet.findOne({ userId: order.userId, userType: 'user' });
    if (!wallet) {
      wallet = new Wallet({ userId: order.userId, userType: 'user', balance: 0 });
    }
    
    wallet.balance += order.total;
    wallet.totalCredits = (wallet.totalCredits || 0) + order.total;
    await wallet.save();
    
    const transactionId = 'TXN' + Date.now().toString(36).toUpperCase();
    const transaction = new Transaction({
      transactionId,
      walletId: wallet._id,
      userId: order.userId,
      userType: 'user',
      type: 'credit',
      amount: order.total,
      balanceAfter: wallet.balance,
      category: 'refund',
      referenceType: 'order',
      referenceId: order._id,
      description: `Refund for order ${order.orderId}`,
      status: 'completed'
    });
    await transaction.save();
    
    res.json({ message: 'Order refunded successfully', order });
  } catch (error) {
    console.error('Order refund error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== TICKETS ==========
router.get('/tickets', async (req, res: Response) => {
  try {
    const { search, status, category, priority, page = 1, limit = 20 } = req.query;
    const query: any = {};
    
    if (search) {
      query.$or = [
        { ticketId: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    
    const skip = (Number(page) - 1) * Number(limit);
    const [tickets, total] = await Promise.all([
      Ticket.find(query).populate('userId', 'name email').populate('orderId', 'orderId').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Ticket.countDocuments(query)
    ]);
    
    res.json({ tickets, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/tickets/:id', async (req, res: Response) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate('userId', 'name email phone').populate('orderId', 'orderId total orderStatus');
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/tickets/:id', async (req: AuthRequest, res: Response) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    
    const { status, priority, assignedTo } = req.body;
    
    if (status) {
      ticket.status = status;
      if (status === 'resolved') {
        ticket.resolvedAt = new Date();
        ticket.resolvedBy = req.adminId ? new mongoose.Types.ObjectId(req.adminId) : undefined;
      }
      if (status === 'closed') {
        ticket.closedAt = new Date();
        ticket.closedBy = req.adminId ? new mongoose.Types.ObjectId(req.adminId) : undefined;
      }
    }
    if (priority) ticket.priority = priority;
    if (assignedTo) ticket.assignedTo = new mongoose.Types.ObjectId(assignedTo);
    
    await ticket.save();
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/tickets/:id/reply', async (req: AuthRequest, res: Response) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required' });
    
    ticket.messages.push({
      senderId: new mongoose.Types.ObjectId(req.adminId!),
      senderType: 'admin',
      message,
      createdAt: new Date()
    });
    
    if (ticket.status === 'open') ticket.status = 'in_progress';
    
    await ticket.save();
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== INFLUENCERS ==========
router.get('/influencers', async (req, res: Response) => {
  try {
    const { status, tier, page = 1, limit = 20 } = req.query;
    const query: any = {};
    if (status) query.status = status;
    if (tier) query.tier = tier;
    
    const skip = (Number(page) - 1) * Number(limit);
    const [influencers, total] = await Promise.all([
      Influencer.find(query).populate('userId', 'name email phone').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Influencer.countDocuments(query)
    ]);
    
    res.json({ influencers, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/influencers/:id', async (req: AuthRequest, res: Response) => {
  try {
    const influencer = await Influencer.findById(req.params.id);
    if (!influencer) return res.status(404).json({ message: 'Influencer not found' });

    const { status, tier, commissionRate, kycVerified } = req.body;

    // Handle top-level fields
    if (status) {
      influencer.status = status;
      // Auto-update approval dates when status changes to approved
      if (status === 'approved' && !influencer.approvedAt) {
        influencer.approvedAt = new Date();
        influencer.approvedBy = req.userId ? new mongoose.Types.ObjectId(req.userId) : undefined;
      }
      // Auto-update rejection dates when status changes to rejected
      if (status === 'rejected' && !influencer.rejectedAt) {
        influencer.rejectedAt = new Date();
        influencer.rejectedBy = req.userId ? new mongoose.Types.ObjectId(req.userId) : undefined;
      }
    }
    if (tier) influencer.tier = tier;
    if (commissionRate !== undefined) influencer.commission.rate = commissionRate;
    if (kycVerified !== undefined) influencer.kyc.isVerified = kycVerified;

    // Handle nested 'commission.rate' field
    if (req.body['commission.rate'] !== undefined) {
      influencer.commission.rate = req.body['commission.rate'];
    }

    // Handle nested 'kyc.isVerified' field
    if (req.body['kyc.isVerified'] !== undefined) {
      influencer.kyc.isVerified = req.body['kyc.isVerified'];
    }

    await influencer.save();
    res.json(influencer);
  } catch (error) {
    console.error('Influencer update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== COUPONS ==========
router.get('/coupons', async (req, res: Response) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ coupons });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/coupons', async (req: AuthRequest, res: Response) => {
  try {
    const { code, type, value, minOrderAmount, maxDiscount, usageLimit, validFrom, validUntil, isActive, description } = req.body;

    if (!code || !type || value === undefined) {
      return res.status(400).json({ message: 'Code, discount type, and value are required' });
    }

    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) return res.status(400).json({ message: 'Coupon code already exists' });

    const coupon = new Coupon({
      code: code.toUpperCase(),
      name: code.toUpperCase(),
      type,
      value,
      minOrderAmount: minOrderAmount || 0,
      maxDiscount,
      usageLimit,
      startDate: validFrom ? new Date(validFrom) : undefined,
      endDate: validUntil ? new Date(validUntil) : undefined,
      isActive: isActive !== undefined ? isActive : true,
      description,
      createdBy: req.adminId ? new mongoose.Types.ObjectId(req.adminId) : undefined
    });

    await coupon.save();
    res.status(201).json(coupon);
  } catch (error) {
    console.error('Coupon creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/coupons/:id', async (req: AuthRequest, res: Response) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });

    const { code, type, value, minOrderAmount, maxDiscount, usageLimit, validFrom, validUntil, isActive, description } = req.body;

    if (code !== undefined) coupon.code = code.toUpperCase();
    if (type !== undefined) coupon.type = type;
    if (value !== undefined) coupon.value = value;
    if (minOrderAmount !== undefined) coupon.minOrderAmount = minOrderAmount;
    if (maxDiscount !== undefined) coupon.maxDiscount = maxDiscount;
    if (usageLimit !== undefined) coupon.usageLimit = usageLimit;
    if (validFrom !== undefined) coupon.startDate = validFrom ? new Date(validFrom) : undefined;
    if (validUntil !== undefined) coupon.endDate = validUntil ? new Date(validUntil) : undefined;
    if (isActive !== undefined) coupon.isActive = isActive;
    if (description !== undefined) coupon.description = description;

    await coupon.save();
    res.json(coupon);
  } catch (error) {
    console.error('Coupon update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/coupons/:id', async (req, res: Response) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== REVIEWS ==========
router.get('/reviews', async (req, res: Response) => {
  try {
    const { isApproved, page = 1, limit = 20 } = req.query;
    const query: any = {};
    if (isApproved !== undefined) query.isApproved = isApproved === 'true';
    
    const skip = (Number(page) - 1) * Number(limit);
    const [reviews, total] = await Promise.all([
      Review.find(query).populate('userId', 'name').populate('productId', 'name images').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Review.countDocuments(query)
    ]);
    
    res.json({ reviews, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/reviews/:id', async (req: AuthRequest, res: Response) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    
    const { isApproved } = req.body;
    if (isApproved !== undefined) {
      review.isApproved = isApproved;
      if (isApproved) {
        review.approvedAt = new Date();
        review.approvedBy = req.adminId ? new mongoose.Types.ObjectId(req.adminId) : undefined;
      }
    }
    
    await review.save();
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/reviews/:id', async (req, res: Response) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== PAYOUTS ==========
router.get('/payouts', async (req, res: Response) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query: any = {};
    if (status) query.status = status;
    
    const skip = (Number(page) - 1) * Number(limit);
    const [payouts, total] = await Promise.all([
      Payout.find(query).populate('influencerId').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Payout.countDocuments(query)
    ]);
    
    res.json({ payouts, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/payouts/:id', async (req: AuthRequest, res: Response) => {
  try {
    const payout = await Payout.findById(req.params.id);
    if (!payout) return res.status(404).json({ message: 'Payout not found' });
    
    const { status, transactionReference, notes } = req.body;
    if (status) {
      payout.status = status;
      if (status === 'completed') payout.processedAt = new Date();
    }
    if (transactionReference) payout.transactionReference = transactionReference;
    if (notes) payout.notes = notes;
    
    await payout.save();
    res.json(payout);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== WALLETS ==========
router.get('/wallets', async (req, res: Response) => {
  try {
    const { type } = req.query;
    const wallets = await Wallet.find().populate('userId', 'name email');
    res.json({ wallets });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/wallets/:id/adjust', async (req: AuthRequest, res: Response) => {
  try {
    const wallet = await Wallet.findById(req.params.id);
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });
    
    const { type, amount, description } = req.body;
    if (!type || !amount || !description) {
      return res.status(400).json({ message: 'Type, amount, and description are required' });
    }
    
    if (type === 'credit') {
      wallet.balance += amount;
      wallet.totalCredits = (wallet.totalCredits || 0) + amount;
    } else {
      wallet.balance -= amount;
      wallet.totalDebits = (wallet.totalDebits || 0) + amount;
    }
    
    await wallet.save();
    
    const transaction = new Transaction({
      walletId: wallet._id,
      type,
      amount,
      description,
      status: 'completed'
    });
    await transaction.save();
    
    res.json(wallet);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== TRANSACTIONS ==========
router.get('/transactions', async (req, res: Response) => {
  try {
    const transactions = await Transaction.find()
      .populate({ path: 'walletId', populate: { path: 'userId', select: 'name email' } })
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ transactions });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== REFERRALS ==========
router.get('/referrals', async (req, res: Response) => {
  try {
    const { status } = req.query;
    const query: any = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const referrals = await Referral.find(query)
      .populate('referredUserId', 'name email createdAt')
      .populate('orderId', 'orderId total orderStatus')
      .sort({ createdAt: -1 });
    
    const populatedReferrals = await Promise.all(referrals.map(async (ref) => {
      let referrer: { name: string; email: string; type: string } | null = null;
      if (ref.referrerType === 'influencer') {
        const influencer = await Influencer.findOne({ userId: ref.referrerId });
        if (influencer) {
          referrer = { name: influencer.name, email: influencer.email, type: 'influencer' };
        }
      } else {
        const user = await User.findById(ref.referrerId).select('name email');
        if (user) {
          referrer = { name: user.name, email: user.email, type: 'user' };
        }
      }
      return {
        _id: ref._id,
        referrer,
        referredUser: ref.referredUserId,
        referralCode: ref.referralCode,
        order: ref.orderId,
        orderAmount: ref.orderAmount,
        commissionAmount: ref.commissionAmount,
        status: ref.status,
        commissionStatus: ref.commissionStatus,
        createdAt: ref.createdAt
      };
    }));
    
    const stats = {
      total: await Referral.countDocuments(),
      converted: await Referral.countDocuments({ status: 'converted' }),
      pending: await Referral.countDocuments({ status: 'pending' }),
      totalCommission: (await Referral.aggregate([
        { $match: { commissionStatus: 'credited' } },
        { $group: { _id: null, total: { $sum: '$commissionAmount' } } }
      ]))[0]?.total || 0
    };
    
    res.json({ referrals: populatedReferrals, stats });
  } catch (error) {
    console.error('Admin referrals error:', error);
    res.json({ referrals: [], stats: { total: 0, converted: 0, pending: 0, totalCommission: 0 } });
  }
});

// ========== SETTINGS ==========
router.get('/settings', async (req, res: Response) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});
    res.json({ settings });
  } catch (error) {
    res.json({ settings: {} });
  }
});

router.put('/settings', async (req: AuthRequest, res: Response) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({});
      await settings.save();
    }
    
    const { store, shipping, payments, referral, commission, rewards } = req.body;
    
    if (store) {
      settings.set('store.name', store.name ?? settings.store.name);
      settings.set('store.email', store.email ?? settings.store.email);
      settings.set('store.phone', store.phone ?? settings.store.phone);
      settings.set('store.address', store.address ?? settings.store.address);
      settings.set('store.currency', store.currency ?? settings.store.currency);
      settings.set('store.taxRate', store.taxRate ?? settings.store.taxRate);
    }
    
    if (shipping) {
      settings.set('shipping.freeShippingThreshold', shipping.freeShippingThreshold ?? settings.shipping.freeShippingThreshold);
      settings.set('shipping.standardRate', shipping.standardRate ?? settings.shipping.standardRate);
      settings.set('shipping.expressRate', shipping.expressRate ?? settings.shipping.expressRate);
      settings.set('shipping.estimatedDays', shipping.estimatedDays ?? settings.shipping.estimatedDays);
      settings.set('shipping.shiprocketEnabled', shipping.shiprocketEnabled ?? settings.shipping.shiprocketEnabled);
      settings.set('shipping.shiprocketEmail', shipping.shiprocketEmail ?? settings.shipping.shiprocketEmail);
      if (shipping.shiprocketPassword && shipping.shiprocketPassword !== '********') {
        settings.set('shipping.shiprocketPassword', shipping.shiprocketPassword);
      }
      settings.set('shipping.shiprocketPickupLocation', shipping.shiprocketPickupLocation ?? settings.shipping.shiprocketPickupLocation);
    }
    
    if (payments) {
      settings.set('payments.codEnabled', payments.codEnabled ?? settings.payments.codEnabled);
      settings.set('payments.onlineEnabled', payments.onlineEnabled ?? settings.payments.onlineEnabled);
      settings.set('payments.razorpayEnabled', payments.razorpayEnabled ?? settings.payments.razorpayEnabled);
      settings.set('payments.razorpayKeyId', payments.razorpayKeyId ?? settings.payments.razorpayKeyId);
      if (payments.razorpayKeySecret && !payments.razorpayKeySecret.startsWith('••')) {
        settings.set('payments.razorpayKeySecret', payments.razorpayKeySecret);
      }
      settings.set('payments.minOrderAmount', payments.minOrderAmount ?? settings.payments.minOrderAmount);
    }
    
    if (referral) {
      settings.set('referral.enabled', referral.enabled ?? settings.referral.enabled);
      settings.set('referral.referrerReward', referral.referrerReward ?? settings.referral.referrerReward);
      settings.set('referral.refereeDiscount', referral.refereeDiscount ?? settings.referral.refereeDiscount);
      settings.set('referral.minOrderForReward', referral.minOrderForReward ?? settings.referral.minOrderForReward);
    }
    
    if (commission) {
      settings.set('commission.bronzeRate', commission.bronzeRate ?? settings.commission.bronzeRate);
      settings.set('commission.silverRate', commission.silverRate ?? settings.commission.silverRate);
      settings.set('commission.goldRate', commission.goldRate ?? settings.commission.goldRate);
      settings.set('commission.platinumRate', commission.platinumRate ?? settings.commission.platinumRate);
      settings.set('commission.diamondRate', commission.diamondRate ?? settings.commission.diamondRate);
    }
    
    if (rewards) {
      settings.set('rewards.enabled', rewards.enabled ?? settings.rewards.enabled);
      settings.set('rewards.pointsPerRupee', rewards.pointsPerRupee ?? settings.rewards.pointsPerRupee);
      settings.set('rewards.redeemRatio', rewards.redeemRatio ?? settings.rewards.redeemRatio);
      settings.set('rewards.minRedeemPoints', rewards.minRedeemPoints ?? settings.rewards.minRedeemPoints);
    }
    
    await settings.save();
    
    const savedSettings = await Settings.findById(settings._id);
    res.json({ settings: savedSettings, message: 'Settings saved successfully' });
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({ message: 'Failed to save settings' });
  }
});

router.get('/settings/rewards', async (req, res: Response) => {
  try {
    const settings = await Settings.findOne();
    res.json({ rewards: settings?.rewards || null });
  } catch (error) {
    res.json({ rewards: null });
  }
});

router.put('/settings/rewards', async (req: AuthRequest, res: Response) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = new Settings({});
    settings.rewards = req.body;
    await settings.save();
    res.json({ rewards: settings.rewards });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== AUDIT LOGS ==========
router.get('/audit-logs', async (req, res: Response) => {
  try {
    const logs = await AuditLog.find()
      .populate('adminId', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ logs });
  } catch (error) {
    res.json({ logs: [] });
  }
});

// ========== PAGES (CMS) ==========
router.get('/pages', async (req, res: Response) => {
  try {
    const pages = await Page.find().sort({ createdAt: -1 });
    res.json({ pages });
  } catch (error) {
    res.json({ pages: [] });
  }
});

router.post('/pages', async (req: AuthRequest, res: Response) => {
  try {
    const page = new Page({
      ...req.body,
      createdBy: req.adminId
    });
    await page.save();
    res.status(201).json(page);
  } catch (error) {
    console.error('Page creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/pages/:id', async (req: AuthRequest, res: Response) => {
  try {
    const page = await Page.findByIdAndUpdate(req.params.id, { ...req.body, updatedAt: new Date() }, { new: true });
    if (!page) return res.status(404).json({ message: 'Page not found' });
    res.json(page);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/pages/:id', async (req: AuthRequest, res: Response) => {
  try {
    await Page.findByIdAndDelete(req.params.id);
    res.json({ message: 'Page deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== FAQS ==========
router.get('/faqs', async (req, res: Response) => {
  try {
    const faqs = await FAQ.find().sort({ order: 1, createdAt: -1 });
    res.json({ faqs });
  } catch (error) {
    res.json({ faqs: [] });
  }
});

router.post('/faqs', async (req: AuthRequest, res: Response) => {
  try {
    const faq = new FAQ(req.body);
    await faq.save();
    res.status(201).json(faq);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/faqs/:id', async (req: AuthRequest, res: Response) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!faq) return res.status(404).json({ message: 'FAQ not found' });
    res.json(faq);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/faqs/:id', async (req: AuthRequest, res: Response) => {
  try {
    await FAQ.findByIdAndDelete(req.params.id);
    res.json({ message: 'FAQ deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== ANNOUNCEMENTS ==========
router.get('/announcements', async (req, res: Response) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json({ announcements });
  } catch (error) {
    res.json({ announcements: [] });
  }
});

router.post('/announcements', async (req: AuthRequest, res: Response) => {
  try {
    const announcement = new Announcement(req.body);
    await announcement.save();
    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/announcements/:id', async (req: AuthRequest, res: Response) => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!announcement) return res.status(404).json({ message: 'Announcement not found' });
    res.json(announcement);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/announcements/:id', async (req: AuthRequest, res: Response) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Announcement deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== MEDIA ==========
router.get('/media', async (req, res: Response) => {
  try {
    const media = await Media.find().sort({ createdAt: -1 });
    res.json({ media });
  } catch (error) {
    res.json({ media: [] });
  }
});

router.post('/media', async (req: AuthRequest, res: Response) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ message: 'URL is required' });
    
    const filename = url.split('/').pop() || 'image';
    const mediaItem = new Media({ url, filename, type: 'image', size: 0 });
    await mediaItem.save();
    res.status(201).json(mediaItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/media/:id', async (req: AuthRequest, res: Response) => {
  try {
    await Media.findByIdAndDelete(req.params.id);
    res.json({ message: 'Media deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== ATTRIBUTES ==========
router.get('/attributes', async (req, res: Response) => {
  try {
    const attributes = await Attribute.find().sort({ createdAt: -1 });
    res.json({ attributes });
  } catch (error) {
    res.json({ attributes: [] });
  }
});

router.post('/attributes', async (req: AuthRequest, res: Response) => {
  try {
    const attribute = new Attribute(req.body);
    await attribute.save();
    res.status(201).json(attribute);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/attributes/:id', async (req: AuthRequest, res: Response) => {
  try {
    const attribute = await Attribute.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!attribute) return res.status(404).json({ message: 'Attribute not found' });
    res.json(attribute);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/attributes/:id', async (req: AuthRequest, res: Response) => {
  try {
    await Attribute.findByIdAndDelete(req.params.id);
    res.json({ message: 'Attribute deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== SOCIAL MEDIA POSTS ==========
router.get('/social-media-posts', async (req, res: Response) => {
  try {
    const posts = await SocialMediaPost.find().sort({ sortOrder: 1, createdAt: -1 });
    res.json({ posts });
  } catch (error) {
    res.json({ posts: [] });
  }
});

router.post('/social-media-posts', async (req: AuthRequest, res: Response) => {
  try {
    const { title, platform, videoUrl, thumbnail, views, linkedType, linkedId, externalUrl, isActive, sortOrder } = req.body;
    
    if (!title || !platform || !videoUrl || !thumbnail || !linkedType) {
      return res.status(400).json({ message: 'Required fields missing' });
    }
    
    const post = new SocialMediaPost({
      title,
      platform,
      videoUrl,
      thumbnail,
      views: views || 0,
      linkedType,
      linkedId: linkedType !== 'external' ? linkedId : undefined,
      externalUrl: linkedType === 'external' ? externalUrl : undefined,
      isActive: isActive !== undefined ? isActive : true,
      sortOrder: sortOrder || 0
    });
    
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    console.error('Create social media post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/social-media-posts/:id', async (req: AuthRequest, res: Response) => {
  try {
    const post = await SocialMediaPost.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/social-media-posts/:id/toggle', async (req: AuthRequest, res: Response) => {
  try {
    const post = await SocialMediaPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    post.isActive = !post.isActive;
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/social-media-posts/:id', async (req: AuthRequest, res: Response) => {
  try {
    await SocialMediaPost.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== RETURNS & REFUNDS ==========
router.get('/returns', async (req, res: Response) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;
    const query: any = {};
    if (status) query.status = status;
    if (type) query.type = type;
    
    const skip = (Number(page) - 1) * Number(limit);
    const [returns, total] = await Promise.all([
      Return.find(query)
        .populate('orderId', 'orderId total orderStatus')
        .populate('userId', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Return.countDocuments(query)
    ]);
    
    res.json({ returns, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.json({ returns: [], total: 0 });
  }
});

router.get('/returns/:id', async (req, res: Response) => {
  try {
    const returnReq = await Return.findById(req.params.id)
      .populate('orderId')
      .populate('userId', 'name email phone');
    if (!returnReq) return res.status(404).json({ message: 'Return request not found' });
    res.json({ return: returnReq });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/returns/:id', async (req: AuthRequest, res: Response) => {
  try {
    const returnReq = await Return.findById(req.params.id);
    if (!returnReq) return res.status(404).json({ message: 'Return request not found' });
    
    const { status, refundAmount, refundMethod, adminNotes, awbNumber, courierName, trackingUrl } = req.body;
    
    if (status) {
      returnReq.status = status;
      if (status === 'approved' || status === 'rejected') {
        returnReq.processedAt = new Date();
        returnReq.processedBy = req.adminId ? new mongoose.Types.ObjectId(req.adminId) : undefined;
      }
      if (status === 'refund_completed') {
        returnReq.refundStatus = 'completed';
      }
    }
    if (refundAmount !== undefined) returnReq.refundAmount = refundAmount;
    if (refundMethod !== undefined) returnReq.refundMethod = refundMethod;
    if (adminNotes !== undefined) returnReq.adminNotes = adminNotes;
    if (awbNumber !== undefined) returnReq.awbNumber = awbNumber;
    if (courierName !== undefined) returnReq.courierName = courierName;
    if (trackingUrl !== undefined) returnReq.trackingUrl = trackingUrl;
    
    await returnReq.save();
    
    if (status === 'refund_initiated' && returnReq.refundMethod === 'wallet') {
      const wallet = await Wallet.findOne({ userId: returnReq.userId });
      if (wallet && returnReq.refundAmount) {
        wallet.balance += returnReq.refundAmount;
        wallet.totalCredits = (wallet.totalCredits || 0) + returnReq.refundAmount;
        await wallet.save();
        
        const transaction = new Transaction({
          walletId: wallet._id,
          type: 'credit',
          amount: returnReq.refundAmount,
          description: `Refund for return #${returnReq.returnId}`,
          status: 'completed'
        });
        await transaction.save();
        
        returnReq.status = 'refund_completed';
        returnReq.refundStatus = 'completed';
        await returnReq.save();
      }
    }
    
    res.json(returnReq);
  } catch (error) {
    console.error('Update return error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== SHIPROCKET ==========
router.get('/shiprocket/orders', async (req, res: Response) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query: any = {};
    if (status) query.status = status;
    
    const skip = (Number(page) - 1) * Number(limit);
    const [shiprocketOrders, total] = await Promise.all([
      ShiprocketOrder.find(query)
        .populate({ path: 'orderId', populate: { path: 'userId', select: 'name email' } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      ShiprocketOrder.countDocuments(query)
    ]);
    
    res.json({ orders: shiprocketOrders, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.json({ orders: [], total: 0 });
  }
});

router.get('/shiprocket/orders/:id', async (req, res: Response) => {
  try {
    const order = await ShiprocketOrder.findById(req.params.id)
      .populate({ path: 'orderId', populate: [{ path: 'userId', select: 'name email phone' }] });
    if (!order) return res.status(404).json({ message: 'Shiprocket order not found' });
    res.json({ order });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/shiprocket/sync', async (req: AuthRequest, res: Response) => {
  try {
    const settings = await Settings.findOne();
    const shiprocket = (settings as any)?.shiprocket;
    
    if (!shiprocket?.enabled || !shiprocket?.email || !shiprocket?.password) {
      return res.status(400).json({ message: 'Shiprocket not configured. Please add credentials in Settings.' });
    }
    
    const confirmedOrders = await Order.find({ 
      orderStatus: { $in: ['confirmed', 'processing'] },
      _id: { $nin: await ShiprocketOrder.distinct('orderId') }
    }).populate('userId', 'name email phone');
    
    let synced = 0;
    for (const order of confirmedOrders) {
      const shiprocketOrder = new ShiprocketOrder({
        orderId: order._id,
        shiprocketOrderId: `SR-${order.orderId}`,
        status: 'new',
        syncedAt: new Date()
      });
      await shiprocketOrder.save();
      synced++;
    }
    
    res.json({ message: `Synced ${synced} orders to Shiprocket`, synced });
  } catch (error) {
    console.error('Shiprocket sync error:', error);
    res.status(500).json({ message: 'Sync failed' });
  }
});

router.put('/shiprocket/orders/:id', async (req: AuthRequest, res: Response) => {
  try {
    const shiprocketOrder = await ShiprocketOrder.findById(req.params.id);
    if (!shiprocketOrder) return res.status(404).json({ message: 'Order not found' });
    
    const { status, awbNumber, courierName, trackingUrl, estimatedDelivery, shiprocketShipmentId } = req.body;
    
    if (status) shiprocketOrder.status = status;
    if (awbNumber) shiprocketOrder.awbNumber = awbNumber;
    if (courierName) shiprocketOrder.courierName = courierName;
    if (trackingUrl) shiprocketOrder.trackingUrl = trackingUrl;
    if (estimatedDelivery) shiprocketOrder.estimatedDelivery = new Date(estimatedDelivery);
    if (shiprocketShipmentId) shiprocketOrder.shiprocketShipmentId = shiprocketShipmentId;
    
    shiprocketOrder.syncedAt = new Date();
    await shiprocketOrder.save();
    
    const order = await Order.findById(shiprocketOrder.orderId);
    if (order) {
      if (awbNumber) order.trackingNumber = awbNumber;
      if (trackingUrl) order.trackingUrl = trackingUrl;
      if (status === 'shipped' || status === 'in_transit') order.orderStatus = 'shipped';
      if (status === 'delivered') {
        order.orderStatus = 'delivered';
        order.deliveredAt = new Date();
      }
      await order.save();
    }
    
    res.json(shiprocketOrder);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== BULK PRODUCT OPERATIONS ==========
router.post('/products/bulk-upload', async (req: AuthRequest, res: Response) => {
  try {
    const { products } = req.body;
    
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'Products array is required' });
    }
    
    const results = { created: 0, errors: [] as string[] };
    
    for (const productData of products) {
      try {
        if (!productData.name || !productData.price) {
          results.errors.push(`Missing name or price for product`);
          continue;
        }
        
        const slug = productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const sku = productData.sku || `SKU-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`.toUpperCase();
        
        const product = new Product({
          ...productData,
          slug,
          sku,
          images: productData.images || [],
          isActive: productData.isActive !== undefined ? productData.isActive : true
        });
        
        await product.save();
        results.created++;
      } catch (err: any) {
        results.errors.push(err.message);
      }
    }
    
    res.json({ message: `Created ${results.created} products`, results });
  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({ message: 'Bulk upload failed' });
  }
});

router.put('/products/bulk-update', async (req: AuthRequest, res: Response) => {
  try {
    const { updates } = req.body;
    
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ message: 'Updates array is required' });
    }
    
    const results = { updated: 0, errors: [] as string[] };
    
    for (const update of updates) {
      try {
        if (!update._id) {
          results.errors.push('Missing product ID');
          continue;
        }
        
        const { _id, ...updateData } = update;
        await Product.findByIdAndUpdate(_id, updateData);
        results.updated++;
      } catch (err: any) {
        results.errors.push(err.message);
      }
    }
    
    res.json({ message: `Updated ${results.updated} products`, results });
  } catch (error) {
    res.status(500).json({ message: 'Bulk update failed' });
  }
});

router.delete('/products/bulk-delete', async (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Product IDs array is required' });
    }
    
    const result = await Product.deleteMany({ _id: { $in: ids } });
    
    res.json({ message: `Deleted ${result.deletedCount} products`, deleted: result.deletedCount });
  } catch (error) {
    res.status(500).json({ message: 'Bulk delete failed' });
  }
});

// ========== FILE UPLOAD ==========
// File upload endpoint for product and other admin images
router.post('/upload-image', (req: AuthRequest, res: Response) => {
  // Get the upload middleware from app context
  const app = (req.app as any);
  if (!app.upload) {
    return res.status(500).json({ message: 'Upload service not configured' });
  }

  // Use multer middleware
  const uploadMiddleware = app.upload.single('file');
  uploadMiddleware(req, res, (err: any) => {
    if (err) {
      if (err.message === 'Only image files are allowed') {
        return res.status(400).json({ message: 'Only image files are allowed (JPG, PNG, WebP, GIF, SVG)' });
      }
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File size exceeds 10MB limit' });
      }
      return res.status(400).json({ message: err.message || 'Upload failed' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    try {
      // Return the URL where the file can be accessed
      const imageUrl = `/uploads/${req.file.filename}`;
      res.status(200).json({
        url: imageUrl,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to process upload' });
    }
  });
});

// ========== EMAIL LOGS ==========
router.get('/email-logs', async (req, res: Response) => {
  try {
    const { page = 1, limit = 20, type, status, search } = req.query;
    const query: any = {};
    
    if (type && type !== 'all') query.type = type;
    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { to: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { referenceId: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (Number(page) - 1) * Number(limit);
    const [logs, total] = await Promise.all([
      EmailLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      EmailLog.countDocuments(query)
    ]);
    
    res.json({ logs, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/email-logs/stats', async (req, res: Response) => {
  try {
    const [total, sent, failed, pending] = await Promise.all([
      EmailLog.countDocuments(),
      EmailLog.countDocuments({ status: 'sent' }),
      EmailLog.countDocuments({ status: 'failed' }),
      EmailLog.countDocuments({ status: 'pending' })
    ]);
    
    res.json({ total, sent, failed, pending });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/email-logs/:id/retry', async (req, res: Response) => {
  try {
    const log = await EmailLog.findById(req.params.id);
    if (!log) return res.status(404).json({ message: 'Log not found' });
    
    log.retryCount = (log.retryCount || 0) + 1;
    log.status = 'pending';
    await log.save();
    
    res.json({ message: 'Email queued for retry' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
