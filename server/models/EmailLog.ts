import mongoose from 'mongoose';

const emailLogSchema = new mongoose.Schema({
  to: { type: String, required: true },
  subject: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['login_success', 'order_placed', 'order_shipped', 'order_delivered', 'other'],
    required: true 
  },
  referenceId: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'sent', 'failed'],
    default: 'pending' 
  },
  error: { type: String },
  sentAt: { type: Date },
  retryCount: { type: Number, default: 0 },
}, { timestamps: true });

emailLogSchema.index({ type: 1, referenceId: 1 });
emailLogSchema.index({ to: 1 });
emailLogSchema.index({ status: 1 });
emailLogSchema.index({ createdAt: -1 });

export default mongoose.model('EmailLog', emailLogSchema);
