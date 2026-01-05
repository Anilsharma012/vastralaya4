import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  perUserLimit: number;
  applicableCategories?: Types.ObjectId[];
  applicableProducts?: Types.ObjectId[];
  excludedCategories?: Types.ObjectId[];
  excludedProducts?: Types.ObjectId[];
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>({
  code: { type: String, required: true, unique: true, uppercase: true },
  name: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['percentage', 'fixed'], required: true },
  value: { type: Number, required: true },
  minOrderAmount: { type: Number },
  maxDiscount: { type: Number },
  usageLimit: { type: Number },
  usedCount: { type: Number, default: 0 },
  perUserLimit: { type: Number, default: 1 },
  applicableCategories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
  applicableProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  excludedCategories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
  excludedProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  isActive: { type: Boolean, default: true },
  startDate: { type: Date },
  endDate: { type: Date },
  createdBy: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
}, { timestamps: true });

export default mongoose.model<ICoupon>('Coupon', CouponSchema);
