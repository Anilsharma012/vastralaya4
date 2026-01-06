import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  phone?: string;
  referralCode?: string;
  referredBy?: string;
  referredByUserId?: mongoose.Types.ObjectId;
  commissionTier?: string;
  commissionRate?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, unique: true, sparse: true },
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: String },
  referredByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  commissionTier: { type: String, default: 'Bronze' },
  commissionRate: { type: Number, default: 5 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
