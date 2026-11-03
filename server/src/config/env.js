import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  MONGODB_URI: process.env.MONGODB_URI || '',
  JWT_SECRET: process.env.JWT_SECRET || 'jobpilot_fallback_dev_secret_key_987654321',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB || '5', 10),
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
  JOB_SYNC_CRON: process.env.JOB_SYNC_CRON || '0 */6 * * *',
  ENABLE_CRON_SYNC: process.env.ENABLE_CRON_SYNC !== 'false',
  MAX_JOBS_PER_SOURCE: parseInt(process.env.MAX_JOBS_PER_SOURCE || '50', 10),
};
