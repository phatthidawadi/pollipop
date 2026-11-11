import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/prisma';
import { seedDatabase } from '../prisma/seed';

const DEMO_PASSWORD = process.env.DEMO_USER_PASSWORD || 'ChangeMeInDev123!';

describe('F-01: Authentication, Session & Access Tests (TEST-01 to TEST-06, TEST-39)', () => {
  beforeAll(async () => {
    await prisma.session.deleteMany();
    await seedDatabase();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('TEST-01 / AC-01: Valid login sets HttpOnly pollipop_sid cookie and omits passwordHash', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'owner1@pollipop.local', password: DEMO_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('owner1@pollipop.local');
    expect(res.body.user.role).toBe('OWNER');
    expect(res.body.user.passwordHash).toBeUndefined();

    const setCookieHeader = res.headers['set-cookie'];
    const cookieStr = Array.isArray(setCookieHeader) ? setCookieHeader.join(';') : String(setCookieHeader);
    expect(cookieStr).toContain('pollipop_sid=');
    expect(cookieStr).toContain('HttpOnly');
  });

  it('TEST-02 / AC-02: Invalid password or unknown email is rejected with 401 INVALID_CREDENTIALS', async () => {
    const wrongPass = await request(app)
      .post('/api/auth/login')
      .send({ email: 'owner1@pollipop.local', password: 'wrong-password' });
    expect(wrongPass.status).toBe(401);
    expect(wrongPass.body.error.code).toBe('INVALID_CREDENTIALS');

    const unknownUser = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@pollipop.local', password: DEMO_PASSWORD });
    expect(unknownUser.status).toBe(401);
    expect(unknownUser.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('TEST-03 / AC-03: Invalid login payload returns 400 Bad Request with VALIDATION_ERROR', async () => {
    // 1. Invalid email format
    const invalidEmail = await request(app)
      .post('/api/auth/login')
      .send({ email: 'not-an-email', password: DEMO_PASSWORD });
    expect(invalidEmail.status).toBe(400);
    expect(invalidEmail.body.error.code).toBe('VALIDATION_ERROR');
    expect(invalidEmail.body.error.details).toBeDefined();

    // 2. Missing password
    const missingPass = await request(app)
      .post('/api/auth/login')
      .send({ email: 'owner1@pollipop.local' });
    expect(missingPass.status).toBe(400);
    expect(missingPass.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('TEST-04 & TEST-39 / AC-04, AC-38: GET /api/auth/me returns current user, omits sessionId and sets Cache-Control: no-store', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student1@pollipop.local', password: DEMO_PASSWORD });
    const cookies = loginRes.headers['set-cookie'];

    const res = await request(app).get('/api/auth/me').set('Cookie', cookies);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('student1@pollipop.local');
    expect(res.body.user.role).toBe('RESPONDENT');
    expect(res.body.sessionId).toBeUndefined(); // Verify sessionId is omitted from client body
    expect(res.headers['cache-control']).toContain('no-store');
  });

  it('TEST-05 / AC-05: Unauthenticated requests to protected endpoints are rejected with 401', async () => {
    const meRes = await request(app).get('/api/auth/me');
    expect(meRes.status).toBe(401);
    expect(meRes.body.error.code).toBe('UNAUTHORIZED');
    expect(meRes.headers['cache-control']).toContain('no-store');
  });

  it('TEST-06 / AC-06: POST /api/auth/logout deletes session in DB and invalidates subsequent requests', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student1@pollipop.local', password: DEMO_PASSWORD });
    const cookies = loginRes.headers['set-cookie'];

    const logoutRes = await request(app).post('/api/auth/logout').set('Cookie', cookies);
    expect(logoutRes.status).toBe(200);

    const replayRes = await request(app).get('/api/auth/me').set('Cookie', cookies);
    expect(replayRes.status).toBe(401);
  });
});
