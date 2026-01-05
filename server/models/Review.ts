import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IReview extends Document {
  productId: Types.ObjectId;
  userId: Types.ObjectId;
  orderId?: Types.ObjectId;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  approvedAt?: Date;
  approvedBy?: Types.ObjectId;
  helpfulCount: number;
  reportCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String },
  comment: { type: String },
  images: [{ type: String }],
  isVerifiedPurchase: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: false },
  approvedAt: { type: Date },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
  helpfulCount: { type: Number, default: 0 },
  reportCount: { type: Number, default: 0 },
}, { timestamps: true });

ReviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

export default mongoose.model<IReview>('Review', ReviewSchema);
