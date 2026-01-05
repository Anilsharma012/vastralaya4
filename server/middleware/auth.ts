import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
  adminId?: string;
  userRole?: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.userId = decoded.userId;
    req.adminId = decoded.adminId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

export const verifyAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.adminToken || req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (!decoded.adminId) {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    req.adminId = decoded.adminId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

export const generateToken = (payload: object, expiresIn: string = '7d') => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};