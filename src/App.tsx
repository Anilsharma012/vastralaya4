import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import Index from "./pages/Index";
import About from "./pages/About";
import ProductDetail from "./pages/ProductDetail";
import NotFound from "./pages/NotFound";
import CMSPage from "./pages/CMSPage";
import TrackOrder from "./pages/TrackOrder";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminSetup from "./pages/admin/AdminSetup";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CategoriesPage from "./pages/admin/CategoriesPage";
import SubcategoriesPage from "./pages/admin/SubcategoriesPage";
import BannersPage from "./pages/admin/BannersPage";
import UsersPage from "./pages/admin/UsersPage";
import ProductsPage from "./pages/admin/ProductsPage";
import AdminOrdersPage from "./pages/admin/OrdersPage";
import AdminTicketsPage from "./pages/admin/TicketsPage";
import AdminReviewsPage from "./pages/admin/ReviewsPage";
import AdminCouponsPage from "./pages/admin/CouponsPage";
import AdminInfluencersPage from "./pages/admin/InfluencersPage";
import AdminInventoryPage from "./pages/admin/InventoryPage";
import AdminTransactionsPage from "./pages/admin/TransactionsPage";
import AdminWalletsPage from "./pages/admin/WalletsPage";
import AdminPayoutsPage from "./pages/admin/PayoutsPage";
import AdminReferralsPage from "./pages/admin/ReferralsPage";
import AdminSettingsPage from "./pages/admin/SettingsPage";
import AdminAuditLogsPage from "./pages/admin/AuditLogsPage";
import AdminPagesPage from "./pages/admin/PagesPage";
import AdminFAQPage from "./pages/admin/FAQPage";
import AdminAnnouncementsPage from "./pages/admin/AnnouncementsPage";
import AdminAnalyticsPage from "./pages/admin/AnalyticsPage";
import AdminRewardsPage from "./pages/admin/RewardsPage";
import AdminMediaGalleryPage from "./pages/admin/MediaGalleryPage";
import AdminAttributesPage from "./pages/admin/AttributesPage";
import AdminSocialMediaVideosPage from "./pages/admin/SocialMediaVideosPage";
import AdminReturnsPage from "./pages/admin/ReturnsPage";
import AdminShiprocketPage from "./pages/admin/ShiprocketPage";
import InfluencerLogin from "./pages/influencer/InfluencerLogin";
import InfluencerDashboard from "./pages/influencer/InfluencerDashboard";
import CategoryPage from "./pages/CategoryPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboardLayout from "./layouts/UserDashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import ProfilePage from "./pages/dashboard/ProfilePage";
import OrdersPage from "./pages/dashboard/OrdersPage";
import WishlistPage from "./pages/dashboard/WishlistPage";
import AddressesPage from "./pages/dashboard/AddressesPage";
import WalletPage from "./pages/dashboard/WalletPage";
import ReferralsPage from "./pages/dashboard/ReferralsPage";
import InfluencerPage from "./pages/dashboard/InfluencerPage";
import TicketsPage from "./pages/dashboard/TicketsPage";
import PaymentMethodsPage from "./pages/dashboard/PaymentMethodsPage";
import RewardsPage from "./pages/dashboard/RewardsPage";
import TransactionsPage from "./pages/dashboard/TransactionsPage";

const queryClient = new QueryClient();

const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-2">{title}</h1>
    <p className="text-muted-foreground">This page is under development.</p>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
        <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/page/:slug" element={<CMSPage />} />
            <Route path="/track-order" element={<TrackOrder />} />
            <Route path="/category/:categorySlug" element={<CategoryPage />} />
            <Route path="/category/:categorySlug/:subcategorySlug" element={<CategoryPage />} />
            <Route path="/product/:productId" element={<ProductDetail />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/dashboard" element={<UserDashboardLayout />}>
              <Route index element={<DashboardHome />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="wishlist" element={<WishlistPage />} />
              <Route path="addresses" element={<AddressesPage />} />
              <Route path="wallet" element={<WalletPage />} />
              <Route path="transactions" element={<TransactionsPage />} />
              <Route path="payments" element={<PaymentMethodsPage />} />
              <Route path="rewards" element={<RewardsPage />} />
              <Route path="referrals" element={<ReferralsPage />} />
              <Route path="influencer" element={<InfluencerPage />} />
              <Route path="influencer/stats" element={<PlaceholderPage title="Influencer Stats" />} />
              <Route path="influencer/commission" element={<PlaceholderPage title="Commission" />} />
              <Route path="tickets" element={<TicketsPage />} />
              <Route path="notifications" element={<PlaceholderPage title="Notifications" />} />
              <Route path="settings" element={<PlaceholderPage title="Settings" />} />
              <Route path="reviews" element={<PlaceholderPage title="My Reviews" />} />
            </Route>
            
            <Route path="/influencer/login" element={<InfluencerLogin />} />
            <Route path="/influencer/dashboard" element={<InfluencerDashboard />} />
            
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/setup" element={<AdminSetup />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="subcategories" element={<SubcategoriesPage />} />
              <Route path="banners" element={<BannersPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="influencers" element={<AdminInfluencersPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="inventory" element={<AdminInventoryPage />} />
              <Route path="attributes" element={<AdminAttributesPage />} />
              <Route path="media" element={<AdminMediaGalleryPage />} />
              <Route path="reviews" element={<AdminReviewsPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="returns" element={<AdminReturnsPage />} />
              <Route path="shiprocket" element={<AdminShiprocketPage />} />
              <Route path="coupons" element={<AdminCouponsPage />} />
              <Route path="shipping" element={<AdminSettingsPage />} />
              <Route path="payments" element={<AdminSettingsPage />} />
              <Route path="transactions" element={<AdminTransactionsPage />} />
              <Route path="user-wallets" element={<AdminWalletsPage />} />
              <Route path="influencer-wallets" element={<AdminWalletsPage />} />
              <Route path="payouts" element={<AdminPayoutsPage />} />
              <Route path="commission" element={<AdminSettingsPage />} />
              <Route path="referrals" element={<AdminReferralsPage />} />
              <Route path="rewards" element={<AdminRewardsPage />} />
              <Route path="reward-history" element={<AdminReferralsPage />} />
              <Route path="tiers" element={<AdminInfluencersPage />} />
              <Route path="tickets" element={<AdminTicketsPage />} />
              <Route path="announcements" element={<AdminAnnouncementsPage />} />
              <Route path="pages" element={<AdminPagesPage />} />
              <Route path="faqs" element={<AdminFAQPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
              <Route path="audit-logs" element={<AdminAuditLogsPage />} />
              <Route path="analytics" element={<AdminAnalyticsPage />} />
              <Route path="social-media" element={<AdminSocialMediaVideosPage />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
