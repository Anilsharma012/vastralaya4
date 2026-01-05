import mongoose from 'mongoose';

const attributeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['text', 'color', 'size', 'select'], default: 'text' },
  values: [{ type: String }],
  isRequired: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Attribute', attributeSchema);
