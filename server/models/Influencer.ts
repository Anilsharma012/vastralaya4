import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IInfluencer extends Document {
  userId: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  username: string;
  referralCode: string;
  referralLink: string;
  status: 'pending' | 'approved' | 'rejected' | 'blocked';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  level: number;
  kyc: {
    panNumber?: string;
    panImage?: string;
    aadharNumber?: string;
    aadharFrontImage?: string;
    aadharBackImage?: string;
    address?: string;
    isVerified: boolean;
    verifiedAt?: Date;
  };
  bankDetails: {
    accountHolderName?: string;
    accountNumber?: string;
    ifscCode?: string;
    bankName?: string;
    upiId?: string;
    preferredMethod: 'bank' | 'upi';
  };
  stats: {
    totalClicks: number;
    totalLeads: number;
    totalOrders: number;
    totalSales: number;
    conversionRate: number;
  };
  commission: {
    rate: number;
    pendingAmount: number;
    availableAmount: number;
    paidAmount: number;
    totalEarned: number;
  };
  socialLinks?: {
    instagram?: string;
    youtube?: string;
    facebook?: string;
    twitter?: string;
  };
  bio?: string;
  profileImage?: string;
  approvedAt?: Date;
  approvedBy?: Types.ObjectId;
  rejectedAt?: Date;
  rejectedBy?: Types.ObjectId;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InfluencerSchema = new Schema<IInfluencer>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  referralCode: { type: String, required: true, unique: true },
  referralLink: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'blocked'], default: 'pending' },
  tier: { type: String, enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'], default: 'bronze' },
  level: { type: Number, default: 1 },
  kyc: {
    panNumber: { type: String },
    panImage: { type: String },
    aadharNumber: { type: String },
    aadharFrontImage: { type: String },
    aadharBackImage: { type: String },
    address: { type: String },
    isVerified: { type: Boolean, default: false },
    verifiedAt: { type: Date },
  },
  bankDetails: {
    accountHolderName: { type: String },
    accountNumber: { type: String },
    ifscCode: { type: String },
    bankName: { type: String },
    upiId: { type: String },
    preferredMethod: { type: String, enum: ['bank', 'upi'], default: 'bank' },
  },
  stats: {
    totalClicks: { type: Number, default: 0 },
    totalLeads: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    totalSales: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
  },
  commission: {
    rate: { type: Number, default: 5 },
    pendingAmount: { type: Number, default: 0 },
    availableAmount: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    totalEarned: { type: Number, default: 0 },
  },
  socialLinks: {
    instagram: { type: String },
    youtube: { type: String },
    facebook: { type: String },
    twitter: { type: String },
  },
  bio: { type: String },
  profileImage: { type: String },
  approvedAt: { type: Date },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
  rejectedAt: { type: Date },
  rejectedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
  rejectionReason: { type: String },
}, { timestamps: true });

export default mongoose.model<IInfluencer>('Influencer', InfluencerSchema);
