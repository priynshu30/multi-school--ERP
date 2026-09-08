import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';

let mongoMemoryServerInstance: any = null;

export const connectDatabase = async (): Promise<string> => {
  let connectionUri = env.MONGO_URI;

  try {
    // Attempt connecting with 3s timeout
    logger.info(`Attempting MongoDB connection at ${connectionUri}...`);
    await mongoose.connect(connectionUri, {
      serverSelectionTimeoutMS: 3000,
    });
    logger.info('Connected to MongoDB successfully.');
    return connectionUri;
  } catch (error: any) {
    logger.warn(`Could not connect to external MongoDB: ${error.message}. Initializing embedded in-memory MongoDB...`);
    
    // Dynamic import of mongodb-memory-server so it doesn't inflate production bundles
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongoMemoryServerInstance = await MongoMemoryServer.create();
    connectionUri = mongoMemoryServerInstance.getUri();

    await mongoose.connect(connectionUri);
    logger.info(`Connected to embedded in-memory MongoDB at ${connectionUri}`);
    return connectionUri;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServerInstance) {
      await mongoMemoryServerInstance.stop();
      mongoMemoryServerInstance = null;
    }
    logger.info('Disconnected from MongoDB.');
  } catch (error: any) {
    logger.error('Error disconnecting from MongoDB:', error);
  }
};
