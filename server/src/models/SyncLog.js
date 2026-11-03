import mongoose from 'mongoose';

const SyncLogSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED', 'PARTIAL'],
      required: true,
      index: true,
    },
    jobsFound: {
      type: Number,
      default: 0,
    },
    jobsAdded: {
      type: Number,
      default: 0,
    },
    jobsUpdated: {
      type: Number,
      default: 0,
    },
    error: {
      type: String,
      default: null,
    },
    durationMs: {
      type: Number,
      default: 0,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const SyncLog = mongoose.model('SyncLog', SyncLogSchema);
