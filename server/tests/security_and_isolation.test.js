import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Application } from '../src/models/Application.js';
import { Notification } from '../src/models/Notification.js';
import { ENV } from '../src/config/env.js';

let userAToken = '';
let userBToken = '';
let userAId = '';
let userBId = '';
let userAAppId = '';
let userANotifId = '';

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await disconnectDB();
});

describe('Phase 3: Authentication, Security & Cross-User Data Isolation Audit', () => {
  const timestamp = Date.now();
  const userAData = {
    name: 'Auditor User A',
    email: `auditor.a.${timestamp}@jobpilot.test`,
    password: 'PasswordA123!',
  };
  const userBData = {
    name: 'Auditor User B',
    email: `auditor.b.${timestamp}@jobpilot.test`,
    password: 'PasswordB123!',
  };

  it('1. User Registration: successfully registers User A', async () => {
    const res = await request(app).post('/api/auth/register').send(userAData);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(userAData.email);
    expect(res.body.user.password).toBeUndefined(); // Password must never be returned

    userAToken = res.body.token;
    userAId = res.body.user._id;
  });

  it('2. User Registration: successfully registers User B', async () => {
    const res = await request(app).post('/api/auth/register').send(userBData);
    expect(res.status).toBe(201);
    userBToken = res.body.token;
    userBId = res.body.user._id;
  });

  it('3. Duplicate Email: rejects duplicate registration with 409 Conflict', async () => {
    const res = await request(app).post('/api/auth/register').send(userAData);
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('already exists');
  });

  it('4. Invalid Email: rejects malformed email address with 400 Bad Request', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Bad Email User',
      email: 'not-an-email',
      password: 'ValidPassword123!',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('5. Weak Password: rejects password shorter than 6 characters with 400 Bad Request', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Weak Password User',
      email: `weak.${timestamp}@jobpilot.test`,
      password: '123',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('at least 6 characters');
  });

  it('6. Correct Login: returns valid JWT token and user profile', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: userAData.email,
      password: userAData.password,
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  it('7. Incorrect Password: rejects invalid password with 401 Unauthorized', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: userAData.email,
      password: 'WrongPassword999!',
    });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Invalid email or password');
  });

  it('8. Password Hashing: verifies bcrypt hashing and non-plaintext storage', async () => {
    const dbUser = await User.findById(userAId);
    expect(dbUser.password).not.toBe(userAData.password);
    expect(dbUser.password.startsWith('$2')).toBe(true); // bcrypt hash format ($2a / $2b)
    const isMatch = await bcrypt.compare(userAData.password, dbUser.password);
    expect(isMatch).toBe(true);
  });

  it('9. Missing JWT: rejects protected route access with 401 Unauthorized', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('10. Invalid JWT: rejects forged token with 401 Unauthorized', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer forged_fake_token_value_12345');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('11. Expired JWT: returns 401 with Token Expired notice', async () => {
    // Generate an already expired token
    const expiredToken = jwt.sign({ id: userAId }, ENV.JWT_SECRET, { expiresIn: '-1s' });
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${expiredToken}`);
    expect(res.status).toBe(401);
    expect(res.body.message).toContain('expired');
  });

  describe('Cross-User Data Isolation Verification', () => {
    it('Setup: User A creates an application and notification', async () => {
      // User A creates application
      const appRes = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          company: 'Confidential Corp A',
          jobTitle: 'Lead Architect',
          location: 'Remote',
          status: 'APPLIED',
        });
      expect(appRes.status).toBe(201);
      userAAppId = appRes.body.data._id;

      // Create a notification for User A
      const notif = await Notification.create({
        userId: userAId,
        title: 'Secret Alert User A',
        message: 'Confidential notification content',
      });
      userANotifId = notif._id.toString();
    });

    it('Cross-User Isolation: User B CANNOT read User A application details', async () => {
      const res = await request(app)
        .get(`/api/applications/${userAAppId}`)
        .set('Authorization', `Bearer ${userBToken}`);
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('Cross-User Isolation: User B CANNOT update User A application status', async () => {
      const res = await request(app)
        .patch(`/api/applications/${userAAppId}/status`)
        .set('Authorization', `Bearer ${userBToken}`)
        .send({ status: 'REJECTED' });
      expect(res.status).toBe(404);

      // Verify User A application status was NOT modified
      const checkRes = await request(app)
        .get(`/api/applications/${userAAppId}`)
        .set('Authorization', `Bearer ${userAToken}`);
      expect(checkRes.body.data.status).toBe('APPLIED');
    });

    it('Cross-User Isolation: User B CANNOT delete User A application', async () => {
      const res = await request(app)
        .delete(`/api/applications/${userAAppId}`)
        .set('Authorization', `Bearer ${userBToken}`);
      expect(res.status).toBe(404);

      // Verify User A application still exists
      const checkRes = await request(app)
        .get(`/api/applications/${userAAppId}`)
        .set('Authorization', `Bearer ${userAToken}`);
      expect(checkRes.status).toBe(200);
    });

    it('Cross-User Isolation: User B list of applications does NOT include User A records', async () => {
      const res = await request(app)
        .get('/api/applications')
        .set('Authorization', `Bearer ${userBToken}`);
      expect(res.status).toBe(200);
      const appIds = res.body.data.map((a) => a._id);
      expect(appIds).not.toContain(userAAppId);
    });

    it('Cross-User Isolation: User B CANNOT read or mark User A notifications as read', async () => {
      const res = await request(app)
        .patch(`/api/notifications/${userANotifId}/read`)
        .set('Authorization', `Bearer ${userBToken}`);
      expect(res.status).toBe(404);
    });

    it('Cross-User Isolation: User B CANNOT delete User A notifications', async () => {
      const res = await request(app)
        .delete(`/api/notifications/${userANotifId}`)
        .set('Authorization', `Bearer ${userBToken}`);
      expect(res.status).toBe(404);
    });

    it('Cross-User Isolation: User B notification feed does NOT leak User A notifications', async () => {
      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${userBToken}`);
      expect(res.status).toBe(200);
      const notifIds = res.body.data.map((n) => n._id);
      expect(notifIds).not.toContain(userANotifId);
    });
  });
});
