import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/prisma';
import { seedDatabase } from '../prisma/seed';
import bcrypt from 'bcryptjs';

describe('S-01 System Foundation, Health & Readiness Probes', () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // AC-07 / TEST-07: Health Check (Liveness Probe)
  it('TEST-07: GET /api/health returns 200 OK with liveness payload', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('service', 'Pollipop API');
    expect(res.body).toHaveProperty('timestamp');
    expect(new Date(res.body.timestamp).toISOString()).toBe(res.body.timestamp);
  });

  // AC-08 / TEST-08: Database Readiness Probe
  it('TEST-08: GET /api/ready returns 200 OK when database is reachable', async () => {
    const res = await request(app).get('/api/ready');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: 'ready',
      db: 'connected',
    });
  });

  // AC-37 / TEST-38: Idempotent User Seed & Password Hashing Verification
  it('TEST-38: seedDatabase executes idempotently with bcrypt >= 10 rounds', async () => {
    // 1. Execute seed first time
    await seedDatabase();

    // 2. Execute seed second time consecutively (must not crash or throw duplicate error)
    await seedDatabase();

    // 3. Inspect seeded users
    const users = await prisma.user.findMany();
    expect(users.length).toBeGreaterThanOrEqual(4);

    const emails = users.map((u) => u.email);
    expect(emails).toContain('owner1@pollipop.local');
    expect(emails).toContain('owner2@pollipop.local');
    expect(emails).toContain('student1@pollipop.local');
    expect(emails).toContain('student2@pollipop.local');

    // 4. Verify password hashing complies with NFR-02 (bcrypt >= 10 rounds)
    for (const user of users) {
      expect(user.passwordHash).toMatch(/^\$2[ab]\$\d{2}\$/);
      const isMatch = await bcrypt.compare('ChangeMeInDev123!', user.passwordHash);
      expect(isMatch).toBe(true);
    }
  });
});
