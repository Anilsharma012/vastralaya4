import { Router, Response } from 'express';
import mongoose from 'mongoose';
import { Category, Subcategory, Banner, Product, Review, SocialMediaPost, Page, Order, Settings } from '../models';

const router = Router();

router.get('/categories', async (req, res: Response) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/categories/:slug', async (req, res: Response) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug, isActive: true });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    const subcategories = await Subcategory.find({ categoryId: category._id, isActive: true }).sort({ sortOrder: 1 });
    
    res.json({ category, subcategories });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/categories-with-subcategories', async (req, res: Response) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1 });
    
    const result = await Promise.all(categories.map(async (category) => {
      const subcategories = await Subcategory.find({ categoryId: category._id, isActive: true }).sort({ sortOrder: 1 });
      return {
        ...category.toObject(),
        subcategories
      };
    }));
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/banners', async (req, res: Response) => {
  try {
    const { placement } = req.query;
    const query: any = { isActive: true };
    if (placement) query.placement = placement;
    
    const banners = await Banner.find(query).sort({ priority: -1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/banners/hero', async (req, res: Response) => {
  try {
    const banners = await Banner.find({ isActive: true, placement: 'hero' }).sort({ priority: -1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== REVIEWS ==========
router.get('/reviews', async (req, res: Response) => {
  try {
    const { productId, limit = 10 } = req.query;
    const query: any = { isApproved: true };
    if (productId) query.productId = productId;
    
    const reviews = await Review.find(query)
      .populate('userId', 'name')
      .populate('productId', 'name images')
      .sort({ createdAt: -1 })
      .limit(Number(limit));
    
    res.json({ reviews });
  } catch (error) {
    res.json({ reviews: [] });
  }
});

// ========== PRODUCTS ==========
router.get('/products', async (req, res: Response) => {
  try {
    const { categoryId, subcategoryId, categorySlug, search, featured, newArrival, bestSeller, page = 1, limit = 20 } = req.query;
    const query: any = { isActive: true };
    
    if (categorySlug) {
      const category = await Category.findOne({ slug: categorySlug as string, isActive: true });
      if (category) {
        query.categoryId = category._id;
      }
    } else if (categoryId) {
      try {
        query.categoryId = new mongoose.Types.ObjectId(categoryId as string);
      } catch (e) {
        query.categoryId = categoryId;
      }
    }
    
    if (subcategoryId) {
      try {
        query.subcategoryId = new mongoose.Types.ObjectId(subcategoryId as string);
      } catch (e) {
        query.subcategoryId = subcategoryId;
      }
    }
    
    if (search) query.$text = { $search: search as string };
    if (featured === 'true') query.isFeatured = true;
    if (newArrival === 'true') query.isNewArrival = true;
    if (bestSeller === 'true') query.isBestSeller = true;
    
    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(query).populate('categoryId subcategoryId').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Product.countDocuments(query)
    ]);
    
    res.json({ products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    console.error('Products fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/products/:idOrSlug', async (req, res: Response) => {
  try {
    const { idOrSlug } = req.params;
    let product;
    
    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      product = await Product.findOne({ _id: idOrSlug, isActive: true }).populate('categoryId subcategoryId');
    }
    
    if (!product) {
      product = await Product.findOne({ slug: idOrSlug, isActive: true }).populate('categoryId subcategoryId');
    }
    
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    const relatedProducts = await Product.find({ 
      categoryId: product.categoryId, 
      _id: { $ne: product._id },
      isActive: true 
    }).limit(4);
    
    const reviews = await Review.find({ productId: product._id, isApproved: true })
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({ product, relatedProducts, reviews });
  } catch (error) {
    console.error('Product fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/subcategories', async (req, res: Response) => {
  try {
    const { categoryId } = req.query;
    const query: any = { isActive: true };
    if (categoryId) query.categoryId = categoryId;
    
    const subcategories = await Subcategory.find(query).sort({ sortOrder: 1 });
    res.json(subcategories);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== SOCIAL MEDIA POSTS ==========
router.get('/social-media-posts', async (req, res: Response) => {
  try {
    const posts = await SocialMediaPost.find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .limit(20);
    
    const productIds = posts
      .filter(p => p.linkedType === 'product' && p.linkedId)
      .map(p => p.linkedId!)
      .filter((id): id is mongoose.Types.ObjectId => id !== undefined);
    const categoryIds = posts
      .filter(p => p.linkedType === 'category' && p.linkedId)
      .map(p => p.linkedId!)
      .filter((id): id is mongoose.Types.ObjectId => id !== undefined);
    
    const [products, categories] = await Promise.all([
      productIds.length > 0 ? Product.find({ _id: { $in: productIds } }).select('name slug images') : Promise.resolve([]),
      categoryIds.length > 0 ? Category.find({ _id: { $in: categoryIds } }).select('name slug image') : Promise.resolve([])
    ]);
    
    const productMap = new Map<string, any>(products.map(p => [p._id.toString(), p] as [string, any]));
    const categoryMap = new Map<string, any>(categories.map(c => [c._id.toString(), c] as [string, any]));
    
    const populatedPosts = posts.map(post => {
      const postObj: any = post.toObject();
      if (post.linkedType === 'product' && post.linkedId) {
        postObj.linkedProduct = productMap.get(post.linkedId.toString()) || null;
      } else if (post.linkedType === 'category' && post.linkedId) {
        postObj.linkedCategory = categoryMap.get(post.linkedId.toString()) || null;
      }
      return postObj;
    });
    
    res.json({ posts: populatedPosts });
  } catch (error) {
    console.error('Social media posts fetch error:', error);
    res.json({ posts: [] });
  }
});

router.post('/social-media-posts/:id/view', async (req, res: Response) => {
  try {
    const post = await SocialMediaPost.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({ views: post.views });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== PUBLIC SETTINGS ==========
router.get('/settings', async (req, res: Response) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});
    res.json({ 
      settings: {
        store: settings.store,
        shipping: {
          freeShippingThreshold: settings.shipping?.freeShippingThreshold || 999,
          standardRate: settings.shipping?.standardRate || 99,
          expressRate: settings.shipping?.expressRate || 199,
          estimatedDays: settings.shipping?.estimatedDays || 5
        },
        payments: {
          codEnabled: settings.payments?.codEnabled ?? true,
          onlineEnabled: settings.payments?.onlineEnabled ?? false,
          razorpayEnabled: settings.payments?.razorpayEnabled ?? false,
          razorpayKeyId: settings.payments?.razorpayKeyId || '',
          minOrderAmount: settings.payments?.minOrderAmount || 500
        }
      }
    });
  } catch (error) {
    res.json({ settings: null });
  }
});

// ========== CMS PAGES ==========
router.get('/pages', async (req, res: Response) => {
  try {
    const pages = await Page.find({ isActive: true }).select('title slug isActive');
    res.json({ pages });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/pages/:slug', async (req, res: Response) => {
  try {
    const page = await Page.findOne({ slug: req.params.slug, isActive: true });
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    res.json(page);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ========== ORDER TRACKING ==========
router.get('/track-order', async (req, res: Response) => {
  try {
    const { orderId, email } = req.query;
    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }
    
    const query: any = { orderId: orderId };
    
    const order = await Order.findOne(query)
      .populate('userId', 'name email phone')
      .populate('items.productId', 'name images slug');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (email && order.userId && (order.userId as any).email !== email) {
      return res.status(404).json({ message: 'Order not found for this email' });
    }
    
    const statusOrder = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const currentStatusIndex = statusOrder.indexOf(order.orderStatus);
    const statusHistory: Array<{ status: string; timestamp: string; note?: string }> = [];
    
    if (currentStatusIndex >= 0) {
      statusHistory.push({
        status: 'pending',
        timestamp: order.createdAt.toISOString(),
        note: 'Order placed successfully'
      });
    }
    
    if (currentStatusIndex >= 1) {
      const confirmedTime = new Date(order.createdAt);
      confirmedTime.setHours(confirmedTime.getHours() + 1);
      statusHistory.push({
        status: 'confirmed',
        timestamp: confirmedTime.toISOString(),
        note: 'Order confirmed by seller'
      });
    }
    
    if (currentStatusIndex >= 2) {
      const processingTime = new Date(order.createdAt);
      processingTime.setHours(processingTime.getHours() + 24);
      statusHistory.push({
        status: 'processing',
        timestamp: processingTime.toISOString(),
        note: 'Order is being prepared'
      });
    }
    
    if (currentStatusIndex >= 3) {
      const shippedTime = new Date(order.createdAt);
      shippedTime.setDate(shippedTime.getDate() + 2);
      statusHistory.push({
        status: 'shipped',
        timestamp: shippedTime.toISOString(),
        note: order.trackingNumber ? `Shipped via courier. Tracking: ${order.trackingNumber}` : 'Order shipped'
      });
    }
    
    if (currentStatusIndex >= 4 && order.deliveredAt) {
      statusHistory.push({
        status: 'delivered',
        timestamp: order.deliveredAt.toISOString(),
        note: 'Order delivered successfully'
      });
    }
    
    if (order.orderStatus === 'cancelled') {
      statusHistory.push({
        status: 'cancelled',
        timestamp: order.updatedAt.toISOString(),
        note: order.cancelReason || 'Order cancelled'
      });
    }
    
    res.json({
      orderNumber: order.orderId,
      status: order.orderStatus,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      items: order.items,
      shippingAddress: order.shippingAddress,
      trackingNumber: order.trackingNumber,
      trackingUrl: order.trackingUrl,
      estimatedDelivery: order.deliveredAt,
      totalAmount: order.total,
      statusHistory
    });
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;