import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISocialMediaPost extends Document {
  title: string;
  platform: 'instagram' | 'youtube';
  videoUrl: string;
  thumbnail: string;
  views: number;
  linkedType: 'product' | 'category' | 'external';
  linkedId?: Types.ObjectId;
  externalUrl?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const SocialMediaPostSchema = new Schema<ISocialMediaPost>({
  title: { type: String, required: true },
  platform: { type: String, enum: ['instagram', 'youtube'], required: true },
  videoUrl: { type: String, required: true },
  thumbnail: { type: String, required: true },
  views: { type: Number, default: 0 },
  linkedType: { type: String, enum: ['product', 'category', 'external'], required: true },
  linkedId: { type: Schema.Types.ObjectId },
  externalUrl: { type: String },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model<ISocialMediaPost>('SocialMediaPost', SocialMediaPostSchema);
