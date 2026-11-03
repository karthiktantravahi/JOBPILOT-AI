import app from './app.js';
import { connectDB } from './config/db.js';
import { ENV } from './config/env.js';
import { seedDatabase } from './utils/seedData.js';
import { initCronJobs } from './jobs/cronScheduler.js';
import { logger } from './utils/logger.js';

const startServer = async () => {
  try {
    // Connect to database (Mongo Atlas / local URI or in-memory fallback)
    await connectDB();

    // Auto-seed baseline jobs if database is empty
    await seedDatabase();

    // Initialize scheduled cron job synchronization
    initCronJobs();

    const server = app.listen(ENV.PORT, () => {
      logger.info(`====================================================`);
      logger.info(`🚀 JobPilot AI Server running on http://localhost:${ENV.PORT}`);
      logger.info(`🌍 Environment: ${ENV.NODE_ENV}`);
      logger.info(`📡 Client URL: ${ENV.CLIENT_URL}`);
      logger.info(`====================================================`);
    });

    const shutdown = async (signal) => {
      logger.info(`Received ${signal}. Gracefully shutting down server...`);
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
