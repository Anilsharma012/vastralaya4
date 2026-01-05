import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IReturn extends Document {
  orderId: Types.ObjectId;
  userId: Types.ObjectId;
  returnId: string;
  items: {
    productId: Types.ObjectId;
    name: string;
    quantity: number;
    price: number;
    reason: string;
    images?: string[];
  }[];
  status: 'pending' | 'approved' | 'rejected' | 'pickup_scheduled' | 'picked_up' | 'received' | 'inspecting' | 'refund_initiated' | 'refund_completed' | 'cancelled';
  type: 'return' | 'exchange' | 'refund';
  reason: string;
  additionalNotes?: string;
  images?: string[];
  refundAmount?: number;
  refundMethod?: 'wallet' | 'original' | 'bank';
  refundStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  refundId?: string;
  pickupAddress?: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  shiprocketReturnId?: string;
  awbNumber?: string;
  courierName?: string;
  trackingUrl?: string;
  adminNotes?: string;
  processedBy?: Types.ObjectId;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReturnItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  reason: { type: String, required: true },
  images: [{ type: String }],
}, { _id: false });

const ReturnSchema = new Schema<IReturn>({
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  returnId: { type: String, required: true, unique: true },
  items: [ReturnItemSchema],
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'pickup_scheduled', 'picked_up', 'received', 'inspecting', 'refund_initiated', 'refund_completed', 'cancelled'],
    default: 'pending'
  },
  type: { type: String, enum: ['return', 'exchange', 'refund'], default: 'return' },
  reason: { type: String, required: true },
  additionalNotes: { type: String },
  images: [{ type: String }],
  refundAmount: { type: Number },
  refundMethod: { type: String, enum: ['wallet', 'original', 'bank'] },
  refundStatus: { type: String, enum: ['pending', 'processing', 'completed', 'failed'] },
  refundId: { type: String },
  pickupAddress: {
    name: { type: String },
    phone: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
  },
  shiprocketReturnId: { type: String },
  awbNumber: { type: String },
  courierName: { type: String },
  trackingUrl: { type: String },
  adminNotes: { type: String },
  processedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
  processedAt: { type: Date },
}, { timestamps: true });

export default mongoose.model<IReturn>('Return', ReturnSchema);
