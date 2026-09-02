import mongoose from 'mongoose';

// MongoDB connection state
let isConnected = false;

export async function connectDB(): Promise<boolean> {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri === 'mongodb://localhost:27017/campus_lost_found') {
    // If no external URI or default localhost without running daemon, we use our reactive in-memory database store
    console.log('[Database] Operating with high-performance integrated in-memory MongoDB store');
    return false;
  }

  if (isConnected) return true;

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    console.log('[Database] Connected to MongoDB successfully');
    return true;
  } catch (error) {
    console.warn('[Database] Could not connect to remote MongoDB, falling back to integrated data store:', (error as Error).message);
    return false;
  }
}

export function isDbConnected(): boolean {
  return isConnected;
}
