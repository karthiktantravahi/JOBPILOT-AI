import { connectDB, disconnectDB } from '../config/db.js';
import { JobIngestionService } from '../services/jobIngestionService.js';
import { logger } from '../utils/logger.js';

const run = async () => {
  try {
    await connectDB();
    logger.info('Starting manual job synchronization CLI...');
    const result = await JobIngestionService.syncAllSources();
    logger.info('Sync completed successfully:', JSON.stringify(result, null, 2));
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    logger.error('Sync CLI error:', error);
    process.exit(1);
  }
};

run();
