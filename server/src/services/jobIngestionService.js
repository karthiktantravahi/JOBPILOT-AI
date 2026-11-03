import { RemotiveAdapter } from './adapters/remotiveAdapter.js';
import { GreenhouseAdapter } from './adapters/greenhouseAdapter.js';
import { LeverAdapter } from './adapters/leverAdapter.js';
import { ArbeitnowAdapter } from './adapters/arbeitnowAdapter.js';
import { Job } from '../models/Job.js';
import { SyncLog } from '../models/SyncLog.js';
import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';
import { NOTIFICATION_TYPES } from '../config/constants.js';
import { logger } from '../utils/logger.js';

export class JobIngestionService {
  /**
   * Run synchronization across all configured job adapters
   */
  static async syncAllSources() {
    logger.info('Starting full job synchronization across all sources...');
    const results = {};

    const adapters = [
      { name: RemotiveAdapter.sourceName, fetch: () => RemotiveAdapter.fetchJobs() },
      { name: GreenhouseAdapter.sourceName, fetch: () => GreenhouseAdapter.fetchJobs() },
      { name: LeverAdapter.sourceName, fetch: () => LeverAdapter.fetchJobs() },
      { name: ArbeitnowAdapter.sourceName, fetch: () => ArbeitnowAdapter.fetchJobs() },
    ];

    let totalNewJobs = 0;

    for (const adapter of adapters) {
      const startTime = Date.now();
      let status = 'SUCCESS';
      let errorMsg = null;
      let added = 0;
      let found = 0;

      try {
        const jobs = await adapter.fetch();
        found = jobs.length;

        for (const jobData of jobs) {
          try {
            const existing = await Job.findOne({ deduplicationHash: jobData.deduplicationHash });
            if (!existing) {
              await Job.create(jobData);
              added++;
            } else {
              // Update status or update details if needed
              await Job.updateOne({ _id: existing._id }, { $set: { isActive: true } });
            }
          } catch (writeErr) {
            // If duplicate race condition, skip
            if (writeErr.code !== 11000) {
              logger.warn(`Error storing job: ${writeErr.message}`);
            }
          }
        }

        totalNewJobs += added;
      } catch (err) {
        status = 'FAILED';
        errorMsg = err.message;
        logger.error(`Adapter ${adapter.name} error:`, err);
      }

      const durationMs = Date.now() - startTime;

      // Log sync to database
      try {
        await SyncLog.create({
          source: adapter.name,
          status,
          jobsFound: found,
          jobsAdded: added,
          error: errorMsg,
          durationMs,
        });
      } catch (logErr) {
        logger.warn('Failed to save sync log:', logErr.message);
      }

      results[adapter.name] = {
        status,
        jobsFound: found,
        jobsAdded: added,
        durationMs,
        error: errorMsg,
      };
    }

    // If new jobs were added, notify users who have active profiles
    if (totalNewJobs > 0) {
      try {
        await this.notifyUsersOfNewJobs(totalNewJobs);
      } catch (e) {
        logger.warn('Failed to notify users:', e.message);
      }
    }

    logger.info(`Job synchronization complete. Total new jobs added: ${totalNewJobs}`);
    return {
      totalNewJobs,
      results,
      syncedAt: new Date().toISOString(),
    };
  }

  /**
   * Sync a single specific source
   */
  static async syncSource(sourceName) {
    logger.info(`Syncing single source: ${sourceName}`);
    let jobs = [];

    if (sourceName.toLowerCase() === 'remotive') {
      jobs = await RemotiveAdapter.fetchJobs();
    } else if (sourceName.toLowerCase() === 'greenhouse') {
      jobs = await GreenhouseAdapter.fetchJobs();
    } else if (sourceName.toLowerCase() === 'lever') {
      jobs = await LeverAdapter.fetchJobs();
    } else if (sourceName.toLowerCase() === 'arbeitnow') {
      jobs = await ArbeitnowAdapter.fetchJobs();
    } else {
      throw new Error(`Unknown source: ${sourceName}`);
    }

    let added = 0;
    for (const jobData of jobs) {
      try {
        const existing = await Job.findOne({ deduplicationHash: jobData.deduplicationHash });
        if (!existing) {
          await Job.create(jobData);
          added++;
        }
      } catch (e) {
        // Skip duplicates
      }
    }

    await SyncLog.create({
      source: sourceName,
      status: 'SUCCESS',
      jobsFound: jobs.length,
      jobsAdded: added,
      durationMs: 0,
    });

    return { source: sourceName, jobsFound: jobs.length, jobsAdded: added };
  }

  static async notifyUsersOfNewJobs(count) {
    try {
      const users = await User.find({}).limit(50);
      for (const user of users) {
        await Notification.create({
          userId: user._id,
          type: NOTIFICATION_TYPES.MATCHING_JOB,
          title: 'Fresh Jobs Discovered',
          message: `${count} new job postings were discovered and added to JobPilot. Check your recommended feed!`,
          link: '/jobs?tab=recommended',
        });
      }
    } catch (err) {
      logger.warn('Error creating user sync notifications:', err.message);
    }
  }

  /**
   * Get health and status of all job ingestion adapters
   */
  static async getStatus() {
    const totalJobs = await Job.countDocuments({ isActive: true });
    const sourceBreakdown = await Job.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$source', count: { $sum: 1 } } },
    ]);

    const latestLogs = await SyncLog.find().sort({ createdAt: -1 }).limit(10);

    return {
      totalActiveJobs: totalJobs,
      sources: sourceBreakdown.map((s) => ({ source: s._id, count: s.count })),
      recentSyncs: latestLogs,
    };
  }
}
