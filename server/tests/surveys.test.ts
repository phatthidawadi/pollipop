import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/prisma';
import { seedDatabase } from '../prisma/seed';

const DEMO_PASSWORD = process.env.DEMO_USER_PASSWORD || 'ChangeMeInDev123!';

describe('Feature F-02: Survey Creation, Listing & Lifecycle Management (TEST-09..TEST-19, TEST-35)', () => {
  let owner1Cookie: string[];
  let owner2Cookie: string[];
  let student1Cookie: string[];

  beforeAll(async () => {
    await prisma.answer.deleteMany();
    await prisma.response.deleteMany();
    await prisma.surveyParticipation.deleteMany();
    await prisma.choiceOption.deleteMany();
    await prisma.question.deleteMany();
    await prisma.survey.deleteMany();
    await prisma.session.deleteMany();

    await seedDatabase();

    // Log in owner1
    const owner1Login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'owner1@pollipop.local', password: DEMO_PASSWORD });
    owner1Cookie = owner1Login.headers['set-cookie'];

    // Log in owner2
    const owner2Login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'owner2@pollipop.local', password: DEMO_PASSWORD });
    owner2Cookie = owner2Login.headers['set-cookie'];

    // Log in student1 (RESPONDENT)
    const student1Login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student1@pollipop.local', password: DEMO_PASSWORD });
    student1Cookie = student1Login.headers['set-cookie'];
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // AC-09 / TEST-09: OWNER creates DRAFT survey with questions and options (HTTP 201)
  it('TEST-09 / AC-09: OWNER can create a survey with SINGLE_CHOICE and RATING questions in DRAFT status', async () => {
    const payload = {
      title: 'CPE 334 Software Engineering Course Evaluation',
      description: 'Course evaluation survey for Sprint 1 verification',
      mode: 'IDENTIFIED',
      questions: [
        {
          text: 'How clear were the project deliverable requirements?',
          type: 'SINGLE_CHOICE',
          required: true,
          options: ['Very Clear', 'Somewhat Clear', 'Needs Improvement'],
        },
        {
          text: 'Overall Course Quality Rating (1 to 5)',
          type: 'RATING',
          required: true,
        },
      ],
    };

    const res = await request(app)
      .post('/api/surveys')
      .set('Cookie', owner1Cookie)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe(payload.title);
    expect(res.body.status).toBe('DRAFT');
    expect(res.body.mode).toBe('IDENTIFIED');
    expect(res.body.questions).toHaveLength(2);

    const singleChoiceQ = res.body.questions.find((q: any) => q.type === 'SINGLE_CHOICE');
    expect(singleChoiceQ).toBeDefined();
    expect(singleChoiceQ.options).toHaveLength(3);
    expect(singleChoiceQ.options[0].text).toBe('Very Clear');

    const ratingQ = res.body.questions.find((q: any) => q.type === 'RATING');
    expect(ratingQ).toBeDefined();
    expect(ratingQ.required).toBe(true);
  });

  // AC-10 / TEST-10: RESPONDENT attempting to create survey is rejected with 403 FORBIDDEN
  it('TEST-10 / AC-10: RESPONDENT role attempting POST /api/surveys is rejected with 403 Forbidden', async () => {
    const payload = {
      title: 'Unauthorized Survey by Respondent',
      questions: [
        {
          text: 'Should this be created?',
          type: 'RATING',
          required: true,
        },
      ],
    };

    const res = await request(app)
      .post('/api/surveys')
      .set('Cookie', student1Cookie)
      .send(payload);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  // AC-11 / TEST-11: Invalid survey payload returns 400 Bad Request (VALIDATION_ERROR)
  it('TEST-11 / AC-11: Creating survey with empty title or empty questions array returns 400 Bad Request', async () => {
    const emptyTitleRes = await request(app)
      .post('/api/surveys')
      .set('Cookie', owner1Cookie)
      .send({
        title: '',
        questions: [{ text: 'Valid question', type: 'RATING', required: true }],
      });
    expect(emptyTitleRes.status).toBe(400);
    expect(emptyTitleRes.body.error.code).toBe('VALIDATION_ERROR');

    const emptyQuestionsRes = await request(app)
      .post('/api/surveys')
      .set('Cookie', owner1Cookie)
      .send({
        title: 'Survey with no questions',
        questions: [],
      });
    expect(emptyQuestionsRes.status).toBe(400);
    expect(emptyQuestionsRes.body.error.code).toBe('VALIDATION_ERROR');
  });

  // AC-12 / TEST-12: SINGLE_CHOICE question with <2 or >10 options returns 400 Bad Request
  it('TEST-12 / AC-12: SINGLE_CHOICE question with fewer than 2 options returns 400 Bad Request', async () => {
    const singleOptionRes = await request(app)
      .post('/api/surveys')
      .set('Cookie', owner1Cookie)
      .send({
        title: 'Invalid single choice survey',
        questions: [
          {
            text: 'Question with 1 option only',
            type: 'SINGLE_CHOICE',
            required: true,
            options: ['Only One Option'],
          },
        ],
      });

    expect(singleOptionRes.status).toBe(400);
    expect(singleOptionRes.body.error.code).toBe('VALIDATION_ERROR');
    expect(JSON.stringify(singleOptionRes.body.error.details)).toContain('options');
  });

  // AC-13 / TEST-13: Invalid question type is rejected with 400 Bad Request
  it('TEST-13 / AC-13: Question specifying unsupported type returns 400 Bad Request', async () => {
    const invalidTypeRes = await request(app)
      .post('/api/surveys')
      .set('Cookie', owner1Cookie)
      .send({
        title: 'Unsupported type survey',
        questions: [
          {
            text: 'Question with unknown type',
            type: 'UNKNOWN_TYPE_XYZ',
            required: true,
          },
        ],
      });

    expect(invalidTypeRes.status).toBe(400);
    expect(invalidTypeRes.body.error.code).toBe('VALIDATION_ERROR');
  });

  // AC-14, AC-15, AC-16: Lifecycle State Transitions and Ownership Isolation
  it('TEST-14, TEST-15, TEST-16: Survey lifecycle state transitions (DRAFT -> PUBLISHED) and ownership checks', async () => {
    // 1. Create a fresh draft survey as owner1
    const createRes = await request(app)
      .post('/api/surveys')
      .set('Cookie', owner1Cookie)
      .send({
        title: 'Lifecycle State Test Survey',
        mode: 'IDENTIFIED',
        questions: [
          {
            text: 'How satisfied are you?',
            type: 'RATING',
            required: true,
          },
        ],
      });
    expect(createRes.status).toBe(201);
    const surveyId = createRes.body.id;

    // TEST-16 / AC-16: owner2 attempts to publish owner1's survey -> 403 Forbidden
    const owner2Publish = await request(app)
      .post(`/api/surveys/${surveyId}/publish`)
      .set('Cookie', owner2Cookie);
    expect(owner2Publish.status).toBe(403);
    expect(owner2Publish.body.error.code).toBe('FORBIDDEN');

    // TEST-14 / AC-14: owner1 publishes own survey -> 200 OK, status = PUBLISHED
    const publishRes = await request(app)
      .post(`/api/surveys/${surveyId}/publish`)
      .set('Cookie', owner1Cookie);
    expect(publishRes.status).toBe(200);
    expect(publishRes.body.status).toBe('PUBLISHED');
    expect(publishRes.body.publishedAt).toBeDefined();
    expect(new Date(publishRes.body.publishedAt).toISOString()).toBe(publishRes.body.publishedAt);

    // TEST-15 / AC-15: Repeating publish on already PUBLISHED survey returns 409 Conflict
    const repeatPublishRes = await request(app)
      .post(`/api/surveys/${surveyId}/publish`)
      .set('Cookie', owner1Cookie);
    expect(repeatPublishRes.status).toBe(409);
    expect(repeatPublishRes.body.error.code).toBe('INVALID_STATE_TRANSITION');
  });

  // AC-17: Role-specific listings for OWNER (isolated)
  it('TEST-17 / AC-17: OWNER receives only their own authored surveys in GET /api/surveys', async () => {
    // Create survey for owner2
    await request(app)
      .post('/api/surveys')
      .set('Cookie', owner2Cookie)
      .send({
        title: 'Owner 2 Unique Private Survey',
        questions: [{ text: 'Question', type: 'RATING', required: true }],
      });

    // Query surveys as owner1
    const res = await request(app).get('/api/surveys').set('Cookie', owner1Cookie);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    // Verify owner1 does not see owner2's survey
    const titles = res.body.map((s: any) => s.title);
    expect(titles).not.toContain('Owner 2 Unique Private Survey');
    for (const survey of res.body) {
      expect(survey).toHaveProperty('responseCount');
    }
  });

  // AC-18, AC-19: RESPONDENT views only PUBLISHED surveys and cannot view DRAFT surveys
  it('TEST-18 & TEST-19 / AC-18, AC-19: RESPONDENT receives only PUBLISHED surveys with participation flags, and DRAFT returns 404', async () => {
    // 1. Create a DRAFT survey by owner1
    const draftRes = await request(app)
      .post('/api/surveys')
      .set('Cookie', owner1Cookie)
      .send({
        title: 'Secret Draft Survey Not Yet Published',
        questions: [{ text: 'Draft question', type: 'RATING', required: true }],
      });
    const draftSurveyId = draftRes.body.id;

    // 2. Query list as student1 (RESPONDENT)
    const listRes = await request(app).get('/api/surveys').set('Cookie', student1Cookie);
    expect(listRes.status).toBe(200);
    const listedTitles = listRes.body.map((s: any) => s.title);
    expect(listedTitles).not.toContain('Secret Draft Survey Not Yet Published');

    // All listed surveys must be PUBLISHED and contain answered flag
    for (const s of listRes.body) {
      expect(s.status).toBe('PUBLISHED');
      expect(s).toHaveProperty('answered');
      expect(typeof s.answered).toBe('boolean');
    }

    // TEST-19 / AC-19: RESPONDENT querying GET /api/surveys/:id for a DRAFT survey receives 404 Not Found
    const draftDetailRes = await request(app)
      .get(`/api/surveys/${draftSurveyId}`)
      .set('Cookie', student1Cookie);
    expect(draftDetailRes.status).toBe(404);
    expect(draftDetailRes.body.error.code).toBe('NOT_FOUND');
  });

  // AC-35 / TEST-35: Close survey transition (PUBLISHED -> CLOSED) and transition error handling
  it('TEST-35 / AC-35: Survey owner can close a PUBLISHED survey (200 OK); closing non-published survey returns 409 Conflict', async () => {
    // 1. Create and publish a survey
    const createRes = await request(app)
      .post('/api/surveys')
      .set('Cookie', owner1Cookie)
      .send({
        title: 'Survey to Be Closed',
        questions: [{ text: 'Question', type: 'RATING', required: true }],
      });
    const surveyId = createRes.body.id;

    // Attempting to close DRAFT survey -> 409 Conflict
    const closeDraftRes = await request(app)
      .post(`/api/surveys/${surveyId}/close`)
      .set('Cookie', owner1Cookie);
    expect(closeDraftRes.status).toBe(409);
    expect(closeDraftRes.body.error.code).toBe('INVALID_STATE_TRANSITION');

    // Publish survey
    await request(app).post(`/api/surveys/${surveyId}/publish`).set('Cookie', owner1Cookie);

    // Close published survey -> 200 OK
    const closeRes = await request(app)
      .post(`/api/surveys/${surveyId}/close`)
      .set('Cookie', owner1Cookie);
    expect(closeRes.status).toBe(200);
    expect(closeRes.body.status).toBe('CLOSED');
    expect(closeRes.body.closedAt).toBeDefined();
    expect(new Date(closeRes.body.closedAt).toISOString()).toBe(closeRes.body.closedAt);

    // Repeating close on already CLOSED survey -> 409 Conflict
    const repeatCloseRes = await request(app)
      .post(`/api/surveys/${surveyId}/close`)
      .set('Cookie', owner1Cookie);
    expect(repeatCloseRes.status).toBe(409);
    expect(repeatCloseRes.body.error.code).toBe('INVALID_STATE_TRANSITION');
  });
});

