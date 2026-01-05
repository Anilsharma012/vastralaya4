import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITransaction extends Document {
  transactionId: string;
  walletId: Types.ObjectId;
  userId: Types.ObjectId;
  userType: 'user' | 'influencer';
  type: 'credit' | 'debit';
  amount: number;
  balanceAfter: number;
  category: 'order_payment' | 'refund' | 'cashback' | 'commission' | 'withdrawal' | 'bonus' | 'referral_bonus' | 'adjustment';
  referenceType?: 'order' | 'payout' | 'referral' | 'manual';
  referenceId?: Types.ObjectId;
  description: string;
  status: 'pending' | 'completed' | 'failed' | 'reversed';
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>({
  transactionId: { type: String, required: true, unique: true },
  walletId: { type: Schema.Types.ObjectId, ref: 'Wallet', required: true },
  userId: { type: Schema.Types.ObjectId, required: true },
  userType: { type: String, enum: ['user', 'influencer'], required: true },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  amount: { type: Number, required: true },
  balanceAfter: { type: Number, required: true },
  category: { 
    type: String, 
    enum: ['order_payment', 'refund', 'cashback', 'commission', 'withdrawal', 'bonus', 'referral_bonus', 'adjustment'],
    required: true 
  },
  referenceType: { type: String, enum: ['order', 'payout', 'referral', 'manual'] },
  referenceId: { type: Schema.Types.ObjectId },
  description: { type: String, required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'reversed'], default: 'completed' },
  metadata: { type: Map, of: Schema.Types.Mixed },
}, { timestamps: true });

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);
