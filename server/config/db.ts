import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.warn('MONGODB_URI environment variable is not set. Database features will not work.');
      return false;
    }
    
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error: any) {
    console.error('MongoDB connection error:', error.message || error);
    console.warn('Server will continue running but database features will not work.');
    return false;
  }
};

export default connectDB;