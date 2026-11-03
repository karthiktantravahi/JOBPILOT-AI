export const APPLICATION_STATUSES = [
  'SAVED',
  'APPLIED',
  'ASSESSMENT',
  'INTERVIEW',
  'OFFER',
  'REJECTED',
  'WITHDRAWN',
];

export const WORK_MODES = ['remote', 'hybrid', 'onsite'];

export const EMPLOYMENT_TYPES = [
  'full-time',
  'part-time',
  'contract',
  'internship',
  'freelance',
];

export const EXPERIENCE_LEVELS = [
  'entry',
  'mid',
  'senior',
  'lead',
  'director',
  'executive',
];

export const JOB_SOURCES = {
  REMOTIVE: 'Remotive',
  GREENHOUSE: 'Greenhouse',
  LEVER: 'Lever',
  ARBEITNOW: 'Arbeitnow',
  JOBICY: 'Jobicy',
  MANUAL: 'Manual',
};

export const DEFAULT_MATCH_WEIGHTS = {
  skills: 0.35,
  experience: 0.20,
  title: 0.15,
  education: 0.10,
  location: 0.10,
  employmentType: 0.05,
  salary: 0.05,
};

export const NOTIFICATION_TYPES = {
  MATCHING_JOB: 'MATCHING_JOB',
  SYNC_COMPLETED: 'SYNC_COMPLETED',
  INTERVIEW_REMINDER: 'INTERVIEW_REMINDER',
  APPLICATION_UPDATE: 'APPLICATION_UPDATE',
  SYSTEM: 'SYSTEM',
};
