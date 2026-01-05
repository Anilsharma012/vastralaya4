import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'warning', 'success', 'promo'], default: 'info' },
  target: { type: String, enum: ['all', 'users', 'influencers'], default: 'all' },
  isActive: { type: Boolean, default: true },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date }
}, { timestamps: true });

export default mongoose.model('Announcement', announcementSchema);
