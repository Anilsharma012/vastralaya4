import authRoutes from './auth';
import adminRoutes from './admin';
import publicRoutes from './public';
import userRoutes from './user';
import influencerRoutes from './influencer';

const setupRoutes = (app: any) => {
  // Pass the upload middleware to admin routes
  if (adminRoutes && (adminRoutes as any).upload === undefined) {
    (adminRoutes as any).upload = app.upload;
  }
};

export { authRoutes, adminRoutes, publicRoutes, userRoutes, influencerRoutes, setupRoutes };