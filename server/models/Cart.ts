import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICartItem {
  productId: Types.ObjectId;
  variantId?: Types.ObjectId;
  quantity: number;
  size?: string;
  color?: string;
  addedAt: Date;
}

export interface ICart extends Document {
  userId: Types.ObjectId;
  items: ICartItem[];
  couponCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  variantId: { type: Schema.Types.ObjectId },
  quantity: { type: Number, required: true, min: 1 },
  size: { type: String },
  color: { type: String },
  addedAt: { type: Date, default: Date.now },
}, { _id: true });

const CartSchema = new Schema<ICart>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [CartItemSchema],
  couponCode: { type: String },
}, { timestamps: true });

export default mongoose.model<ICart>('Cart', CartSchema);
