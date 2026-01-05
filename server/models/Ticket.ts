import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITicketMessage {
  senderId: Types.ObjectId;
  senderType: 'user' | 'admin';
  message: string;
  attachments?: string[];
  createdAt: Date;
}

export interface ITicket extends Document {
  ticketId: string;
  userId: Types.ObjectId;
  orderId?: Types.ObjectId;
  subject: string;
  category: 'order' | 'payment' | 'refund' | 'product' | 'delivery' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
  messages: ITicketMessage[];
  assignedTo?: Types.ObjectId;
  resolvedAt?: Date;
  resolvedBy?: Types.ObjectId;
  closedAt?: Date;
  closedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TicketMessageSchema = new Schema({
  senderId: { type: Schema.Types.ObjectId, required: true },
  senderType: { type: String, enum: ['user', 'admin'], required: true },
  message: { type: String, required: true },
  attachments: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
}, { _id: true });

const TicketSchema = new Schema<ITicket>({
  ticketId: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
  subject: { type: String, required: true },
  category: { type: String, enum: ['order', 'payment', 'refund', 'product', 'delivery', 'other'], required: true },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  status: { type: String, enum: ['open', 'in_progress', 'waiting_customer', 'resolved', 'closed'], default: 'open' },
  messages: [TicketMessageSchema],
  assignedTo: { type: Schema.Types.ObjectId, ref: 'Admin' },
  resolvedAt: { type: Date },
  resolvedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
  closedAt: { type: Date },
  closedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
}, { timestamps: true });

export default mongoose.model<ITicket>('Ticket', TicketSchema);
