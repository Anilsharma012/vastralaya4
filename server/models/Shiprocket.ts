import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IShiprocketOrder extends Document {
  orderId: Types.ObjectId;
  shiprocketOrderId: string;
  shiprocketShipmentId?: string;
  awbNumber?: string;
  courierName?: string;
  courierCompanyId?: number;
  status: 'new' | 'pickup_scheduled' | 'pickup_generated' | 'pickup_queued' | 'manifested' | 'shipped' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'rto_initiated' | 'rto_delivered' | 'undelivered';
  statusCode?: number;
  trackingUrl?: string;
  estimatedDelivery?: Date;
  pickupDate?: Date;
  deliveredDate?: Date;
  weight?: number;
  dimensions?: {
    length: number;
    breadth: number;
    height: number;
  };
  charges?: {
    freight: number;
    cod: number;
    total: number;
  };
  trackingHistory: {
    status: string;
    statusCode: number;
    location: string;
    timestamp: Date;
  }[];
  syncedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ShiprocketOrderSchema = new Schema<IShiprocketOrder>({
  orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
  shiprocketOrderId: { type: String, required: true },
  shiprocketShipmentId: { type: String },
  awbNumber: { type: String },
  courierName: { type: String },
  courierCompanyId: { type: Number },
  status: { 
    type: String, 
    enum: ['new', 'pickup_scheduled', 'pickup_generated', 'pickup_queued', 'manifested', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled', 'rto_initiated', 'rto_delivered', 'undelivered'],
    default: 'new'
  },
  statusCode: { type: Number },
  trackingUrl: { type: String },
  estimatedDelivery: { type: Date },
  pickupDate: { type: Date },
  deliveredDate: { type: Date },
  weight: { type: Number },
  dimensions: {
    length: { type: Number },
    breadth: { type: Number },
    height: { type: Number },
  },
  charges: {
    freight: { type: Number },
    cod: { type: Number },
    total: { type: Number },
  },
  trackingHistory: [{
    status: { type: String },
    statusCode: { type: Number },
    location: { type: String },
    timestamp: { type: Date },
  }],
  syncedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model<IShiprocketOrder>('ShiprocketOrder', ShiprocketOrderSchema);
