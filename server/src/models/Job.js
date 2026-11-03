import mongoose from 'mongoose';
import { WORK_MODES, EMPLOYMENT_TYPES, EXPERIENCE_LEVELS } from '../config/constants.js';

const JobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      index: true,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      index: true,
    },
    location: {
      type: String,
      default: 'Remote',
      trim: true,
    },
    country: {
      type: String,
      default: 'Worldwide',
      trim: true,
      index: true,
    },
    city: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    descriptionSnippet: {
      type: String,
      default: '',
    },
    skills: [
      {
        type: String,
        trim: true,
        index: true,
      },
    ],
    experienceLevel: {
      type: String,
      enum: [...EXPERIENCE_LEVELS, 'all', 'unspecified'],
      default: 'unspecified',
      index: true,
    },
    experienceYears: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
    },
    salary: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
      currency: { type: String, default: 'USD' },
      period: { type: String, default: 'yearly' },
      raw: { type: String, default: '' },
      hasSalary: { type: Boolean, default: false },
    },
    employmentType: {
      type: String,
      enum: [...EMPLOYMENT_TYPES, 'other', 'unspecified'],
      default: 'full-time',
      index: true,
    },
    workMode: {
      type: String,
      enum: WORK_MODES,
      default: 'remote',
      index: true,
    },
    postedDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    source: {
      type: String,
      required: true,
      index: true,
    },
    sourceId: {
      type: String,
      default: '',
    },
    originalUrl: {
      type: String,
      required: true,
    },
    applyUrl: {
      type: String,
      default: '',
    },
    companyLogo: {
      type: String,
      default: '',
    },
    deduplicationHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    tags: [{ type: String, trim: true }],
  },
  {
    timestamps: true,
  }
);

// Full-text search index for keyword queries
JobSchema.index(
  {
    title: 'text',
    company: 'text',
    description: 'text',
    skills: 'text',
  },
  {
    weights: {
      title: 10,
      skills: 8,
      company: 5,
      description: 2,
    },
    name: 'job_text_index',
  }
);

export const Job = mongoose.model('Job', JobSchema);
