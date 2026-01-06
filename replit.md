# Shri Balaji Vastralya - E-commerce Platform

## Overview

This is a full-stack e-commerce platform for "Shri Balaji Vastralya," a premium ethnic and bridal wear store based in Rohtak, India. The application features a customer-facing storefront for browsing products and a comprehensive admin panel for managing categories, subcategories, banners, and users.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with SWC for fast compilation
- **Routing**: React Router DOM for client-side navigation
- **State Management**: React Query (TanStack Query) for server state, React Context for auth state
- **Styling**: Tailwind CSS with custom theme configuration (navy blue + gold brand colors)
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Typography**: Playfair Display (display font) and Outfit (body font)

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with tsx for development
- **API Structure**: RESTful API with four route groups:
  - `/api/auth` - Authentication (admin and user login/register)
  - `/api/admin` - Protected admin operations (CRUD for products, categories, subcategories, banners, users, orders, tickets, influencers, coupons, payouts)
  - `/api/public` - Public endpoints (categories, subcategories, banners, products for storefront)
  - `/api/user` - Protected user operations (orders, cart, wishlist, addresses, wallet, tickets, reviews, influencer applications)
- **Authentication**: JWT tokens stored in HTTP-only cookies
- **Password Hashing**: bcryptjs

### Data Storage
- **Database**: MongoDB with Mongoose ODM
- **Models**: Admin, User, Category, Subcategory, Banner, Product, Order, Influencer, Wallet, Transaction, Payout, Referral, Review, Coupon, Ticket, Address, Wishlist, Cart, Page, Settings, AuditLog, FAQ, Announcement, Media, Attribute, EmailLog
- **Connection**: Database connection required for full functionality
- **Seeded Data**: 8 categories and 28 subcategories (Men's Wear, Readymade Dresses, Sarees, Occasion Wear, Unstitched Suits, Indo-Western, New Arrival, Best Seller)

### Key Design Patterns
- **Component-based UI**: Reusable components in `src/components/`
- **Page-based routing**: Pages in `src/pages/` with nested admin and user dashboard routes
- **Layout pattern**: `AdminLayout` for admin pages, `UserDashboardLayout` for user dashboard with Shadcn sidebar
- **API abstraction**: Centralized API client in `src/lib/api.ts`
- **Context-based auth**: `AuthContext` provides authentication state and methods
- **Optimistic updates**: UI updates immediately with rollback on API failure

### Development Setup
- **Concurrent servers**: Client (Vite on port 5000) and Server (Express on port 3001) run together
- **API Proxy**: Vite proxies `/api` requests to the backend server
- **Hot reload**: Both client and server support hot reloading

## Admin Panel Access

### Initial Setup
1. Navigate to `/admin/setup` to create the first admin account
2. Use setup key: `initial-setup-key`
3. After setup, login at `/admin/login`

### Admin Features
- **Dashboard**: Overview statistics of categories, subcategories, banners, and users
- **Categories**: Create, edit, delete product categories with images
- **Subcategories**: Manage subcategories linked to parent categories
- **Banners**: Manage hero banners, promotional banners with placement options
- **Users**: View and manage registered customers (activate/deactivate)
- **Products**: Full product management with images, price, stock, SKU, variants, and category/subcategory assignment
- **Orders**: Complete order lifecycle management (Order → Confirmed → Processing → Shipped → Delivered → Return → Refund)
- **Tickets**: Support ticket system with threaded conversations, priority levels, and status tracking
- **Influencers**: Influencer application review, 5-tier management with KYC verification
- **Payouts**: Process influencer commission payouts
- **Reviews**: Approve/reject product reviews with moderation
- **Coupons**: Create and manage discount codes with conditions
- **Inventory**: Stock level tracking with low stock alerts
- **Transactions**: View all wallet transactions
- **Wallets**: Manage user and influencer wallet balances
- **Referrals**: Track referral conversions and commissions
- **Settings**: Multi-tab store configuration (store, shipping, payments, referral, commission)
- **Audit Logs**: Track admin actions for security
- **Pages (CMS)**: Manage static pages (return policy, shipping policy, etc.)
- **FAQ**: Manage frequently asked questions
- **Announcements**: Create promotional announcements with targeting
- **Media Gallery**: Upload and manage media files
- **Attributes**: Define product attributes (size, color, etc.)
- **Analytics**: View sales and performance analytics
- **Rewards**: Configure rewards program settings

## Frontend Integration

The frontend dynamically fetches content from the database:
- **HeroSlider**: Fetches hero banners from `/api/public/banners?placement=hero`
- **CategoryGrid**: Fetches categories from `/api/public/categories`
- Falls back to static data if API is unavailable with user-visible error messages

## External Dependencies

### Database
- **MongoDB**: Primary database (requires `MONGODB_URI` environment variable)

### Third-Party Services
- None currently integrated (social links are static)

### Key NPM Packages
- **UI**: @radix-ui components, embla-carousel, cmdk, vaul (drawer)
- **Forms**: react-hook-form with @hookform/resolvers
- **Charts**: recharts
- **Date handling**: react-day-picker, date-fns
- **Backend**: express, mongoose, jsonwebtoken, cors, cookie-parser

### Environment Variables Required
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT signing (defaults to development value)
- `PORT` - Server port (defaults to 3001)
- `NODE_ENV` - Environment mode (development/production)

## User Dashboard

After login/registration, users are redirected to `/dashboard` with:
- **My Account**: Dashboard, Profile, Notifications, Settings
- **Shopping**: Orders, Wishlist, Reviews, Addresses
- **Wallet & Payments**: Wallet balance, Transactions, Payment methods
- **Rewards & Referrals**: Rewards system, Refer & Earn program
- **Influencer Program**: Become influencer, Stats, Commission tracking
- **Support**: Support tickets

## Influencer System

5-tier influencer program (Bronze/Silver/Gold/Platinum/Diamond):
- Commission rates: 5-10% based on tier
- KYC verification (PAN/Aadhar)
- Bank/UPI details for payouts
- Referral tracking and conversion analytics
- Withdrawal/payout request system

## Wallet & Transaction Accounting Model

The wallet system is designed with the following semantics:
- **wallet.balance**: Store credit only (refunds, cashback, rewards) - NOT affected by external payments (COD/Razorpay)
- **wallet.totalDebits**: Tracks total payments made (for reporting) - includes external payments
- **wallet.totalCredits**: Tracks total credits received (refunds, cashback, rewards)
- **Transaction records**: Audit trail for all financial activities

For external payments (COD/Razorpay):
- Transaction record created with type 'debit' and category 'order_payment'
- wallet.totalDebits incremented for reporting
- wallet.balance remains unchanged (customer didn't use wallet credit)
- balanceAfter correctly shows unchanged wallet balance

For refunds:
- Transaction record created with type 'credit' and category 'refund'
- wallet.balance increased (customer receives store credit)
- wallet.totalCredits incremented

## Recent Changes

- Created 26 MongoDB models for complete e-commerce features (including FAQ, Announcement, Media, Attribute, SocialMediaPost)
- Seeded database with 8 categories and 28 subcategories from product catalog
- Built complete user dashboard with Shadcn sidebar navigation
- Expanded admin sidebar with 40+ menu items across 7 collapsible sections - ALL pages fully functional
- Built 30+ fully functional admin pages connected to real-time MongoDB database
- All admin pages feature: search, filters, create/edit dialogs, real-time API updates
- Added influencer application and management with 5-tier system (Bronze/Silver/Gold/Platinum/Diamond)
- Integrated frontend components with database API with comprehensive error handling
- Implemented optimistic updates with rollback for user status toggles
- Built comprehensive admin API routes for all features: products, orders, tickets, influencers, coupons, payouts, wallets, transactions, referrals, settings, audit-logs, pages, FAQs, announcements, media, attributes
- All API endpoints now use MongoDB for persistent data storage - no in-memory fallbacks
- Cart→Checkout→Order flow fully functional with MongoDB integration
- **Social Media Videos**: Instagram/YouTube style video slider with admin CRUD, view tracking, product/category linking
- **Razorpay Integration**: Payment gateway configurable from Admin Settings (Payments tab)
- **Multi-Image Products**: Enhanced product form with visual image previews, add/remove functionality
- **Fixed Product Details**: Product page now fetches from MongoDB API instead of static data
- **Shiprocket Integration**: Full shipping gateway with order sync, AWB management, real-time tracking status updates, configurable in Settings
- **Returns/Refunds Module**: Complete return workflow (pending → approved → pickup → received → refund), wallet integration for refunds
- **Influencer Dashboard**: Separate login portal at /influencer/login with dedicated dashboard showing referrals, commissions, orders, earnings
- **Public Reviews API**: /api/public/reviews endpoint for fetching approved reviews, ReviewsSection component on homepage
- **CMS Pages**: Admin-editable pages (About Us, Terms & Conditions, Return Policy, Refund Policy, Shipping Policy) with public API `/api/public/pages/:slug`
- **Order Tracking**: Public order tracking system at `/track-order` with visual progress stepper and status history
- **Updated Store Info**: GST number (06AAUPK8751E1ZB), Facebook link, correct support email (support@Shreebalajivastralya.com)
- **Product Variant Display**: Size selector styled with bordered buttons (S, M, L, XL, etc.)
- **Buy Now Button**: Direct checkout functionality - adds to cart and navigates to checkout
- **Footer Updates**: Social media links (Facebook, Instagram, YouTube) and navigation to CMS pages
- **User Registration Validation**: Email and phone number uniqueness validation with specific error messages
- **Referral System**: Auto-apply referral code from URL (?ref=CODE), display in registration form, track referrer-referee relationships
- **Commission Tier System**: 5-tier commission structure (Bronze 5%, Silver 7%, Gold 10%, Platinum 12%, Diamond 15%) based on successful referrals
- **Commission Dashboard**: User dashboard displays current tier, commission rate, total earnings, pending commission, and tier progression
- **Color-wise Stock Management**: Each product color variant has independent stock quantity tracking
- **Enhanced Return System**: 
  - User can return orders only within 72 hours of delivery
  - Return window eligibility check with remaining hours display
  - Mandatory return reason and refund details (Bank Account Number OR UPI ID)
  - Optional account holder name
  - UPI format validation
  - Return request creates proper Return record with all details
  - Admin sees bank/UPI details, delivered date, items, and reason in Returns page
  - Status workflow: Pending → Approved/Rejected → Pickup Scheduled → Picked Up → Received → Inspecting → Refund Initiated → Refund Completed
  - "Returns" tab in My Orders page to filter orders with return requests
  - "Return Requested" status badge on orders with submitted returns
  - "View Return" button to see return details dialog
- **Coupon System**:
  - Admin can create/edit/delete coupons with: code, type (percentage/fixed), value, min order, max discount, usage limit, validity dates
  - Checkout page displays available coupons
  - Coupon code input with Apply button
  - Real-time coupon validation (expiry, min order, usage limit)
  - Discount shown in order summary
  - Backend applies coupon discount to order total
  - Coupon usage count incremented on successful order
- **Email Notification System**:
  - Gmail SMTP integration using Nodemailer
  - Professional HTML email templates with store branding
  - Login Success emails (with security notice, timestamp, IP address)
  - Order Placed emails (order details, items, shipping address, payment method)
  - Order Shipped emails (tracking number, courier name, expected delivery date)
  - Order Delivered emails (delivery confirmation, review request CTA)
  - EmailLog model tracks all sent emails with status, retries, and error messages
  - Admin Email Logs page at `/admin/email-logs` with stats dashboard, filtering, search, and retry failed emails
  - Duplicate prevention flags on Order model (orderPlacedEmailSent, shippedEmailSent, deliveredEmailSent)
  - Async email sending to not block API responses
  - Environment variables: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS (secret)
- Admin credentials: admin@shribalaji.com / Admin@123

## Influencer Dashboard Access

Influencers can access their dedicated dashboard at:
- **Login URL**: `/influencer/login`
- **Dashboard URL**: `/influencer/dashboard` (after authentication)
- Features: Referral tracking, Commission earnings, Order history, Payout requests