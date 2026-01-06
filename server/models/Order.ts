import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IOrderItem {
  productId: Types.ObjectId;
  variantId?: Types.ObjectId;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

export interface IOrder extends Document {
  orderId: string;
  userId: Types.ObjectId;
  items: IOrderItem[];
  subtotal: number;
  discount: number;
  shippingCharge: number;
  tax: number;
  total: number;
  couponCode?: string;
  referralCode?: string;
  influencerId?: Types.ObjectId;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  billingAddress?: {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  paymentMethod: 'cod' | 'online' | 'wallet';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentId?: string;
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  trackingNumber?: string;
  trackingUrl?: string;
  notes?: string;
  cancelReason?: string;
  returnReason?: string;
  deliveredAt?: Date;
  courierName?: string;
  expectedDelivery?: string;
  orderPlacedEmailSent?: boolean;
  shippedEmailSent?: boolean;
  deliveredEmailSent?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  variantId: { type: Schema.Types.ObjectId },
  name: { type: String, required: true },
  image: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  size: { type: String },
  color: { type: String },
}, { _id: false });

const AddressSchema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  landmark: { type: String },
}, { _id: false });

const OrderSchema = new Schema<IOrder>({
  orderId: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [OrderItemSchema],
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  shippingCharge: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true },
  couponCode: { type: String },
  referralCode: { type: String },
  influencerId: { type: Schema.Types.ObjectId, ref: 'Influencer' },
  shippingAddress: { type: AddressSchema, required: true },
  billingAddress: { type: AddressSchema },
  paymentMethod: { type: String, enum: ['cod', 'online', 'wallet'], default: 'cod' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  paymentId: { type: String },
  orderStatus: { type: String, enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'], default: 'pending' },
  trackingNumber: { type: String },
  trackingUrl: { type: String },
  notes: { type: String },
  cancelReason: { type: String },
  returnReason: { type: String },
  deliveredAt: { type: Date },
  courierName: { type: String },
  expectedDelivery: { type: String },
  orderPlacedEmailSent: { type: Boolean, default: false },
  shippedEmailSent: { type: Boolean, default: false },
  deliveredEmailSent: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model<IOrder>('Order', OrderSchema);
