import mongoose, { Schema, Document } from 'mongoose';

export interface IBanner extends Document {
  title: string;
  subtitle?: string;
  imageUrl: string;
  targetLink?: string;
  buttonText?: string;
  placement: 'hero' | 'promo' | 'sidebar';
  isActive: boolean;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

const BannerSchema = new Schema<IBanner>({
  title: { type: String, required: true },
  subtitle: { type: String },
  imageUrl: { type: String, required: true },
  targetLink: { type: String },
  buttonText: { type: String },
  placement: { type: String, enum: ['hero', 'promo', 'sidebar'], default: 'hero' },
  isActive: { type: Boolean, default: true },
  priority: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model<IBanner>('Banner', BannerSchema);