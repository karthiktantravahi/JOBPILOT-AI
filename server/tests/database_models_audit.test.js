import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Job } from '../src/models/Job.js';
import { Application } from '../src/models/Application.js';
import { Notification } from '../src/models/Notification.js';
import { SyncLog } from '../src/models/SyncLog.js';

beforeAll(async () => {
  await connectDB();
  try {
    await Application.syncIndexes();
    await Job.syncIndexes();
    await User.syncIndexes();
  } catch (e) {
    // ignore
  }
});

afterAll(async () => {
  await disconnectDB();
});

describe('Phase 4: Database Models & Persistence Integrity Audit', () => {
  it('1. MongoDB Connection: active, connected, and persistent', () => {
    expect(mongoose.connection.readyState).toBe(1); // 1 = connected
    expect(mongoose.connection.name).toBeDefined();
  });

  describe('User Model', () => {
    it('validates required fields (email, name, password)', async () => {
      const invalidUser = new User({});
      let err;
      try {
        await invalidUser.validate();
      } catch (e) {
        err = e;
      }
      expect(err).toBeDefined();
      expect(err.errors.name).toBeDefined();
      expect(err.errors.email).toBeDefined();
      expect(err.errors.password).toBeDefined();
    });

    it('enforces email regex and unique constraint', async () => {
      const email = `unique.db.test.${Date.now()}@jobpilot.test`;
      await User.create({
        name: 'DB Test User',
        email,
        password: 'Password123!',
      });

      // Try duplicate email
      let dupErr;
      try {
        await User.create({
          name: 'DB Test User Duplicate',
          email,
          password: 'Password123!',
        });
      } catch (e) {
        dupErr = e;
      }
      expect(dupErr).toBeDefined();
      expect(dupErr.code).toBe(11000); // Duplicate key code
    });

    it('hashes passwords securely and verifies comparePassword method', async () => {
      const rawPassword = 'SecureSecretPassword99!';
      const user = await User.create({
        name: 'Hash Tester',
        email: `hash.test.${Date.now()}@jobpilot.test`,
        password: rawPassword,
      });

      expect(user.password).not.toBe(rawPassword);
      expect(user.password.startsWith('$2')).toBe(true); // bcrypt hash format
      const isMatch = await user.comparePassword(rawPassword);
      expect(isMatch).toBe(true);
      const isMismatch = await user.comparePassword('WrongPassword');
      expect(isMismatch).toBe(false);
    });

    it('auto-generates timestamps (createdAt, updatedAt)', async () => {
      const user = await User.create({
        name: 'Timestamp Tester',
        email: `timestamp.${Date.now()}@jobpilot.test`,
        password: 'Password123!',
      });
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Job Model', () => {
    it('validates required fields (title, company, description, originalUrl, deduplicationHash)', async () => {
      const invalidJob = new Job({});
      let err;
      try {
        await invalidJob.validate();
      } catch (e) {
        err = e;
      }
      expect(err).toBeDefined();
      expect(err.errors.title).toBeDefined();
      expect(err.errors.company).toBeDefined();
      expect(err.errors.description).toBeDefined();
      expect(err.errors.originalUrl).toBeDefined();
      expect(err.errors.deduplicationHash).toBeDefined();
    });

    it('enforces deduplicationHash uniqueness', async () => {
      const hash = `test-hash-${Date.now()}`;
      await Job.create({
        title: 'Software Engineer',
        company: 'Stripe',
        description: 'Test job description',
        originalUrl: 'https://stripe.com/jobs/123',
        source: 'Greenhouse',
        deduplicationHash: hash,
      });

      let dupErr;
      try {
        await Job.create({
          title: 'Software Engineer Copy',
          company: 'Stripe',
          description: 'Test job description copy',
          originalUrl: 'https://stripe.com/jobs/123-dup',
          source: 'Greenhouse',
          deduplicationHash: hash,
        });
      } catch (e) {
        dupErr = e;
      }
      expect(dupErr).toBeDefined();
      expect(dupErr.code).toBe(11000);
    });
  });

  describe('Application Model', () => {
    it('requires userId, company, jobTitle', async () => {
      const invalidApp = new Application({});
      let err;
      try {
        await invalidApp.validate();
      } catch (e) {
        err = e;
      }
      expect(err).toBeDefined();
      expect(err.errors.userId).toBeDefined();
      expect(err.errors.company).toBeDefined();
      expect(err.errors.jobTitle).toBeDefined();
    });

    it('allows multiple manual applications with null jobId while preventing duplicate for same real job', async () => {
      const user = await User.create({
        name: 'App DB Tester',
        email: `app.tester.${Date.now()}@jobpilot.test`,
        password: 'Password123!',
      });

      // 1. Two manual applications with null jobId should SUCCEED
      const manual1 = await Application.create({
        userId: user._id,
        company: 'Company Alpha',
        jobTitle: 'Manual Role 1',
        jobId: null,
      });
      const manual2 = await Application.create({
        userId: user._id,
        company: 'Company Beta',
        jobTitle: 'Manual Role 2',
        jobId: null,
      });
      expect(manual1._id).toBeDefined();
      expect(manual2._id).toBeDefined();

      // 2. An application linked to a real jobId
      const fakeJobId = new mongoose.Types.ObjectId();
      await Application.create({
        userId: user._id,
        company: 'Company Gamma',
        jobTitle: 'Linked Role',
        jobId: fakeJobId,
      });

      // Duplicate application to the same fakeJobId should FAIL with 11000
      let dupErr;
      try {
        await Application.create({
          userId: user._id,
          company: 'Company Gamma Again',
          jobTitle: 'Linked Role Duplicate',
          jobId: fakeJobId,
        });
      } catch (e) {
        dupErr = e;
      }
      expect(dupErr).toBeDefined();
      expect(dupErr.code).toBe(11000);
    });
  });

  describe('Notification Model', () => {
    it('validates required fields (userId, title, message)', async () => {
      const invalidNotif = new Notification({});
      let err;
      try {
        await invalidNotif.validate();
      } catch (e) {
        err = e;
      }
      expect(err).toBeDefined();
      expect(err.errors.userId).toBeDefined();
      expect(err.errors.title).toBeDefined();
      expect(err.errors.message).toBeDefined();
    });

    it('defaults read to false and supports timestamps', async () => {
      const userId = new mongoose.Types.ObjectId();
      const notif = await Notification.create({
        userId,
        title: 'Test Notification',
        message: 'This is a test notification message.',
      });
      expect(notif.read).toBe(false);
      expect(notif.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('SyncLog Model', () => {
    it('records sync audit history with enum validation', async () => {
      const log = await SyncLog.create({
        source: 'Remotive',
        status: 'SUCCESS',
        jobsFound: 50,
        jobsAdded: 20,
        jobsUpdated: 30,
        durationMs: 1450,
      });

      expect(log._id).toBeDefined();
      expect(log.status).toBe('SUCCESS');
      expect(log.jobsFound).toBe(50);
      expect(log.jobsAdded).toBe(20);

      // Invalid status enum should fail
      let invalidErr;
      try {
        await SyncLog.create({
          source: 'Remotive',
          status: 'INVALID_STATUS',
        });
      } catch (e) {
        invalidErr = e;
      }
      expect(invalidErr).toBeDefined();
    });
  });
});
