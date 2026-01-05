import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPayout extends Document {
  payoutId: string;
  userId: Types.ObjectId;
  userType: 'user' | 'influencer';
  walletId: Types.ObjectId;
  amount: number;
  paymentMethod: 'bank' | 'upi';
  bankDetails?: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
  upiId?: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected' | 'failed';
  processedAt?: Date;
  processedBy?: Types.ObjectId;
  rejectedAt?: Date;
  rejectedBy?: Types.ObjectId;
  rejectionReason?: string;
  transactionReference?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PayoutSchema = new Schema<IPayout>({
  payoutId: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, required: true },
  userType: { type: String, enum: ['user', 'influencer'], required: true },
  walletId: { type: Schema.Types.ObjectId, ref: 'Wallet', required: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['bank', 'upi'], required: true },
  bankDetails: {
    accountHolderName: { type: String },
    accountNumber: { type: String },
    ifscCode: { type: String },
    bankName: { type: String },
  },
  upiId: { type: String },
  status: { type: String, enum: ['pending', 'processing', 'completed', 'rejected', 'failed'], default: 'pending' },
  processedAt: { type: Date },
  processedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
  rejectedAt: { type: Date },
  rejectedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
  rejectionReason: { type: String },
  transactionReference: { type: String },
  notes: { type: String },
}, { timestamps: true });

export default mongoose.model<IPayout>('Payout', PayoutSchema);
