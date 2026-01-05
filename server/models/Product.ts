import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISizeChartRow {
  size: string;
  [key: string]: string; // Dynamic fields like chest, waist, length, etc.
}

export interface ISizeChart {
  fieldNames: string[]; // e.g., ['chest', 'waist', 'length']
  rows: ISizeChartRow[];
}

export interface ISizeInventory {
  S?: number;
  M?: number;
  L?: number;
  XL?: number;
  XXL?: number;
}

export interface IProductVariant {
  size?: string;
  color?: string;
  sku: string;
  price: number;
  comparePrice?: number;
  stock: number;
  images?: string[];
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  categoryId: Types.ObjectId;
  subcategoryId?: Types.ObjectId;
  images: string[];
  price: number;
  comparePrice?: number;
  sku: string;
  stock: number;
  variants: IProductVariant[];
  sizeInventory?: ISizeInventory;
  attributes: Record<string, string>;
  tags: string[];
  sizeChart?: ISizeChart;
  isActive: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  avgRating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const SizeInventorySchema = new Schema({
  S: { type: Number, default: 0 },
  M: { type: Number, default: 0 },
  L: { type: Number, default: 0 },
  XL: { type: Number, default: 0 },
  XXL: { type: Number, default: 0 },
}, { _id: false });

const SizeChartRowSchema = new Schema({
  size: { type: String, required: true },
}, { strict: false, _id: false });

const SizeChartSchema = new Schema({
  fieldNames: [{ type: String }],
  rows: [SizeChartRowSchema],
}, { _id: false });

const ProductVariantSchema = new Schema({
  size: { type: String },
  color: { type: String },
  sku: { type: String, required: true },
  price: { type: Number, required: true },
  comparePrice: { type: Number },
  stock: { type: Number, default: 0 },
  images: [{ type: String }],
}, { _id: true });

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  shortDescription: { type: String },
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  subcategoryId: { type: Schema.Types.ObjectId, ref: 'Subcategory' },
  images: [{ type: String }],
  price: { type: Number, required: true },
  comparePrice: { type: Number },
  sku: { type: String, required: true, unique: true },
  stock: { type: Number, default: 0 },
  variants: [ProductVariantSchema],
  sizeInventory: SizeInventorySchema,
  attributes: { type: Map, of: String },
  tags: [{ type: String }],
  sizeChart: SizeChartSchema,
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  avgRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
}, { timestamps: true });

ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });

export default mongoose.model<IProduct>('Product', ProductSchema);
