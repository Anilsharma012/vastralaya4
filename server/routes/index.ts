import authRoutes from './auth';
import adminRoutes from './admin';
import publicRoutes from './public';
import userRoutes from './user';
import influencerRoutes from './influencer';

const setupRoutes = (app: any) => {
  // Setup routes is no longer needed with req.app access
};

export { authRoutes, adminRoutes, publicRoutes, userRoutes, influencerRoutes, setupRoutes };