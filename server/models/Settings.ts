import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  store: {
    name: string;
    email: string;
    phone: string;
    address: string;
    currency: string;
    taxRate: number;
  };
  shipping: {
    freeShippingThreshold: number;
    standardRate: number;
    expressRate: number;
    estimatedDays: number;
    shiprocketEnabled: boolean;
    shiprocketEmail: string;
    shiprocketPassword: string;
    shiprocketToken: string;
    shiprocketPickupLocation: string;
  };
  payments: {
    codEnabled: boolean;
    onlineEnabled: boolean;
    razorpayEnabled: boolean;
    razorpayKeyId: string;
    razorpayKeySecret: string;
    minOrderAmount: number;
  };
  referral: {
    enabled: boolean;
    referrerReward: number;
    refereeDiscount: number;
    minOrderForReward: number;
  };
  commission: {
    bronzeRate: number;
    silverRate: number;
    goldRate: number;
    platinumRate: number;
    diamondRate: number;
  };
  rewards: {
    enabled: boolean;
    pointsPerRupee: number;
    redeemRatio: number;
    minRedeemPoints: number;
  };
  founderNote: {
    title: string;
    message: string;
    author: string;
    designation: string;
    imageUrl: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>({
  store: {
    name: { type: String, default: 'Shri Balaji Vastralya' },
    email: { type: String, default: 'support@Shreebalajivastralya.com' },
    phone: { type: String, default: '+91 9876543210' },
    address: { type: String, default: 'Railway Road, Rohtak-124001' },
    currency: { type: String, default: 'INR' },
    taxRate: { type: Number, default: 0 }
  },
  shipping: {
    freeShippingThreshold: { type: Number, default: 999 },
    standardRate: { type: Number, default: 99 },
    expressRate: { type: Number, default: 199 },
    estimatedDays: { type: Number, default: 5 },
    shiprocketEnabled: { type: Boolean, default: false },
    shiprocketEmail: { type: String, default: '' },
    shiprocketPassword: { type: String, default: '' },
    shiprocketToken: { type: String, default: '' },
    shiprocketPickupLocation: { type: String, default: '' }
  },
  payments: {
    codEnabled: { type: Boolean, default: true },
    onlineEnabled: { type: Boolean, default: false },
    razorpayEnabled: { type: Boolean, default: false },
    razorpayKeyId: { type: String, default: '' },
    razorpayKeySecret: { type: String, default: '' },
    minOrderAmount: { type: Number, default: 500 }
  },
  referral: {
    enabled: { type: Boolean, default: true },
    referrerReward: { type: Number, default: 100 },
    refereeDiscount: { type: Number, default: 10 },
    minOrderForReward: { type: Number, default: 1000 }
  },
  commission: {
    bronzeRate: { type: Number, default: 5 },
    silverRate: { type: Number, default: 6 },
    goldRate: { type: Number, default: 7 },
    platinumRate: { type: Number, default: 8 },
    diamondRate: { type: Number, default: 10 }
  },
  rewards: {
    enabled: { type: Boolean, default: false },
    pointsPerRupee: { type: Number, default: 1 },
    redeemRatio: { type: Number, default: 100 },
    minRedeemPoints: { type: Number, default: 100 }
  },
  founderNote: {
    title: { type: String, default: 'A Message From Our Heart' },
    message: { type: String, default: 'We love you and so when you step into our store, we leave no stones unturned to make you feel special & close to us. We give a humane touch to your shopping experience.\n\nWe are personally available to help you find your perfect fit. Not only that, we suggest styling tips for your body types & individual expression. Thus, helping you to choose the right styles.' },
    author: { type: String, default: 'Chhavi Kumar Chaddha' },
    designation: { type: String, default: 'LA GLITS FOUNDER' },
    imageUrl: { type: String, default: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1000&auto=format&fit=crop' }
  }
}, { timestamps: true });

export default mongoose.model<ISettings>('Settings', SettingsSchema);
