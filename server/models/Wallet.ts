import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IWallet extends Document {
  userId: Types.ObjectId;
  userType: 'user' | 'influencer';
  balance: number;
  pendingBalance: number;
  totalEarned: number;
  totalWithdrawn: number;
  totalCredits: number;
  totalDebits: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema = new Schema<IWallet>({
  userId: { type: Schema.Types.ObjectId, required: true },
  userType: { type: String, enum: ['user', 'influencer'], required: true },
  balance: { type: Number, default: 0 },
  pendingBalance: { type: Number, default: 0 },
  totalEarned: { type: Number, default: 0 },
  totalWithdrawn: { type: Number, default: 0 },
  totalCredits: { type: Number, default: 0 },
  totalDebits: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

WalletSchema.index({ userId: 1, userType: 1 }, { unique: true });

export default mongoose.model<IWallet>('Wallet', WalletSchema);
