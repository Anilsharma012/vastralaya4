# Shri Balaji Vastralya - E-commerce Platform

## Overview

Shri Balaji Vastralya is a full-stack e-commerce platform for an ethnic and bridal wear store. It features a customer-facing storefront and a comprehensive admin panel for managing products, categories, orders, and users. The platform aims to provide a seamless online shopping experience and efficient store management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with SWC
- **Routing**: React Router DOM
- **State Management**: React Query (server state), React Context (auth state)
- **Styling**: Tailwind CSS with a custom navy blue and gold theme
- **UI Components**: shadcn/ui built on Radix UI
- **Typography**: Playfair Display and Outfit

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **API Structure**: RESTful API with routes for authentication, admin operations, public access, and user-specific actions.
- **Authentication**: JWT tokens stored in HTTP-only cookies
- **Password Hashing**: bcryptjs

### Data Storage
- **Database**: MongoDB with Mongoose ODM
- **Key Models**: Admin, User, Category, Product, Order, Influencer, Wallet, Transaction, Review, Coupon, Ticket, Address, EmailLog.
- **Seeded Data**: Includes categories and subcategories for ethnic wear.

### Key Design Patterns
- **Component-based UI**
- **Page-based routing**
- **Layout pattern** for admin and user dashboards
- **API abstraction**
- **Context-based authentication**
- **Optimistic UI updates**

### Features
- **Admin Panel**: Dashboard, CRUD for categories, subcategories, banners, products, users, orders, tickets, influencers, payouts, reviews, coupons, inventory, transactions, wallets, referrals, settings, audit logs, CMS pages, FAQs, announcements, media, attributes, analytics, rewards.
- **User Dashboard**: Account management, orders, wishlist, reviews, addresses, wallet, rewards, referrals, influencer program, support tickets.
- **Influencer System**: 5-tier program, KYC verification, payout management, referral tracking.
- **Wallet & Transaction Accounting**: Manages store credit, debits, and credits with detailed transaction records.
- **Order Management**: Full lifecycle management (Order → Confirmed → Processing → Shipped → Delivered → Return → Refund).
- **Payment Gateway**: Razorpay integration.
- **Shipping Integration**: Shiprocket integration for order sync, AWB, and tracking.
- **Returns/Refunds Module**: Comprehensive workflow for return requests and refunds.
- **Coupon System**: Admin-managed coupons with validation and application at checkout.
- **Email Notification System**: Gmail SMTP integration with Nodemailer for various transactional emails and an admin email log.
- **Referral System**: Auto-apply referral codes, track referrer-referee relationships, and commission calculation based on influencer tiers.
- **Stock Management**: Color-wise stock quantity tracking.
- **CMS Pages**: Admin-editable static pages (e.g., About Us, Policies).
- **Order Tracking**: Public-facing order tracking with visual progress.
- **Admin Settings Persistence**: Central settings storage with proper save/load functionality. Razorpay and Shiprocket secrets are masked in UI and only updated when admin enters new values. Checkout page dynamically shows payment methods based on admin configuration.

## External Dependencies

### Database
- **MongoDB**: Primary database.

### Third-Party Services
- **Razorpay**: Payment gateway.
- **Shiprocket**: Shipping logistics.
- **Nodemailer (Gmail SMTP)**: Email notifications.

### Key NPM Packages
- **UI**: @radix-ui, embla-carousel, cmdk, vaul.
- **Forms**: react-hook-form, @hookform/resolvers.
- **Charts**: recharts.
- **Date Handling**: react-day-picker, date-fns.
- **Backend**: express, mongoose, jsonwebtoken, cors, cookie-parser.