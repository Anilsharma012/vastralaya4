import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'signup' | 'login' | 'order_confirmed' | 'order_delivered' | 'order_shipped' | 'promotion' | 'reward' | 'system';
  title: string;
  message: string;
  orderId?: string;
  read: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { 
    type: String, 
    enum: ['signup', 'login', 'order_confirmed', 'order_delivered', 'order_shipped', 'promotion', 'reward', 'system'],
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  orderId: { type: String },
  read: { type: Boolean, default: false },
}, { timestamps: true });

notificationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<INotification>('Notification', notificationSchema);
