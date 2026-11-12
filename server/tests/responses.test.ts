import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/prisma';
import { seedDatabase } from '../prisma/seed';

const DEMO_PASSWORD = process.env.DEMO_USER_PASSWORD || 'ChangeMeInDev123!';

describe('Feature F-03: Validated Response Submission & Own Response Inspection (TEST-20..TEST-29, TEST-36, TEST-37)', () => {
  let owner1Cookie: string[];
  let student1Cookie: string[];
  let student2Cookie: string[];

  let publishedSurveyId: string;
  let singleChoiceQId: string;
  let opt1Id: string;
  let opt2Id: string;
  let ratingQId: string;
  let optionalQId: string;
  let optionalOptId: string;

  let draftSurveyId: string;
  let closedSurveyId: string;
  let student1ResponseId: string;

  beforeAll(async () => {
    await prisma.answer.deleteMany();
    await prisma.response.deleteMany();
    await prisma.surveyParticipation.deleteMany();
    await prisma.choiceOption.deleteMany();
    await prisma.question.deleteMany();
    await prisma.survey.deleteMany();
    await prisma.session.deleteMany();

    await seedDatabase();

    // 1. Authenticate Owner 1
    const owner1Login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'owner1@pollipop.local', password: DEMO_PASSWORD });
    owner1Cookie = owner1Login.headers['set-cookie'];

    // 2. Authenticate Student 1 (RESPONDENT)
    const student1Login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student1@pollipop.local', password: DEMO_PASSWORD });
    student1Cookie = student1Login.headers['set-cookie'];

    // 3. Authenticate Student 2 (RESPONDENT)
    const student2Login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student2@pollipop.local', password: DEMO_PASSWORD });
    student2Cookie = student2Login.headers['set-cookie'];

    // 4. Create standard test survey with SINGLE_CHOICE, RATING, and an OPTIONAL question
    const createSurveyRes = await request(app)
      .post('/api/surveys')
      .set('Cookie', owner1Cookie)
      .send({
        title: 'CPE 334 Midterm Course Evaluation',
        description: 'Sprint 1 Evaluation and Feedback Survey',
        mode: 'IDENTIFIED',
        questions: [
          {
            text: 'How clear were the assignment instructions?',
            type: 'SINGLE_CHOICE',
            required: true,
            options: ['Clear', 'Neutral', 'Unclear'],
          },
          {
            text: 'Course overall difficulty (1 to 5)',
            type: 'RATING',
            required: true,
          },
          {
            text: 'Preferred programming lab framework (Optional)',
            type: 'SINGLE_CHOICE',
            required: false,
            options: ['React + Vite', 'Vue + Vite', 'Angular'],
          },
        ],
      });
    publishedSurveyId = createSurveyRes.body.id;
    const questions = createSurveyRes.body.questions;
    singleChoiceQId = questions[0].id;
    opt1Id = questions[0].options[0].id;
    opt2Id = questions[0].options[1].id;
    ratingQId = questions[1].id;
    optionalQId = questions[2].id;
    optionalOptId = questions[2].options[0].id;

    // Publish this survey
    await request(app).post(`/api/surveys/${publishedSurveyId}/publish`).set('Cookie', owner1Cookie);

    // 5. Create a DRAFT survey
    const draftRes = await request(app)
      .post('/api/surveys')
      .set('Cookie', owner1Cookie)
      .send({
        title: 'Unpublished Draft Survey',
        questions: [{ text: 'Draft question', type: 'RATING', required: true }],
      });
    draftSurveyId = draftRes.body.id;

    // 6. Create and CLOSED survey
    const closedRes = await request(app)
      .post('/api/surveys')
      .set('Cookie', owner1Cookie)
      .send({
        title: 'Closed Term Survey',
        questions: [{ text: 'Closed question', type: 'RATING', required: true }],
      });
    closedSurveyId = closedRes.body.id;
    await request(app).post(`/api/surveys/${closedSurveyId}/publish`).set('Cookie', owner1Cookie);
    await request(app).post(`/api/surveys/${closedSurveyId}/close`).set('Cookie', owner1Cookie);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // AC-23 / TEST-23: User with OWNER role attempting POST /api/surveys/:id/responses is rejected with 403 Forbidden
  it('TEST-23 / AC-23: OWNER role attempting POST /api/surveys/:id/responses is rejected with 403 Forbidden', async () => {
    const res = await request(app)
      .post(`/api/surveys/${publishedSurveyId}/responses`)
      .set('Cookie', owner1Cookie)
      .send({
        answers: [
          { questionId: singleChoiceQId, optionId: opt1Id },
          { questionId: ratingQId, ratingValue: 5 },
        ],
      });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  // AC-22 / TEST-22: Submitting to DRAFT returns 404; submitting to CLOSED returns 409 SURVEY_NOT_OPEN
  it('TEST-22 / AC-22: Submitting answers to DRAFT returns 404 NOT_FOUND, and to CLOSED returns 409 SURVEY_NOT_OPEN', async () => {
    // Attempt submission to DRAFT survey -> 404 NOT_FOUND
    const draftSubmit = await request(app)
      .post(`/api/surveys/${draftSurveyId}/responses`)
      .set('Cookie', student1Cookie)
      .send({
        answers: [{ questionId: 'any-id', ratingValue: 5 }],
      });
    expect(draftSubmit.status).toBe(404);
    expect(draftSubmit.body.error.code).toBe('NOT_FOUND');

    // Attempt submission to CLOSED survey -> 409 SURVEY_NOT_OPEN
    const closedSubmit = await request(app)
      .post(`/api/surveys/${closedSurveyId}/responses`)
      .set('Cookie', student1Cookie)
      .send({
        answers: [{ questionId: 'any-id', ratingValue: 5 }],
      });
    expect(closedSubmit.status).toBe(409);
    expect(closedSubmit.body.error.code).toBe('SURVEY_NOT_OPEN');
  });

  // AC-24 / TEST-24: Omitting answer for a required: true question returns 400 VALIDATION_ERROR
  it('TEST-24 / AC-24: Omitting required question returns 400 Bad Request (VALIDATION_ERROR)', async () => {
    // Only answer question 1, omit required rating question
    const res = await request(app)
      .post(`/api/surveys/${publishedSurveyId}/responses`)
      .set('Cookie', student1Cookie)
      .send({
        answers: [{ questionId: singleChoiceQId, optionId: opt1Id }],
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details.length).toBeGreaterThan(0);
  });

  // AC-25 / TEST-25: Submitting invalid rating values or mismatched option IDs returns 400 Bad Request
  it('TEST-25 / AC-25: Submitting rating outside 1..5 or invalid optionId returns 400 Bad Request', async () => {
    // Rating out of bounds (score 6)
    const invalidRatingRes = await request(app)
      .post(`/api/surveys/${publishedSurveyId}/responses`)
      .set('Cookie', student1Cookie)
      .send({
        answers: [
          { questionId: singleChoiceQId, optionId: opt1Id },
          { questionId: ratingQId, ratingValue: 6 },
        ],
      });
    expect(invalidRatingRes.status).toBe(400);
    expect(invalidRatingRes.body.error.code).toBe('VALIDATION_ERROR');

    // Mismatched optionId (non-existent option)
    const mismatchedOptionRes = await request(app)
      .post(`/api/surveys/${publishedSurveyId}/responses`)
      .set('Cookie', student1Cookie)
      .send({
        answers: [
          { questionId: singleChoiceQId, optionId: 'invalid-non-existent-option-id' },
          { questionId: ratingQId, ratingValue: 4 },
        ],
      });
    expect(mismatchedOptionRes.status).toBe(400);
    expect(mismatchedOptionRes.body.error.code).toBe('VALIDATION_ERROR');
  });

  // AC-20 & AC-26 / TEST-20 & TEST-26: Valid submission with optional question omitted succeeds (201 Created)
  it('TEST-20 & TEST-26 / AC-20, AC-26: RESPONDENT submits valid response (omitting optional question) and receives 201 Created', async () => {
    const res = await request(app)
      .post(`/api/surveys/${publishedSurveyId}/responses`)
      .set('Cookie', student1Cookie)
      .send({
        answers: [
          { questionId: singleChoiceQId, optionId: opt1Id },
          { questionId: ratingQId, ratingValue: 5 },
          // optional question omitted
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.surveyId).toBe(publishedSurveyId);
    expect(res.body.respondentId).toBeDefined();
    expect(res.body.answers).toHaveLength(2);

    student1ResponseId = res.body.id;

    // Verify database atomic persistence
    const dbParticipation = await prisma.surveyParticipation.findUnique({
      where: {
        surveyId_userId: {
          surveyId: publishedSurveyId,
          userId: res.body.respondentId,
        },
      },
    });
    expect(dbParticipation).not.toBeNull();
    expect(dbParticipation?.responseId).toBe(student1ResponseId);
  });

  // AC-21 / TEST-21: Repeat submission by same respondent is rejected with 409 ALREADY_SUBMITTED
  it('TEST-21 / AC-21: Duplicate response submission returns 409 Conflict (ALREADY_SUBMITTED)', async () => {
    const duplicateRes = await request(app)
      .post(`/api/surveys/${publishedSurveyId}/responses`)
      .set('Cookie', student1Cookie)
      .send({
        answers: [
          { questionId: singleChoiceQId, optionId: opt2Id },
          { questionId: ratingQId, ratingValue: 3 },
        ],
      });

    expect(duplicateRes.status).toBe(409);
    expect(duplicateRes.body.error.code).toBe('ALREADY_SUBMITTED');

    // Verify DB still contains only 1 response for student1
    const count = await prisma.response.count({
      where: {
        surveyId: publishedSurveyId,
        respondentId: { not: null },
      },
    });
    expect(count).toBe(1);
  });

  // AC-27 / TEST-27: RESPONDENT inspects own answers via GET /api/responses/:id (200 OK)
  it('TEST-27 / AC-27: RESPONDENT can view own submitted answers via GET /api/responses/:id', async () => {
    const res = await request(app)
      .get(`/api/responses/${student1ResponseId}`)
      .set('Cookie', student1Cookie);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(student1ResponseId);
    expect(res.body.surveyId).toBe(publishedSurveyId);
    expect(res.body.survey.title).toBe('CPE 334 Midterm Course Evaluation');
    expect(res.body.answers).toHaveLength(2);

    const singleChoiceAns = res.body.answers.find((a: any) => a.questionId === singleChoiceQId);
    expect(singleChoiceAns).toBeDefined();
    expect(singleChoiceAns.optionId).toBe(opt1Id);
    expect(singleChoiceAns.option.text).toBe('Clear');

    const ratingAns = res.body.answers.find((a: any) => a.questionId === ratingQId);
    expect(ratingAns).toBeDefined();
    expect(ratingAns.ratingValue).toBe(5);
  });

  // AC-28 / TEST-28: Cross-user response inspection by another RESPONDENT returns 403 Forbidden
  it('TEST-28 / AC-28: Different RESPONDENT (student2) attempting GET /api/responses/:id receives 403 Forbidden', async () => {
    const res = await request(app)
      .get(`/api/responses/${student1ResponseId}`)
      .set('Cookie', student2Cookie);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
    expect(res.body).not.toHaveProperty('answers');
  });

  // AC-29 / TEST-29: Direct inspection of response by OWNER returns 403 Forbidden
  it('TEST-29 / AC-29: OWNER attempting direct access to GET /api/responses/:id receives 403 Forbidden', async () => {
    const res = await request(app)
      .get(`/api/responses/${student1ResponseId}`)
      .set('Cookie', owner1Cookie);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  // AC-36 / TEST-36: ANONYMOUS survey records participation but leaves Response.respondentId strictly null
  it('TEST-36 / AC-36: ANONYMOUS survey decouples respondentId from Response record while recording participation', async () => {
    // 1. Create and publish an ANONYMOUS survey
    const anonSurveyRes = await request(app)
      .post('/api/surveys')
      .set('Cookie', owner1Cookie)
      .send({
        title: 'Anonymous Project Satisfaction Feedback',
        mode: 'ANONYMOUS',
        questions: [
          {
            text: 'How satisfied are you with team collaboration?',
            type: 'RATING',
            required: true,
          },
        ],
      });
    const anonSurveyId = anonSurveyRes.body.id;
    const anonQId = anonSurveyRes.body.questions[0].id;

    await request(app).post(`/api/surveys/${anonSurveyId}/publish`).set('Cookie', owner1Cookie);

    // 2. Submit response as student1
    const submitRes = await request(app)
      .post(`/api/surveys/${anonSurveyId}/responses`)
      .set('Cookie', student1Cookie)
      .send({
        answers: [{ questionId: anonQId, ratingValue: 5 }],
      });

    expect(submitRes.status).toBe(201);
    expect(submitRes.body.respondentId).toBeNull();
    const anonResponseId = submitRes.body.id;

    // 3. Verify in database: Response.respondentId is null
    const dbResponse = await prisma.response.findUnique({
      where: { id: anonResponseId },
    });
    expect(dbResponse?.respondentId).toBeNull();

    // 4. Verify in database: SurveyParticipation exists for student1
    const currentUser = await prisma.user.findUnique({ where: { email: 'student1@pollipop.local' } });
    const participation = await prisma.surveyParticipation.findUnique({
      where: {
        surveyId_userId: {
          surveyId: anonSurveyId,
          userId: currentUser!.id,
        },
      },
    });
    expect(participation).not.toBeNull();
    expect(participation?.responseId).toBeNull();

    // 5. Attempt duplicate submission on anonymous survey -> rejected with 409 ALREADY_SUBMITTED
    const dupAnonRes = await request(app)
      .post(`/api/surveys/${anonSurveyId}/responses`)
      .set('Cookie', student1Cookie)
      .send({
        answers: [{ questionId: anonQId, ratingValue: 4 }],
      });
    expect(dupAnonRes.status).toBe(409);
    expect(dupAnonRes.body.error.code).toBe('ALREADY_SUBMITTED');

    // 6. Direct inspection of anonymous response via GET /api/responses/:id returns 403 Forbidden (privacy guard)
    const inspectAnonRes = await request(app)
      .get(`/api/responses/${anonResponseId}`)
      .set('Cookie', student1Cookie);
    expect(inspectAnonRes.status).toBe(403);
  });

  // AC-21 / TEST-37: Concurrent submission race condition handling
  it('TEST-37 / AC-21: Concurrent submissions dispatched simultaneously result in exactly one 201 and one 409', async () => {
    // 1. Create another published survey
    const raceSurveyRes = await request(app)
      .post('/api/surveys')
      .set('Cookie', owner1Cookie)
      .send({
        title: 'Concurrent Race Testing Survey',
        questions: [{ text: 'Quick Rate', type: 'RATING', required: true }],
      });
    const raceSurveyId = raceSurveyRes.body.id;
    const raceQId = raceSurveyRes.body.questions[0].id;

    await request(app).post(`/api/surveys/${raceSurveyId}/publish`).set('Cookie', owner1Cookie);

    // 2. Dispatch two simultaneous submissions using student2
    const [resA, resB] = await Promise.all([
      request(app)
        .post(`/api/surveys/${raceSurveyId}/responses`)
        .set('Cookie', student2Cookie)
        .send({ answers: [{ questionId: raceQId, ratingValue: 5 }] }),
      request(app)
        .post(`/api/surveys/${raceSurveyId}/responses`)
        .set('Cookie', student2Cookie)
        .send({ answers: [{ questionId: raceQId, ratingValue: 4 }] }),
    ]);

    const statuses = [resA.status, resB.status].sort();
    expect(statuses).toEqual([201, 409]);

    // Exactly one 201 Created and one 409 ALREADY_SUBMITTED
    const conflictRes = resA.status === 409 ? resA : resB;
    expect(conflictRes.body.error.code).toBe('ALREADY_SUBMITTED');

    // Verify DB holds exactly 1 response record
    const responsesInDb = await prisma.response.findMany({
      where: { surveyId: raceSurveyId },
    });
    expect(responsesInDb).toHaveLength(1);
  });
});
