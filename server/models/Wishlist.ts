import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IWishlistItem {
  productId: Types.ObjectId;
  addedAt: Date;
}

export interface IWishlist extends Document {
  userId: Types.ObjectId;
  items: IWishlistItem[];
  createdAt: Date;
  updatedAt: Date;
}

const WishlistItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  addedAt: { type: Date, default: Date.now },
}, { _id: false });

const WishlistSchema = new Schema<IWishlist>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [WishlistItemSchema],
}, { timestamps: true });

export default mongoose.model<IWishlist>('Wishlist', WishlistSchema);
