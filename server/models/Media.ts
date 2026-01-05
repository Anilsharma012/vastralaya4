import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
  url: { type: String, required: true },
  filename: { type: String },
  type: { type: String, default: 'image' },
  size: { type: Number, default: 0 },
  alt: { type: String },
  tags: [{ type: String }],
  usedIn: [{ type: String }]
}, { timestamps: true });

export default mongoose.model('Media', mediaSchema);
