import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { DEFAULT_MATCH_WEIGHTS, WORK_MODES, EMPLOYMENT_TYPES } from '../config/constants.js';

const EducationSchema = new mongoose.Schema({
  degree: { type: String, trim: true },
  field: { type: String, trim: true },
  institution: { type: String, trim: true },
  graduationYear: { type: Number },
  gpa: { type: String, trim: true },
});

const ExperienceSchema = new mongoose.Schema({
  title: { type: String, trim: true },
  company: { type: String, trim: true },
  location: { type: String, trim: true },
  startDate: { type: String },
  endDate: { type: String },
  current: { type: Boolean, default: false },
  description: { type: String, trim: true },
});

const ProjectSchema = new mongoose.Schema({
  title: { type: String, trim: true },
  description: { type: String, trim: true },
  technologies: [{ type: String, trim: true }],
  url: { type: String, trim: true },
});

const CertificationSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  issuer: { type: String, trim: true },
  issueDate: { type: String },
  url: { type: String, trim: true },
});

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    profile: {
      headline: { type: String, default: '' },
      bio: { type: String, default: '' },
      phone: { type: String, default: '' },
      location: {
        city: { type: String, default: '' },
        country: { type: String, default: '' },
      },
      education: [EducationSchema],
      experience: [ExperienceSchema],
      projects: [ProjectSchema],
      certifications: [CertificationSchema],
      skills: [{ type: String, trim: true }],
      preferredJobTitles: [{ type: String, trim: true }],
      preferredCountries: [{ type: String, trim: true }],
      preferredCities: [{ type: String, trim: true }],
      preferredWorkModes: [{
        type: String,
        enum: WORK_MODES,
      }],
      preferredEmploymentTypes: [{
        type: String,
        enum: EMPLOYMENT_TYPES,
      }],
      expectedSalary: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 0 },
        currency: { type: String, default: 'USD' },
        period: { type: String, default: 'yearly' },
      },
      noticePeriod: { type: String, default: 'Immediate' },
      visaSponsorshipRequired: { type: Boolean, default: false },
      resume: {
        originalName: { type: String },
        path: { type: String },
        mimeType: { type: String },
        uploadedAt: { type: Date },
        parsedText: { type: String },
        parsedEntities: { type: mongoose.Schema.Types.Mixed },
      },
      matchSettings: {
        weights: {
          skills: { type: Number, default: DEFAULT_MATCH_WEIGHTS.skills },
          experience: { type: Number, default: DEFAULT_MATCH_WEIGHTS.experience },
          title: { type: Number, default: DEFAULT_MATCH_WEIGHTS.title },
          education: { type: Number, default: DEFAULT_MATCH_WEIGHTS.education },
          location: { type: Number, default: DEFAULT_MATCH_WEIGHTS.location },
          employmentType: { type: Number, default: DEFAULT_MATCH_WEIGHTS.employmentType },
          salary: { type: Number, default: DEFAULT_MATCH_WEIGHTS.salary },
        },
        minScore: { type: Number, default: 40 },
        enableAI: { type: Boolean, default: true },
      },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Omit password from output
UserSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

export const User = mongoose.model('User', UserSchema);
