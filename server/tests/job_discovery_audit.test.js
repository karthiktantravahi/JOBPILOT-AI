import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { RemotiveAdapter } from '../src/services/adapters/remotiveAdapter.js';
import { GreenhouseAdapter } from '../src/services/adapters/greenhouseAdapter.js';
import { LeverAdapter } from '../src/services/adapters/leverAdapter.js';
import { ArbeitnowAdapter } from '../src/services/adapters/arbeitnowAdapter.js';
import { Job } from '../src/models/Job.js';
import { SyncLog } from '../src/models/SyncLog.js';
import { User } from '../src/models/User.js';

let authToken = '';

beforeAll(async () => {
  await connectDB();
  const testUser = await User.create({
    name: 'Sync Auditor',
    email: `sync.audit.${Date.now()}@jobpilot.test`,
    password: 'Password123!',
  });
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: testUser.email, password: 'Password123!' });
  authToken = loginRes.body.token;
});

afterAll(async () => {
  await disconnectDB();
});

describe('Phase 6: Public Job Discovery Adapters & Normalization Audit', () => {
  it('1. RemotiveAdapter: normalizes raw public API payload with all required fields', () => {
    const rawRemotive = {
      id: 999123,
      title: 'Senior React / TypeScript Developer',
      company_name: 'Stripe Partner Labs',
      candidate_required_location: 'Remote, US',
      description: '<p>Building payments UI with React and TypeScript.</p>',
      salary: '$150,000 - $190,000 / year',
      job_type: 'full_time',
      publication_date: '2026-11-01T12:00:00Z',
      url: 'https://remotive.com/remote-jobs/software-dev/senior-react-dev-999123',
      tags: ['react', 'typescript'],
    };

    const norm = RemotiveAdapter.normalize(rawRemotive);

    expect(norm).not.toBeNull();
    expect(norm.title).toBe(rawRemotive.title);
    expect(norm.company).toBe(rawRemotive.company_name);
    expect(norm.location).toContain('Remote');
    expect(norm.workMode).toBe('remote');
    expect(norm.source).toBe('Remotive');
    expect(norm.originalUrl).toBe(rawRemotive.url);
    expect(norm.deduplicationHash).toBeDefined();
    expect(norm.salary.hasSalary).toBe(true);
    expect(norm.salary.min).toBe(150000);
    expect(norm.salary.max).toBe(190000);
  });

  it('2. GreenhouseAdapter: normalizes public board posting with all required fields', () => {
    const rawGreenhouse = {
      id: 888456,
      title: 'Staff Infrastructure Engineer',
      location: { name: 'Remote, Worldwide' },
      content: 'Scaling global Kubernetes clusters and Terraform infrastructure.',
      updated_at: '2026-11-02T10:00:00Z',
      absolute_url: 'https://boards.greenhouse.io/cloudflare/jobs/888456',
    };

    const norm = GreenhouseAdapter.normalize(rawGreenhouse, 'cloudflare');

    expect(norm).not.toBeNull();
    expect(norm.title).toBe(rawGreenhouse.title);
    expect(norm.company).toBe('Cloudflare');
    expect(norm.source).toBe('Greenhouse');
    expect(norm.originalUrl).toBe(rawGreenhouse.absolute_url);
    expect(norm.workMode).toBe('remote');
    expect(norm.deduplicationHash).toBeDefined();
  });

  it('3. LeverAdapter: normalizes public posting with all required fields', () => {
    const rawLever = {
      id: 'lever-777123',
      text: 'Senior Full Stack Developer',
      categories: { location: 'Remote, EMEA', commitment: 'Full-time', team: 'Engineering' },
      descriptionPlain: 'Working with Node.js and React.',
      hostedUrl: 'https://jobs.lever.co/kinsta/lever-777123',
      createdAt: 1730000000000,
    };

    const norm = LeverAdapter.normalize(rawLever, 'kinsta');

    expect(norm).not.toBeNull();
    expect(norm.title).toBe(rawLever.text);
    expect(norm.company).toBe('Kinsta');
    expect(norm.source).toBe('Lever');
    expect(norm.originalUrl).toBe(rawLever.hostedUrl);
    expect(norm.employmentType).toBe('full-time');
    expect(norm.workMode).toBe('remote');
    expect(norm.deduplicationHash).toBeDefined();
  });

  it('4. ArbeitnowAdapter: normalizes tech board posting with employment type classification', () => {
    const rawArbeitnow = {
      slug: 'fullstack-dev-123',
      title: 'Senior Python Engineer',
      company_name: 'Fintech Europe',
      location: 'Berlin / Remote',
      remote: true,
      description: 'Developing high-throughput microservices in Python and Django.',
      url: 'https://www.arbeitnow.com/view/fullstack-dev-123',
      job_types: ['Unbefristeter arbeitsvertrag'],
      created_at: 1730000000,
      tags: ['python', 'django'],
    };

    const norm = ArbeitnowAdapter.normalize(rawArbeitnow);

    expect(norm).not.toBeNull();
    expect(norm.title).toBe(rawArbeitnow.title);
    expect(norm.company).toBe(rawArbeitnow.company_name);
    expect(norm.source).toBe('Arbeitnow');
    expect(norm.employmentType).toBe('full-time'); // Normalized from German
    expect(norm.workMode).toBe('remote');
    expect(norm.deduplicationHash).toBeDefined();
  });

  it('5. Deduplication: prevents storing duplicate job postings in database', async () => {
    const testHash = `dedupe-test-hash-${Date.now()}`;
    const testJob = {
      title: 'Dedupe Test Role',
      company: 'Test Company',
      location: 'Remote',
      description: 'Test description',
      source: 'Remotive',
      originalUrl: 'https://example.com/dedupe-test-role',
      deduplicationHash: testHash,
      isActive: true,
    };

    // First insert succeeds
    const job1 = await Job.create(testJob);
    expect(job1._id).toBeDefined();

    // Second insert with exact same hash is rejected by unique index constraint
    let duplicateRejected = false;
    try {
      await Job.create(testJob);
    } catch (err) {
      duplicateRejected = err.code === 11000;
    }
    expect(duplicateRejected).toBe(true);

    // Clean up test job
    await Job.deleteOne({ _id: job1._id });
  });

  it('6. Ingestion Status API: returns adapter status and recent sync logs', async () => {
    const res = await request(app).get('/api/sync/status');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalActiveJobs).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(res.body.data.sources)).toBe(true);
  });
});
