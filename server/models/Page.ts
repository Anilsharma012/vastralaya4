import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPage extends Document {
  title: string;
  slug: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  isActive: boolean;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PageSchema = new Schema<IPage>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  metaTitle: { type: String },
  metaDescription: { type: String },
  isActive: { type: Boolean, default: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
}, { timestamps: true });

export default mongoose.model<IPage>('Page', PageSchema);
