import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Application } from '../src/models/Application.js';
import { Notification } from '../src/models/Notification.js';

let authToken = '';
let userId = '';
const createdAppIds = [];

beforeAll(async () => {
  await connectDB();
  try {
    await Application.syncIndexes();
  } catch (e) {
    // ignore if first time
  }
  const user = await User.create({
    name: 'Tracker Auditor',
    email: `tracker.audit.${Date.now()}@jobpilot.test`,
    password: 'Password123!',
  });
  userId = user._id;

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: user.email, password: 'Password123!' });
  authToken = loginRes.body.token;
});

afterAll(async () => {
  await disconnectDB();
});

describe('Phase 8: Application Tracker & Pipeline Stages Audit', () => {
  const STAGES = [
    'SAVED',
    'APPLIED',
    'ASSESSMENT',
    'INTERVIEW',
    'OFFER',
    'REJECTED',
    'WITHDRAWN',
  ];

  it('1. Pipeline Coverage: can create applications across all 7 stages', async () => {
    for (const stage of STAGES) {
      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          company: `${stage} Corp`,
          jobTitle: `${stage} Specialist Engineer`,
          location: 'Remote',
          status: stage,
          salary: '$130,000 / yr',
          notes: `Initial note for ${stage} stage`,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe(stage);
      createdAppIds.push(res.body.data._id);
    }
    expect(createdAppIds.length).toBe(7);
  });

  it('2. Status Transitions & Audit Timeline: moves through lifecycle recording timeline events', async () => {
    const testAppId = createdAppIds[0]; // Currently SAVED

    // Move SAVED -> APPLIED
    let res = await request(app)
      .patch(`/api/applications/${testAppId}/status`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'APPLIED', note: 'Sent application via job board' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('APPLIED');
    expect(res.body.data.appliedDate).toBeDefined();

    // Move APPLIED -> ASSESSMENT
    res = await request(app)
      .patch(`/api/applications/${testAppId}/status`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'ASSESSMENT', note: 'Take-home assignment received' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ASSESSMENT');

    // Move ASSESSMENT -> INTERVIEW
    res = await request(app)
      .patch(`/api/applications/${testAppId}/status`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'INTERVIEW', note: 'Technical screen scheduled' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('INTERVIEW');

    // Verify interview reminder notification was created
    const notifs = await Notification.find({ userId, type: 'INTERVIEW_REMINDER' });
    expect(notifs.length).toBeGreaterThanOrEqual(1);

    // Move INTERVIEW -> OFFER
    res = await request(app)
      .patch(`/api/applications/${testAppId}/status`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'OFFER', note: 'Formal written offer received!' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('OFFER');

    // Verify complete audit timeline history
    expect(res.body.data.timeline.length).toBeGreaterThanOrEqual(5);
  });

  it('3. Edit Application: updates company, role, salary, and dates', async () => {
    const testAppId = createdAppIds[1];
    const interviewDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

    const res = await request(app)
      .put(`/api/applications/${testAppId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        company: 'Stripe Updated Corp',
        jobTitle: 'Senior Staff Engineer',
        salary: '$185,000 / yr',
        interviewDate,
        isFavorite: true,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.company).toBe('Stripe Updated Corp');
    expect(res.body.data.salary).toBe('$185,000 / yr');
    expect(res.body.data.isFavorite).toBe(true);
  });

  it('4. Add Notes: records timestamped notes on the application', async () => {
    const testAppId = createdAppIds[1];
    const res = await request(app)
      .post(`/api/applications/${testAppId}/notes`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ text: 'Met with hiring manager; talked about GraphQL architecture.' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.notes.length).toBeGreaterThanOrEqual(1);
    expect(res.body.notes[res.body.notes.length - 1].text).toContain('GraphQL architecture');
  });

  it('5. Filter by Status: retrieves applications filtered by stage', async () => {
    const res = await request(app)
      .get('/api/applications?status=OFFER')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.every((a) => a.status === 'OFFER')).toBe(true);
  });

  it('6. Delete Application: removes record cleanly', async () => {
    const deleteId = createdAppIds[6]; // WITHDRAWN
    const res = await request(app)
      .delete(`/api/applications/${deleteId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify it is gone
    const checkRes = await request(app)
      .get(`/api/applications/${deleteId}`)
      .set('Authorization', `Bearer ${authToken}`);
    expect(checkRes.status).toBe(404);
  });
});
