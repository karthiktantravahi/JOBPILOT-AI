import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { MatchingService } from '../src/services/matchingService.js';
import { ResumeParserService } from '../src/services/resumeParserService.js';

let authToken = '';
let userId = '';
let testJobId = '';

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await disconnectDB();
});

describe('JobPilot AI - Core Backend & Services Test Suite', () => {
  it('GET /api/health should return 200 and healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  describe('Authentication Flow', () => {
    const testUser = {
      name: 'Alex Johnson',
      email: `alex.test.${Date.now()}@jobpilot.test`,
      password: 'StrongPassword123!',
    };

    it('POST /api/auth/register should create a user and return JWT', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe(testUser.email);

      authToken = res.body.token;
      userId = res.body.user._id;
    });

    it('POST /api/auth/register should reject duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/auth/login should authenticate user and issue token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    it('GET /api/auth/me should return authenticated user profile', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe(testUser.email);
    });
  });

  describe('Resume Intelligence & Extraction', () => {
    it('ResumeParserService.parseText extracts structured fields accurately', () => {
      const sampleResumeText = `
        Alex Johnson
        alex.johnson@example.com | (555) 123-4567 | linkedin.com/in/alexjohnson | github.com/alexj

        PROFESSIONAL SUMMARY
        Experienced Senior Full Stack Engineer with 6 years building web platforms in React, Node.js, and TypeScript.

        EXPERIENCE
        Senior Software Engineer at Stripe
        Jan 2021 – Present
        Architected payment gateway microservices using Node.js, Express, MongoDB, and Redis.

        Software Engineer at CloudTech
        Jun 2018 – Dec 2020
        Developed responsive user interfaces with React, Next.js, and Tailwind CSS.

        EDUCATION
        Bachelor of Science in Computer Science, University of California, Berkeley (2018)

        SKILLS
        JavaScript, TypeScript, React, Node.js, Express, MongoDB, PostgreSQL, Docker, AWS, Git
      `;

      const result = ResumeParserService.parseText(sampleResumeText);

      expect(result.name).toContain('Alex Johnson');
      expect(result.email).toBe('alex.johnson@example.com');
      expect(result.phone).toBe('(555) 123-4567');
      expect(result.links.linkedin).toContain('linkedin.com/in/alexjohnson');
      expect(result.skills).toContain('React');
      expect(result.skills).toContain('Node.js');
      expect(result.skills).toContain('TypeScript');
      expect(result.skills).toContain('MongoDB');
      expect(result.education.length).toBeGreaterThan(0);
      expect(result.education[0].degree).toBe("Bachelor's Degree");
    });
  });

  describe('Explainable AI Matching Algorithm', () => {
    it('MatchingService calculates weighted explainable score', () => {
      const userProfile = {
        skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'Docker'],
        preferredJobTitles: ['Full Stack Engineer', 'Software Engineer'],
        preferredWorkModes: ['remote'],
        preferredEmploymentTypes: ['full-time'],
        education: [{ degree: "Bachelor's Degree" }],
        experience: [{ title: 'Full Stack Engineer', company: 'Tech Inc' }],
      };

      const job = {
        title: 'Senior Full Stack Engineer (React & Node.js)',
        company: 'Cloudflare',
        skills: ['React', 'Node.js', 'TypeScript', 'Docker', 'AWS'],
        experienceLevel: 'mid',
        workMode: 'remote',
        employmentType: 'full-time',
        salary: { hasSalary: true, min: 140000, max: 180000 },
      };

      const match = MatchingService.calculateMatch(userProfile, job);

      expect(match.matchPercentage).toBeGreaterThanOrEqual(70);
      expect(match.matchedSkills).toContain('react');
      expect(match.matchedSkills).toContain('node.js');
      expect(match.reasons.length).toBeGreaterThan(0);
      expect(match.scoreBreakdown.skills).toBeGreaterThan(0);
    });
  });

  describe('Job Search & Filtering API', () => {
    it('GET /api/jobs returns active job listings with pagination', async () => {
      const res = await request(app).get('/api/jobs?limit=5');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);

      if (res.body.data.length > 0) {
        testJobId = res.body.data[0]._id;
      }
    });
  });

  describe('Application Tracker (Kanban / List)', () => {
    let appId = '';

    it('POST /api/applications adds an application to user tracker', async () => {
      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          company: 'Acme Technologies',
          jobTitle: 'Senior Frontend Engineer',
          location: 'Remote',
          workMode: 'remote',
          status: 'SAVED',
          notes: 'Discovered through JobPilot feed',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('SAVED');
      appId = res.body.data._id;
    });

    it('PATCH /api/applications/:id/status transitions status to INTERVIEW and records timeline', async () => {
      const res = await request(app)
        .patch(`/api/applications/${appId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'INTERVIEW',
          note: 'Scheduled technical interview round 1',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('INTERVIEW');
      expect(res.body.data.timeline.length).toBeGreaterThanOrEqual(2);
    });

    it('GET /api/applications returns user tracked applications', async () => {
      const res = await request(app)
        .get('/api/applications')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.some((a) => a._id === appId)).toBe(true);
    });
  });

  describe('Real Analytics Dashboard', () => {
    it('GET /api/analytics returns database-derived metrics', async () => {
      const res = await request(app)
        .get('/api/analytics')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalTracked).toBeGreaterThanOrEqual(1);
      expect(res.body.data.counts.INTERVIEW).toBeGreaterThanOrEqual(1);
      expect(Array.isArray(res.body.data.weeklyActivity)).toBe(true);
    });
  });
});
