import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ENV } from './env.js';
import { logger } from '../utils/logger.js';

let mongodInstance = null;

export const connectDB = async () => {
  try {
    if (ENV.MONGODB_URI && ENV.MONGODB_URI.startsWith('mongodb')) {
      try {
        logger.info(`Attempting connection to MongoDB URI: ${ENV.MONGODB_URI.replace(/\/\/.*@/, '//***@')}`);
        // Quick timeout to not hang if local mongod is not running
        await mongoose.connect(ENV.MONGODB_URI, {
          serverSelectionTimeoutMS: 2500,
        });
        logger.info('MongoDB connected successfully via MONGODB_URI.');
        return mongoose.connection;
      } catch (connErr) {
        logger.warn(`Failed to connect to configured MONGODB_URI (${connErr.message}). Falling back to in-memory MongoDB...`);
      }
    }

    logger.info('Initializing In-Memory MongoDB Server (Zero-Config Development)...');
    mongodInstance = await MongoMemoryServer.create();
    const uri = mongodInstance.getUri();
    await mongoose.connect(uri);
    logger.info(`Connected to In-Memory MongoDB successfully at ${uri}`);
    logger.info('Note: In-memory DB retains data for the server session. For persistent data, set MONGODB_URI in .env');
    return mongoose.connection;
  } catch (error) {
    logger.error('Fatal error connecting to database:', error);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongodInstance) {
      await mongodInstance.stop();
    }
    logger.info('Database disconnected.');
  } catch (error) {
    logger.error('Error disconnecting database:', error);
  }
};
