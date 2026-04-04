import mongoose from 'mongoose';

let cachedConnectionPromise;

export const connectToDatabase = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!cachedConnectionPromise) {
    const mongoUrl = process.env.MONGODB_URL;
    if (!mongoUrl) {
      throw new Error('MONGODB_URL is not set');
    }

    cachedConnectionPromise = mongoose.connect(mongoUrl).catch((error) => {
      cachedConnectionPromise = undefined;
      throw error;
    });
  }

  await cachedConnectionPromise;
  return mongoose.connection;
};