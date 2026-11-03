import mongoose from 'mongoose';
import { APPLICATION_STATUSES } from '../config/constants.js';

const NoteSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
});

const ContactSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  role: { type: String, trim: true },
  email: { type: String, trim: true },
  phone: { type: String, trim: true },
});

const TimelineEventSchema = new mongoose.Schema({
  status: { type: String, enum: APPLICATION_STATUSES, required: true },
  changedAt: { type: Date, default: Date.now },
  note: { type: String, default: '' },
});

const ApplicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      default: null,
      index: true,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    jobTitle: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
    },
    location: {
      type: String,
      default: 'Remote',
    },
    workMode: {
      type: String,
      default: 'remote',
    },
    salary: {
      type: String,
      default: '',
    },
    originalUrl: {
      type: String,
      default: '',
    },
    source: {
      type: String,
      default: 'JobPilot',
    },
    status: {
      type: String,
      enum: APPLICATION_STATUSES,
      default: 'SAVED',
      index: true,
    },
    appliedDate: {
      type: Date,
      default: null,
    },
    interviewDate: {
      type: Date,
      default: null,
    },
    offerDetails: {
      salary: { type: String, default: '' },
      deadline: { type: Date, default: null },
      notes: { type: String, default: '' },
    },
    notes: [NoteSchema],
    contacts: [ContactSchema],
    matchScore: {
      type: Number,
      default: null,
    },
    matchBreakdown: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    timeline: [TimelineEventSchema],
    isFavorite: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index so a user cannot duplicate track the same job
ApplicationSchema.index({ userId: 1, jobId: 1 }, { unique: true, sparse: true });

export const Application = mongoose.model('Application', ApplicationSchema);
