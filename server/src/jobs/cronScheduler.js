import cron from 'node-cron';
import { JobIngestionService } from '../services/jobIngestionService.js';
import { ENV } from '../config/env.js';
import { logger } from '../utils/logger.js';

export const initCronJobs = () => {
  if (!ENV.ENABLE_CRON_SYNC) {
    logger.info('Background cron synchronization is disabled via configuration.');
    return;
  }

  logger.info(`Initializing background cron job with schedule: "${ENV.JOB_SYNC_CRON}"`);

  // Schedule task
  cron.schedule(ENV.JOB_SYNC_CRON, async () => {
    logger.info('[CRON] Starting scheduled job synchronization...');
    try {
      const summary = await JobIngestionService.syncAllSources();
      logger.info(`[CRON] Scheduled sync complete. New jobs added: ${summary.totalNewJobs}`);
    } catch (err) {
      logger.error('[CRON] Scheduled job synchronization failed:', err);
    }
  });
};
