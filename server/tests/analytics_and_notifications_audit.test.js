import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Application } from '../src/models/Application.js';
import { Notification } from '../src/models/Notification.js';

let userA = null;
let tokenA = '';
let userB = null;
let tokenB = '';

beforeAll(async () => {
  await connectDB();
  const timestamp = Date.now();

  userA = await User.create({
    name: 'Analytics User A',
    email: `analytics.a.${timestamp}@jobpilot.test`,
    password: 'Password123!',
  });

  userB = await User.create({
    name: 'Analytics User B',
    email: `analytics.b.${timestamp}@jobpilot.test`,
    password: 'Password123!',
  });

  const resA = await request(app)
    .post('/api/auth/login')
    .send({ email: userA.email, password: 'Password123!' });
  tokenA = resA.body.token;

  const resB = await request(app)
    .post('/api/auth/login')
    .send({ email: userB.email, password: 'Password123!' });
  tokenB = resB.body.token;
});

afterAll(async () => {
  await disconnectDB();
});

describe('Phase 9: Analytics and Notification System Audit', () => {
  it('1. Safe Empty State: Zero Division Protected', async () => {
    const res = await request(app)
      .get('/api/analytics')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const data = res.body.data;

    expect(data.totalTracked).toBe(0);
    expect(data.totalSaved).toBe(0);
    expect(data.totalApplied).toBe(0);
    expect(data.interviews).toBe(0);
    expect(data.offers).toBe(0);
    expect(data.rejections).toBe(0);
    expect(data.successRate).toBe(0); // Safely avoided 0/0 = NaN
    expect(data.interviewRate).toBe(0);
    expect(Array.isArray(data.weeklyActivity)).toBe(true);
    expect(data.weeklyActivity.length).toBeGreaterThanOrEqual(1);
  });

  it('2. Accurate Derived Calculations from Real DB Records', async () => {
    // User A creates 4 applications: 1 SAVED, 1 APPLIED, 1 INTERVIEW, 1 OFFER (with matchScore)
    await Application.create([
      {
        userId: userA._id,
        company: 'Alpha Inc',
        jobTitle: 'Backend Engineer',
        status: 'SAVED',
        matchScore: 85,
        source: 'Lever',
      },
      {
        userId: userA._id,
        company: 'Beta Corp',
        jobTitle: 'Frontend Engineer',
        status: 'APPLIED',
        matchScore: 90,
        source: 'Greenhouse',
      },
      {
        userId: userA._id,
        company: 'Gamma Ltd',
        jobTitle: 'Full Stack Dev',
        status: 'INTERVIEW',
        matchScore: 95,
        source: 'Remotive',
      },
      {
        userId: userA._id,
        company: 'Delta AI',
        jobTitle: 'AI Engineer',
        status: 'OFFER',
        matchScore: 90,
        source: 'Arbeitnow',
      },
    ]);

    const res = await request(app)
      .get('/api/analytics')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    const data = res.body.data;

    expect(data.totalTracked).toBe(4);
    expect(data.totalSaved).toBe(1);
    expect(data.totalApplied).toBe(1);
    expect(data.interviews).toBe(1);
    expect(data.offers).toBe(1);

    // Active = APPLIED(1) + INTERVIEW(1) + OFFER(1) = 3
    // Total Outreach = 3
    // successRate = 1/3 * 100 = 33%
    expect(data.successRate).toBe(33);
    expect(data.interviewRate).toBe(33);

    // Avg match score = (85 + 90 + 95 + 90) / 4 = 90
    expect(data.avgMatchScore).toBe(90);

    // Source distribution checks
    expect(data.sourceDistribution.length).toBe(4);
  });

  it('3. Analytics Cross-User Isolation: User B stats are completely isolated', async () => {
    const resB = await request(app)
      .get('/api/analytics')
      .set('Authorization', `Bearer ${tokenB}`);

    expect(resB.status).toBe(200);
    const dataB = resB.body.data;

    // User B has not created any applications, must remain 0
    expect(dataB.totalTracked).toBe(0);
    expect(dataB.offers).toBe(0);
    expect(dataB.interviews).toBe(0);
    expect(dataB.avgMatchScore).toBeNull();
  });

  it('4. Notification Creation & Dynamic Unread Counter', async () => {
    // Create 3 notifications for User A
    await Notification.create([
      {
        userId: userA._id,
        title: 'New Matching Job',
        message: 'A new Senior React position matches your profile 92%',
        type: 'MATCHING_JOB',
        read: false,
      },
      {
        userId: userA._id,
        title: 'Interview Reminder',
        message: 'Upcoming interview with Gamma Ltd tomorrow at 2:00 PM',
        type: 'INTERVIEW_REMINDER',
        read: false,
      },
      {
        userId: userA._id,
        title: 'Application Status Updated',
        message: 'Your application to Delta AI moved to OFFER',
        type: 'APPLICATION_UPDATE',
        read: true,
      },
    ]);

    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.unreadCount).toBe(2);
    expect(res.body.data.length).toBe(3);
  });

  it('5. Single Notification Mark As Read & Counter Decrement', async () => {
    const unreadNotif = await Notification.findOne({ userId: userA._id, read: false });
    expect(unreadNotif).toBeDefined();

    const patchRes = await request(app)
      .patch(`/api/notifications/${unreadNotif._id}/read`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.data.read).toBe(true);

    // Verify unread count decreased to 1
    const listRes = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${tokenA}`);
    expect(listRes.body.unreadCount).toBe(1);
  });

  it('6. Bulk Mark All As Read', async () => {
    const bulkRes = await request(app)
      .patch('/api/notifications/read-all')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(bulkRes.status).toBe(200);
    expect(bulkRes.body.success).toBe(true);

    const listRes = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${tokenA}`);
    expect(listRes.body.unreadCount).toBe(0);
  });

  it('7. Cross-User Notification Deletion & Strict IDOR Prevention', async () => {
    // User B attempts to delete User A's notification
    const userANotif = await Notification.findOne({ userId: userA._id });
    expect(userANotif).toBeDefined();

    const attackRes = await request(app)
      .delete(`/api/notifications/${userANotif._id}`)
      .set('Authorization', `Bearer ${tokenB}`);

    expect(attackRes.status).toBe(404);

    // User A can successfully delete their own notification
    const deleteRes = await request(app)
      .delete(`/api/notifications/${userANotif._id}`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);
  });
});
