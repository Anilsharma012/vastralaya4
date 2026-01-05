import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IReferral extends Document {
  referrerId: Types.ObjectId;
  referrerType: 'user' | 'influencer';
  referredUserId: Types.ObjectId;
  referralCode: string;
  status: 'pending' | 'converted' | 'expired';
  orderId?: Types.ObjectId;
  orderAmount?: number;
  commissionAmount?: number;
  commissionStatus: 'pending' | 'credited' | 'cancelled';
  creditedAt?: Date;
  convertedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReferralSchema = new Schema<IReferral>({
  referrerId: { type: Schema.Types.ObjectId, required: true },
  referrerType: { type: String, enum: ['user', 'influencer'], required: true },
  referredUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  referralCode: { type: String, required: true },
  status: { type: String, enum: ['pending', 'converted', 'expired'], default: 'pending' },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
  orderAmount: { type: Number },
  commissionAmount: { type: Number },
  commissionStatus: { type: String, enum: ['pending', 'credited', 'cancelled'], default: 'pending' },
  creditedAt: { type: Date },
  convertedAt: { type: Date },
  expiresAt: { type: Date },
}, { timestamps: true });

export default mongoose.model<IReferral>('Referral', ReferralSchema);
