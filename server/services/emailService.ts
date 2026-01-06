import nodemailer from 'nodemailer';
import { EmailLog } from '../models';

const smtpPort = parseInt(process.env.SMTP_PORT || '465');
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS?.replace(/\s/g, ''),
  },
});

const storeInfo = {
  name: 'Shri Balaji Vastralya',
  email: 'support@shreebalajivastralya.com',
  phone: '+91 9812088624',
  logo: 'https://shreebalajivastralya.com/logo.png',
  website: 'https://shreebalajivastralya.com',
};

const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: linear-gradient(135deg, #1a237e 0%, #0d47a1 100%); padding: 30px; text-align: center; }
    .header h1 { color: #d4af37; margin: 0; font-size: 28px; font-weight: 600; }
    .header p { color: #ffffff; margin: 5px 0 0; font-size: 14px; }
    .content { padding: 30px; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0; }
    .footer p { color: #666; font-size: 12px; margin: 5px 0; }
    .btn { display: inline-block; background: #1a237e; color: #ffffff !important; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: 600; }
    .order-box { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .item-row { display: flex; border-bottom: 1px solid #e0e0e0; padding: 15px 0; }
    .item-img { width: 60px; height: 60px; object-fit: cover; border-radius: 5px; margin-right: 15px; }
    .item-details { flex: 1; }
    .highlight { color: #1a237e; font-weight: 600; }
    .gold { color: #d4af37; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 8px 0; }
    .total-row { font-weight: 600; font-size: 18px; border-top: 2px solid #1a237e; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${storeInfo.name}</h1>
      <p>Premium Ethnic & Bridal Wear</p>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p><strong>${storeInfo.name}</strong></p>
      <p>Email: ${storeInfo.email} | Phone: ${storeInfo.phone}</p>
      <p>This is an automated email. Please do not reply directly.</p>
    </div>
  </div>
</body>
</html>
`;

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
  image?: string;
}

interface OrderData {
  orderId: string;
  items: OrderItem[];
  subtotal: number;
  discount?: number;
  shippingCharge: number;
  total: number;
  paymentMethod: string;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  trackingNumber?: string;
  courierName?: string;
  expectedDelivery?: string;
  deliveredAt?: Date;
}

export const emailTemplates = {
  signupSuccess: (userName: string, userEmail: string, referralCode: string) => ({
    subject: `Welcome to ${storeInfo.name}! 🎉`,
    html: baseTemplate(`
      <h2 style="color: #1a237e; margin-top: 0;">Welcome, ${userName}! 🙏</h2>
      <p style="font-size: 16px; color: #333;">Thank you for creating an account with us. We're thrilled to have you as part of our family!</p>
      
      <div class="order-box">
        <h3 style="color: #1a237e; margin-top: 0;">Your Account Details</h3>
        <table>
          <tr>
            <td><strong>Email:</strong></td>
            <td>${userEmail}</td>
          </tr>
          <tr>
            <td><strong>Your Referral Code:</strong></td>
            <td><span class="highlight">${referralCode}</span></td>
          </tr>
        </table>
      </div>
      
      <div style="background: #e8f5e9; border-radius: 8px; padding: 15px; margin: 20px 0;">
        <p style="margin: 0; color: #2e7d32;">
          <strong>🎁 Refer & Earn:</strong> Share your referral code with friends and family. When they make a purchase, you earn commission!
        </p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${storeInfo.website}" class="btn">Start Shopping</a>
      </div>
      
      <p>Explore our exclusive collection of premium ethnic and bridal wear. We're here to make your special moments even more beautiful!</p>
      
      <p>Happy Shopping! 🛍️</p>
    `),
    text: `Welcome to ${storeInfo.name}, ${userName}!\n\nThank you for creating an account with us.\n\nYour Email: ${userEmail}\nYour Referral Code: ${referralCode}\n\nShare your referral code with friends to earn commission!\n\nHappy Shopping!\n${storeInfo.name}`,
  }),

  loginSuccess: (userName: string, userEmail: string, loginTime: string, ipAddress?: string) => ({
    subject: `Login Successful – ${storeInfo.name}`,
    html: baseTemplate(`
      <h2 style="color: #1a237e; margin-top: 0;">Hello ${userName}! 👋</h2>
      <p style="font-size: 16px; color: #333;">Your account was successfully logged in.</p>
      
      <div class="order-box">
        <table>
          <tr>
            <td><strong>Account:</strong></td>
            <td>${userEmail}</td>
          </tr>
          <tr>
            <td><strong>Date & Time:</strong></td>
            <td>${loginTime}</td>
          </tr>
          ${ipAddress ? `<tr><td><strong>IP Address:</strong></td><td>${ipAddress}</td></tr>` : ''}
        </table>
      </div>
      
      <div style="background: #fff3cd; border-radius: 8px; padding: 15px; margin: 20px 0;">
        <p style="margin: 0; color: #856404;">
          <strong>🔒 Security Notice:</strong> If this wasn't you, please change your password immediately and contact our support team.
        </p>
      </div>
      
      <p>Happy Shopping!</p>
    `),
    text: `Hello ${userName}!\n\nYour account was successfully logged in on ${loginTime}.\n\nIf this wasn't you, please change your password immediately.\n\n${storeInfo.name}`,
  }),

  orderPlaced: (order: OrderData) => ({
    subject: `Order Placed – #${order.orderId}`,
    html: baseTemplate(`
      <h2 style="color: #1a237e; margin-top: 0;">Order Confirmed! 🎉</h2>
      <p style="font-size: 16px; color: #333;">Thank you for your order. We're preparing it with care.</p>
      
      <div class="order-box">
        <p style="margin: 0 0 15px;"><strong>Order ID:</strong> <span class="highlight">#${order.orderId}</span></p>
        
        <h3 style="color: #1a237e; border-bottom: 1px solid #e0e0e0; padding-bottom: 10px;">Items Ordered</h3>
        ${order.items.map(item => `
          <div style="display: flex; align-items: center; padding: 10px 0; border-bottom: 1px solid #eee;">
            <div style="flex: 1;">
              <p style="margin: 0; font-weight: 600;">${item.name}</p>
              <p style="margin: 5px 0 0; color: #666; font-size: 14px;">
                Qty: ${item.quantity}
                ${item.size ? ` | Size: ${item.size}` : ''}
                ${item.color ? ` | Color: ${item.color}` : ''}
              </p>
            </div>
            <div style="text-align: right;">
              <p style="margin: 0; font-weight: 600;">₹${(item.price * item.quantity).toLocaleString()}</p>
            </div>
          </div>
        `).join('')}
        
        <table style="margin-top: 20px;">
          <tr>
            <td>Subtotal:</td>
            <td style="text-align: right;">₹${order.subtotal.toLocaleString()}</td>
          </tr>
          ${order.discount ? `<tr><td>Discount:</td><td style="text-align: right; color: green;">-₹${order.discount.toLocaleString()}</td></tr>` : ''}
          <tr>
            <td>Shipping:</td>
            <td style="text-align: right;">${order.shippingCharge === 0 ? 'FREE' : '₹' + order.shippingCharge}</td>
          </tr>
          <tr class="total-row">
            <td style="padding-top: 15px;"><strong>Total:</strong></td>
            <td style="text-align: right; padding-top: 15px; color: #1a237e;"><strong>₹${order.total.toLocaleString()}</strong></td>
          </tr>
        </table>
      </div>
      
      <div class="order-box">
        <h3 style="color: #1a237e; margin-top: 0;">Shipping Address</h3>
        <p style="margin: 0;">
          ${order.shippingAddress.name}<br>
          ${order.shippingAddress.address}<br>
          ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}<br>
          Phone: ${order.shippingAddress.phone}
        </p>
      </div>
      
      <p><strong>Payment Method:</strong> ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod.toUpperCase()}</p>
    `),
    text: `Order Confirmed!\n\nOrder ID: #${order.orderId}\n\nItems:\n${order.items.map(i => `- ${i.name} x${i.quantity}`).join('\n')}\n\nTotal: ₹${order.total}\n\n${storeInfo.name}`,
  }),

  orderShipped: (order: OrderData) => ({
    subject: `Order Shipped – #${order.orderId} (Tracking: ${order.trackingNumber})`,
    html: baseTemplate(`
      <h2 style="color: #1a237e; margin-top: 0;">Your Order is On The Way! 🚚</h2>
      <p style="font-size: 16px; color: #333;">Great news! Your order has been shipped.</p>
      
      <div class="order-box">
        <table>
          <tr>
            <td><strong>Order ID:</strong></td>
            <td class="highlight">#${order.orderId}</td>
          </tr>
          <tr>
            <td><strong>Courier:</strong></td>
            <td>${order.courierName || 'Our Delivery Partner'}</td>
          </tr>
          <tr>
            <td><strong>Tracking Number:</strong></td>
            <td class="highlight">${order.trackingNumber || 'Will be updated soon'}</td>
          </tr>
          ${order.expectedDelivery ? `<tr><td><strong>Expected Delivery:</strong></td><td>${order.expectedDelivery}</td></tr>` : ''}
        </table>
      </div>
      
      <p style="text-align: center; margin: 30px 0;">
        <a href="${storeInfo.website}/track-order?orderId=${order.orderId}" class="btn">Track Your Order</a>
      </p>
      
      <div class="order-box">
        <h3 style="color: #1a237e; margin-top: 0;">Shipping To</h3>
        <p style="margin: 0;">
          ${order.shippingAddress.name}<br>
          ${order.shippingAddress.address}<br>
          ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}
        </p>
      </div>
    `),
    text: `Your Order is On The Way!\n\nOrder ID: #${order.orderId}\nTracking: ${order.trackingNumber}\nCourier: ${order.courierName}\n\n${storeInfo.name}`,
  }),

  orderDelivered: (order: OrderData) => ({
    subject: `Order Delivered – #${order.orderId}`,
    html: baseTemplate(`
      <h2 style="color: #1a237e; margin-top: 0;">Order Delivered! 🎊</h2>
      <p style="font-size: 16px; color: #333;">Your order has been successfully delivered. We hope you love your purchase!</p>
      
      <div class="order-box">
        <table>
          <tr>
            <td><strong>Order ID:</strong></td>
            <td class="highlight">#${order.orderId}</td>
          </tr>
          <tr>
            <td><strong>Delivered On:</strong></td>
            <td>${order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Today'}</td>
          </tr>
          <tr>
            <td><strong>Total Amount:</strong></td>
            <td>₹${order.total.toLocaleString()}</td>
          </tr>
        </table>
      </div>
      
      <div style="background: #e8f5e9; border-radius: 8px; padding: 15px; margin: 20px 0;">
        <p style="margin: 0; color: #2e7d32;">
          <strong>📦 Return Window:</strong> You have <strong>3 days</strong> from the delivery date to initiate a return if needed.
        </p>
      </div>
      
      <h3 style="color: #1a237e;">Items Delivered</h3>
      ${order.items.map(item => `
        <div style="padding: 10px 0; border-bottom: 1px solid #eee;">
          <p style="margin: 0; font-weight: 600;">${item.name}</p>
          <p style="margin: 5px 0 0; color: #666; font-size: 14px;">
            Qty: ${item.quantity}${item.size ? ` | Size: ${item.size}` : ''}${item.color ? ` | Color: ${item.color}` : ''}
          </p>
        </div>
      `).join('')}
      
      <p style="text-align: center; margin: 30px 0;">
        <a href="${storeInfo.website}/dashboard/orders" class="btn">Rate Your Purchase</a>
      </p>
    `),
    text: `Order Delivered!\n\nOrder ID: #${order.orderId}\nDelivered On: ${order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString() : 'Today'}\n\nYou have 3 days to initiate a return if needed.\n\n${storeInfo.name}`,
  }),
};

export async function sendEmail(
  to: string,
  template: { subject: string; html: string; text: string },
  type: string,
  referenceId?: string
): Promise<boolean> {
  const logEntry = new EmailLog({
    to,
    subject: template.subject,
    type,
    referenceId,
    status: 'pending',
  });

  try {
    await transporter.sendMail({
      from: `"${storeInfo.name}" <${process.env.SMTP_USER}>`,
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    logEntry.status = 'sent';
    logEntry.sentAt = new Date();
    await logEntry.save();
    console.log(`Email sent successfully: ${type} to ${to}`);
    return true;
  } catch (error: any) {
    logEntry.status = 'failed';
    logEntry.error = error.message;
    await logEntry.save();
    console.error(`Email failed: ${type} to ${to}`, error.message);
    return false;
  }
}

export async function sendSignupEmail(user: { email: string; name: string; referralCode: string }) {
  const template = emailTemplates.signupSuccess(user.name, user.email, user.referralCode);
  return sendEmail(user.email, template, 'signup_success', user.email);
}

export async function sendLoginEmail(user: { email: string; name: string }, ipAddress?: string) {
  const loginTime = new Date().toLocaleString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const template = emailTemplates.loginSuccess(user.name, user.email, loginTime, ipAddress);
  return sendEmail(user.email, template, 'login_success', user.email);
}

export async function sendOrderPlacedEmail(userEmail: string, order: any) {
  const orderData: OrderData = {
    orderId: order.orderId,
    items: order.items,
    subtotal: order.subtotal,
    discount: order.discount,
    shippingCharge: order.shippingCharge,
    total: order.total,
    paymentMethod: order.paymentMethod,
    shippingAddress: order.shippingAddress,
  };
  const template = emailTemplates.orderPlaced(orderData);
  return sendEmail(userEmail, template, 'order_placed', order.orderId);
}

export async function sendOrderShippedEmail(userEmail: string, order: any) {
  const orderData: OrderData = {
    orderId: order.orderId,
    items: order.items,
    subtotal: order.subtotal,
    shippingCharge: order.shippingCharge,
    total: order.total,
    paymentMethod: order.paymentMethod,
    shippingAddress: order.shippingAddress,
    trackingNumber: order.trackingNumber,
    courierName: order.courierName,
    expectedDelivery: order.expectedDelivery,
  };
  const template = emailTemplates.orderShipped(orderData);
  return sendEmail(userEmail, template, 'order_shipped', order.orderId);
}

export async function sendOrderDeliveredEmail(userEmail: string, order: any) {
  const orderData: OrderData = {
    orderId: order.orderId,
    items: order.items,
    subtotal: order.subtotal,
    shippingCharge: order.shippingCharge,
    total: order.total,
    paymentMethod: order.paymentMethod,
    shippingAddress: order.shippingAddress,
    deliveredAt: order.deliveredAt,
  };
  const template = emailTemplates.orderDelivered(orderData);
  return sendEmail(userEmail, template, 'order_delivered', order.orderId);
}
