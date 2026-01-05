import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAddress extends Document {
  userId: Types.ObjectId;
  type: 'home' | 'work' | 'other';
  name: string;
  phone: string;
  alternatePhone?: string;
  address: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['home', 'work', 'other'], default: 'home' },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  alternatePhone: { type: String },
  address: { type: String, required: true },
  landmark: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model<IAddress>('Address', AddressSchema);
