import { z } from 'zod';
import { WORK_MODES, EMPLOYMENT_TYPES, APPLICATION_STATUSES } from '../config/constants.js';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  headline: z.string().max(150).optional(),
  bio: z.string().max(1000).optional(),
  phone: z.string().max(30).optional(),
  location: z
    .object({
      city: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
  education: z
    .array(
      z.object({
        degree: z.string().optional(),
        field: z.string().optional(),
        institution: z.string().optional(),
        graduationYear: z.number().int().optional(),
        gpa: z.string().optional(),
      })
    )
    .optional(),
  experience: z
    .array(
      z.object({
        title: z.string().optional(),
        company: z.string().optional(),
        location: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        current: z.boolean().optional(),
        description: z.string().optional(),
      })
    )
    .optional(),
  projects: z
    .array(
      z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        technologies: z.array(z.string()).optional(),
        url: z.string().optional(),
      })
    )
    .optional(),
  certifications: z
    .array(
      z.object({
        name: z.string().optional(),
        issuer: z.string().optional(),
        issueDate: z.string().optional(),
        url: z.string().optional(),
      })
    )
    .optional(),
  skills: z.array(z.string()).optional(),
  preferredJobTitles: z.array(z.string()).optional(),
  preferredCountries: z.array(z.string()).optional(),
  preferredCities: z.array(z.string()).optional(),
  preferredWorkModes: z.array(z.enum(WORK_MODES)).optional(),
  preferredEmploymentTypes: z.array(z.enum(EMPLOYMENT_TYPES)).optional(),
  expectedSalary: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
      currency: z.string().optional(),
      period: z.string().optional(),
    })
    .optional(),
  noticePeriod: z.string().optional(),
  visaSponsorshipRequired: z.boolean().optional(),
  matchSettings: z
    .object({
      weights: z
        .object({
          skills: z.number().min(0).max(1).optional(),
          experience: z.number().min(0).max(1).optional(),
          title: z.number().min(0).max(1).optional(),
          education: z.number().min(0).max(1).optional(),
          location: z.number().min(0).max(1).optional(),
          employmentType: z.number().min(0).max(1).optional(),
          salary: z.number().min(0).max(1).optional(),
        })
        .optional(),
      minScore: z.number().min(0).max(100).optional(),
      enableAI: z.boolean().optional(),
    })
    .optional(),
});

export const createApplicationSchema = z.object({
  jobId: z.string().optional(),
  company: z.string().min(1, 'Company is required'),
  jobTitle: z.string().min(1, 'Job title is required'),
  location: z.string().optional(),
  workMode: z.string().optional(),
  salary: z.string().optional(),
  originalUrl: z.string().optional(),
  source: z.string().optional(),
  status: z.enum(APPLICATION_STATUSES).optional(),
  appliedDate: z.string().datetime().nullable().optional(),
  interviewDate: z.string().datetime().nullable().optional(),
  notes: z.string().optional(),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(APPLICATION_STATUSES),
  note: z.string().optional(),
});
