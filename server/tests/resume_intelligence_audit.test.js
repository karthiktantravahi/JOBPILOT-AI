import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { ResumeParserService } from '../src/services/resumeParserService.js';
import { User } from '../src/models/User.js';

let authToken = '';
let testUserId = '';

beforeAll(async () => {
  await connectDB();

  // Create dedicated test user
  const user = await User.create({
    name: 'Original Name Before Resume',
    email: `resume.audit.${Date.now()}@jobpilot.test`,
    password: 'Password123!',
    profile: {
      headline: 'Original Headline',
      skills: ['Legacy Skill A'],
      education: [],
      experience: [],
    },
  });
  testUserId = user._id;

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: user.email, password: 'Password123!' });
  authToken = loginRes.body.token;
});

afterAll(async () => {
  await disconnectDB();
});

describe('Phase 5: Resume Intelligence & Edge-Case PDF Handling Audit', () => {
  // Valid standard 1-page PDF encoded in base64
  const minimalValidPdf = Buffer.from(
    'JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwKL0xlbmd0aCA0OQo+PgpzdHJlYW0KQlQKL0YxIDEyIFRmCjcyIDcxMiBUZAooSmFuZSBEb2UgamFuZUBleGFtcGxlLmNvbSkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iago0IDAgb2JqCjw8Ci9UeXBlIC9QYWdlCi9QYXJlbnQgMSAwIFIKL1Jlc291cmNlcyA8PAovRm9udCA8PAovRjEgPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCj4+Cj4+Cj4+Ci9NZWRpYUJveCBbMCAwIDYxMiA3OTJdCi9Db250ZW50cyAyIDAgUgo+PgplbmRvYmoKMSAwIG9iago8PAovVHlwZSAvUGFnZXMKL0tpZHMgWzQgMCBSXQovQ291bnQgMQo+PgplbmRvYmoKMyAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMSAwIFIKPj4KZW5kb2JqCnhyZWYKMCA1CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDE3MyAwMDAwMCBuIAowMDAwMDAwMDE1IDAwMDAwIG4gCjAwMDAwMDAyOTUgMDAwMDAgbiAKMDAwMDAwMDA2OSAwMDAwMCBuIAp0cmFpbGVyCjw8Ci9TaXplIDUKL1Jvb3QgMyAwIFIKPj4Kc3RhcnR4cmVmCjM0NwolJUVPRgo=',
    'base64'
  );

  it('1. Valid PDF upload: extracts preview without overwriting user profile', async () => {
    const res = await request(app)
      .post('/api/resume/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('resume', minimalValidPdf, 'sample_resume.pdf');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.extractedData).toBeDefined();

    // Verify user profile in DB was NOT automatically overwritten
    const userInDb = await User.findById(testUserId);
    expect(userInDb.name).toBe('Original Name Before Resume');
    expect(userInDb.profile.skills).toContain('Legacy Skill A');
  });

  it('2. Review-before-save consent: profile updates only upon explicit confirm', async () => {
    const confirmedPayload = {
      name: 'Jane Verified Doe',
      phone: '+1 (555) 987-6543',
      headline: 'Principal Cloud Architect',
      skills: ['TypeScript', 'Kubernetes', 'Go', 'AWS'],
      education: [
        {
          degree: "Master's Degree",
          field: 'Distributed Systems',
          institution: 'Stanford University',
          graduationYear: 2021,
        },
      ],
      experience: [
        {
          title: 'Principal Engineer',
          company: 'Cloudflare',
          startDate: '2021',
          endDate: 'Present',
          description: 'Architecting edge network platforms.',
        },
      ],
    };

    const res = await request(app)
      .post('/api/resume/confirm')
      .set('Authorization', `Bearer ${authToken}`)
      .send(confirmedPayload);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify user profile now reflects confirmed changes
    const updatedUser = await User.findById(testUserId);
    expect(updatedUser.name).toBe('Jane Verified Doe');
    expect(updatedUser.profile.skills).toContain('Kubernetes');
    expect(updatedUser.profile.education[0].institution).toBe('Stanford University');
  });

  it('3. Corrupted PDF: gracefully rejects corrupted PDF stream with 400 Bad Request', async () => {
    const corruptBuffer = Buffer.from('NOT A REAL PDF FILE HEADER 1234567890 CORRUPT DATA');
    const res = await request(app)
      .post('/api/resume/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('resume', corruptBuffer, 'corrupted.pdf');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Failed to parse PDF document');
  });

  it('4. Non-PDF file renamed to .pdf: gracefully handles parsing error with 400 Bad Request', async () => {
    const textBuffer = Buffer.from('This is a text file that was maliciously renamed to resume.pdf');
    const res = await request(app)
      .post('/api/resume/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('resume', textBuffer, 'fake.pdf');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('5. Oversized File: rejects files exceeding 5MB limit', async () => {
    // 6MB buffer
    const largeBuffer = Buffer.alloc(6 * 1024 * 1024);
    const res = await request(app)
      .post('/api/resume/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('resume', largeBuffer, 'huge.pdf');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('exceeds maximum allowed limit');
  });

  it('6. Comprehensive NLP text extraction accuracy across all required entity categories', () => {
    const complexResumeText = `
      David Kim
      david.kim@techcorp.io | +1 (415) 555-0199 | linkedin.com/in/davidkim-dev | github.com/davidkim
      
      PROFESSIONAL SUMMARY
      Staff Software Engineer with 8+ years building high-concurrency microservices, AI pipelines, and distributed databases.
      
      WORK EXPERIENCE
      Staff Software Engineer at Stripe
      Feb 2021 – Present
      Led core API platform processing billions in volume using Go, Node.js, and Redis.
      
      Senior Backend Developer at Datadog
      Aug 2017 – Jan 2021
      Developed distributed tracing collectors with Python, Docker, and Kubernetes.
      
      EDUCATION
      Master of Science in Computer Science, Carnegie Mellon University (2017)
      Bachelor of Science in Electrical Engineering, UC Berkeley (2015)
      
      PERSONAL PROJECTS
      Distributed Vector Search Engine
      Built an open-source HNSW vector database in Rust and C++ with SIMD optimizations.
      
      CERTIFICATIONS
      AWS Certified Solutions Architect
      Google Cloud Certified Professional Cloud Architect
      CKA Certified Kubernetes Administrator
      
      TECHNICAL SKILLS
      Python, Go, JavaScript, TypeScript, React, Node.js, Docker, Kubernetes, AWS, GCP, Redis, PostgreSQL, MongoDB, PyTorch, LLM
    `;

    const parsed = ResumeParserService.parseText(complexResumeText, 'david_kim_resume.pdf');

    expect(parsed.name).toContain('David Kim');
    expect(parsed.email).toBe('david.kim@techcorp.io');
    expect(parsed.phone).toBe('+1 (415) 555-0199');
    expect(parsed.links.linkedin).toContain('linkedin.com/in/davidkim-dev');
    expect(parsed.links.github).toContain('github.com/davidkim');

    // Education
    expect(parsed.education.length).toBeGreaterThanOrEqual(1);
    expect(parsed.education.some((e) => e.degree.includes("Master's") || e.degree.includes("Bachelor's"))).toBe(true);

    // Experience
    expect(parsed.experience.length).toBeGreaterThanOrEqual(1);
    expect(parsed.experience.some((e) => e.company.toLowerCase().includes('stripe') || e.title.includes('Engineer'))).toBe(true);

    // Skills
    expect(parsed.skills).toContain('Python');
    expect(parsed.skills).toContain('Go');
    expect(parsed.skills).toContain('Kubernetes');
    expect(parsed.skills).toContain('Docker');
    expect(parsed.skills).toContain('PostgreSQL');

    // Certifications
    expect(parsed.certifications.length).toBeGreaterThanOrEqual(2);
    expect(parsed.certifications.some((c) => c.name.includes('AWS Certified'))).toBe(true);
  });
});
