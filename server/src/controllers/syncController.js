import { JobIngestionService } from '../services/jobIngestionService.js';
import { logger } from '../utils/logger.js';

export const triggerManualSync = async (req, res, next) => {
  try {
    const { source } = req.body;
    logger.info(`Manual sync requested ${source ? `for ${source}` : 'for all sources'} by user ${req.user?._id}`);

    let result;
    if (source && source !== 'all') {
      result = await JobIngestionService.syncSource(source);
    } else {
      result = await JobIngestionService.syncAllSources();
    }

    res.json({
      success: true,
      message: 'Job synchronization completed successfully.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getSyncStatus = async (req, res, next) => {
  try {
    const status = await JobIngestionService.getStatus();
    res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    next(error);
  }
};
