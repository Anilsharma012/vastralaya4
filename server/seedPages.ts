import mongoose from 'mongoose';
import Page from './models/Page';
import Admin from './models/Admin';
import dotenv from 'dotenv';

dotenv.config();

const pagesContent = [
  {
    slug: 'about-us',
    title: 'About Us',
    metaTitle: 'About Us - Shree Balaji Vastralya',
    metaDescription: 'Rooted in tradition since 1974, Shree Balaji Vastralya has been dressing generations with trust, style, and craftsmanship.',
    content: `
<div class="space-y-8">
  <div class="text-center mb-8">
    <p class="text-xl text-muted-foreground italic">Rooted in tradition since 1974</p>
  </div>

  <div>
    <p class="mb-4">Shree Balaji Vastralya has been dressing generations with trust, style, and craftsmanship. What began as a small family-run showroom has grown into a destination where families come to shop for their most special moments — for women, men, and every generation in between.</p>
    <p class="mb-4">From everyday wear to grand celebrations, we carefully curate collections that combine:</p>
    <ul class="list-disc list-inside space-y-2 mb-4">
      <li>Premium fabrics</li>
      <li>Elegant designs</li>
      <li>Fair pricing</li>
      <li>Genuine service</li>
    </ul>
    <p class="font-semibold text-primary">Our mission has always been simple — to make every customer feel special.</p>
  </div>

  <div>
    <h2 class="text-2xl font-display font-bold mb-4">A Legacy of Trust</h2>
    <p class="mb-4">For over five decades, we've had the privilege of dressing families for weddings, festivals, and milestones. Customers don't just shop with us — they build memories here.</p>
    <p>That trust inspires us to constantly innovate while staying true to our roots.</p>
  </div>

  <div>
    <h2 class="text-2xl font-display font-bold mb-4">What We Offer</h2>
    <div class="grid md:grid-cols-2 gap-6">
      <div>
        <h3 class="font-semibold text-lg mb-2">Men's Wear</h3>
        <p class="text-muted-foreground">Sherwanis, Indo-Western, Jodhpuri Suits, Tuxedos, Party & Formal Blazers, Nehru Jackets, Kurta Pajama.</p>
      </div>
      <div>
        <h3 class="font-semibold text-lg mb-2">Women's Ethnic & Readymade</h3>
        <p class="text-muted-foreground">Anarkali & Formal Suits, Partywear Suits, Gowns, Co-ord Sets, Tunics, Crop Tops.</p>
      </div>
      <div>
        <h3 class="font-semibold text-lg mb-2">Sarees</h3>
        <p class="text-muted-foreground">Bridal Sarees, Silk Sarees, Designer Sarees, Ready-to-Wear & Formal Sarees.</p>
      </div>
      <div>
        <h3 class="font-semibold text-lg mb-2">Occasion Wear</h3>
        <p class="text-muted-foreground">Bridal Lehanga, Designer Lehanga, Engagement & Cocktail Gowns, Haldi & Mehendi outfits.</p>
      </div>
      <div>
        <h3 class="font-semibold text-lg mb-2">Unstitched Suits</h3>
        <p class="text-muted-foreground">Bridal, Designer, Formal and Premium Cotton Suits.</p>
      </div>
    </div>
  </div>

  <div>
    <h2 class="text-2xl font-display font-bold mb-4">Our Promise</h2>
    <p class="mb-4">We believe fashion should be beautiful, comfortable, and reliable. Every piece at Shree Balaji Vastralya is selected with care — because we know it becomes part of your story.</p>
    <p class="text-primary font-semibold">Thank you for being part of our journey. We look forward to many more years of style, tradition, and togetherness with you.</p>
  </div>

  <div class="bg-muted/50 rounded-lg p-6">
    <h3 class="font-semibold mb-2">Contact Information</h3>
    <p><strong>GST:</strong> 06AAUPK8751E1ZB</p>
    <p><strong>Address:</strong> Shree Balaji Vastralya (Sanghi Wale), Railway Road, Rohtak-124001</p>
    <p><strong>Email:</strong> support@Shreebalajivastralya.com</p>
  </div>
</div>
    `
  },
  {
    slug: 'terms-and-conditions',
    title: 'Terms & Conditions',
    metaTitle: 'Terms & Conditions - Shree Balaji Vastralya',
    metaDescription: 'Terms and conditions for shopping at Shree Balaji Vastralya.',
    content: `
<div class="space-y-6">
  <p>Welcome to Shree Balaji Vastralya. By accessing and using our website, you agree to comply with and be bound by these Terms and Conditions.</p>

  <div>
    <h2 class="text-xl font-semibold mb-3">1. General</h2>
    <p>These terms apply to all users of the website. By using our services, you confirm that you accept these terms and agree to comply with them.</p>
  </div>

  <div>
    <h2 class="text-xl font-semibold mb-3">2. Products and Pricing</h2>
    <ul class="list-disc list-inside space-y-2">
      <li>All product descriptions and prices are accurate to the best of our knowledge</li>
      <li>Prices are inclusive of applicable taxes unless stated otherwise</li>
      <li>We reserve the right to modify prices without prior notice</li>
      <li>Slight color variations may occur due to different screen resolutions</li>
    </ul>
  </div>

  <div>
    <h2 class="text-xl font-semibold mb-3">3. Orders and Payment</h2>
    <ul class="list-disc list-inside space-y-2">
      <li>All orders are subject to availability</li>
      <li>We accept various payment methods including UPI, cards, and COD (where available)</li>
      <li>Order confirmation is sent via email upon successful placement</li>
    </ul>
  </div>

  <div>
    <h2 class="text-xl font-semibold mb-3">4. Shipping</h2>
    <p>Shipping times and costs vary based on location. Please refer to our Shipping Policy for detailed information.</p>
  </div>

  <div>
    <h2 class="text-xl font-semibold mb-3">5. Contact</h2>
    <p><strong>GST:</strong> 06AAUPK8751E1ZB</p>
    <p><strong>Address:</strong> Shree Balaji Vastralya (Sanghi Wale), Railway Road, Rohtak-124001</p>
    <p><strong>Email:</strong> support@Shreebalajivastralya.com</p>
  </div>
</div>
    `
  },
  {
    slug: 'return-policy',
    title: 'Return Policy',
    metaTitle: 'Return Policy - Shree Balaji Vastralya',
    metaDescription: 'Return policy for products purchased from Shree Balaji Vastralya.',
    content: `
<div class="space-y-6">
  <div class="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
    <p class="font-semibold text-primary">Please Note: Most of our products are made on PRE-ORDER BASIS and take 30 working days for delivery. NO REFUND policy applies to pre-order items.</p>
  </div>

  <div>
    <h2 class="text-xl font-semibold mb-3">Exchange Policy</h2>
    <ul class="list-disc list-inside space-y-2">
      <li>We offer <strong>7 days exchange</strong> from the date of delivery</li>
      <li>Exchange is valid only for size issues or manufacturing defects</li>
      <li>Products must be unused, unwashed, and in original packaging with all tags intact</li>
      <li>Exchange requests must be initiated within 7 days of delivery</li>
    </ul>
  </div>

  <div>
    <h2 class="text-xl font-semibold mb-3">Non-Returnable Items</h2>
    <ul class="list-disc list-inside space-y-2">
      <li>Custom-made or altered products</li>
      <li>Products on sale or discount</li>
      <li>Innerwear and accessories</li>
      <li>Products damaged due to customer misuse</li>
    </ul>
  </div>

  <div>
    <h2 class="text-xl font-semibold mb-3">How to Initiate Exchange</h2>
    <ol class="list-decimal list-inside space-y-2">
      <li>Contact us at support@Shreebalajivastralya.com within 7 days of delivery</li>
      <li>Provide your order number and reason for exchange</li>
      <li>Our team will guide you through the process</li>
    </ol>
  </div>

  <div class="bg-muted/50 rounded-lg p-4">
    <p><strong>Contact:</strong> support@Shreebalajivastralya.com</p>
    <p><strong>Address:</strong> Shree Balaji Vastralya (Sanghi Wale), Railway Road, Rohtak-124001</p>
  </div>
</div>
    `
  },
  {
    slug: 'refund-policy',
    title: 'Refund Policy',
    metaTitle: 'Refund Policy - Shree Balaji Vastralya',
    metaDescription: 'Refund policy for products purchased from Shree Balaji Vastralya.',
    content: `
<div class="space-y-6">
  <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
    <p class="font-semibold text-red-700 dark:text-red-400">Important: Products on PRE-ORDER BASIS (30 working days delivery) have NO REFUND policy.</p>
  </div>

  <div>
    <h2 class="text-xl font-semibold mb-3">Refund Eligibility</h2>
    <p class="mb-4">Refunds are only applicable in the following cases:</p>
    <ul class="list-disc list-inside space-y-2">
      <li>Wrong product delivered</li>
      <li>Damaged or defective product received</li>
      <li>Order cancelled before dispatch</li>
    </ul>
  </div>

  <div>
    <h2 class="text-xl font-semibold mb-3">Refund Process</h2>
    <ol class="list-decimal list-inside space-y-2">
      <li>Refund requests must be raised within 48 hours of delivery</li>
      <li>Provide photographic evidence of damage/defect</li>
      <li>Once approved, refund will be processed within 7-10 business days</li>
      <li>Refund will be credited to the original payment method or wallet</li>
    </ol>
  </div>

  <div>
    <h2 class="text-xl font-semibold mb-3">Refund Methods</h2>
    <ul class="list-disc list-inside space-y-2">
      <li><strong>Online Payments:</strong> Refund to original payment method</li>
      <li><strong>COD Orders:</strong> Refund to wallet or bank transfer</li>
    </ul>
  </div>

  <div class="bg-muted/50 rounded-lg p-4">
    <p><strong>For refund queries:</strong> support@Shreebalajivastralya.com</p>
    <p><strong>GST:</strong> 06AAUPK8751E1ZB</p>
  </div>
</div>
    `
  },
  {
    slug: 'shipping-policy',
    title: 'Shipping Policy',
    metaTitle: 'Shipping Policy - Shree Balaji Vastralya',
    metaDescription: 'Shipping information and delivery times for Shree Balaji Vastralya.',
    content: `
<div class="space-y-6">
  <div class="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
    <p class="font-semibold text-primary">Important: Most products are on PRE-ORDER BASIS and take 30 working days for delivery.</p>
  </div>

  <div>
    <h2 class="text-xl font-semibold mb-3">Delivery Timeline</h2>
    <ul class="list-disc list-inside space-y-2">
      <li><strong>Pre-Order Items:</strong> 30 working days from order confirmation</li>
      <li><strong>Ready Stock Items:</strong> 5-7 working days</li>
      <li><strong>Express Delivery:</strong> Available for select products and locations</li>
    </ul>
  </div>

  <div>
    <h2 class="text-xl font-semibold mb-3">Shipping Charges</h2>
    <ul class="list-disc list-inside space-y-2">
      <li>Free shipping on orders above Rs. 2,999</li>
      <li>Standard shipping charges apply for orders below Rs. 2,999</li>
      <li>Express delivery charges vary by location</li>
    </ul>
  </div>

  <div>
    <h2 class="text-xl font-semibold mb-3">Delivery Partners</h2>
    <p>We work with trusted delivery partners including Shiprocket to ensure safe and timely delivery of your orders.</p>
  </div>

  <div>
    <h2 class="text-xl font-semibold mb-3">Order Tracking</h2>
    <p>Once your order is shipped, you will receive a tracking number via email and SMS. You can track your order using the "Track Order" feature on our website.</p>
  </div>

  <div>
    <h2 class="text-xl font-semibold mb-3">Areas Served</h2>
    <p>We deliver across India. For international orders, please contact us directly.</p>
  </div>

  <div class="bg-muted/50 rounded-lg p-4">
    <p><strong>Store Address:</strong> Shree Balaji Vastralya (Sanghi Wale), Railway Road, Rohtak-124001</p>
    <p><strong>Support:</strong> support@Shreebalajivastralya.com</p>
  </div>
</div>
    `
  }
];

async function seedPages() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('MONGODB_URI not found');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const admin = await Admin.findOne();
    if (!admin) {
      console.error('No admin found. Please create an admin first.');
      process.exit(1);
    }

    for (const pageData of pagesContent) {
      const existingPage = await Page.findOne({ slug: pageData.slug });
      if (existingPage) {
        console.log(`Page "${pageData.title}" already exists, skipping...`);
        continue;
      }

      const page = new Page({
        ...pageData,
        isActive: true,
        createdBy: admin._id
      });
      await page.save();
      console.log(`Created page: ${pageData.title}`);
    }

    console.log('Pages seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding pages:', error);
    process.exit(1);
  }
}

seedPages();
