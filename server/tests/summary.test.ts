import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/prisma';
import { seedDatabase } from '../prisma/seed';
import { calculateSurveySummary } from '../src/summary';

const DEMO_PASSWORD = process.env.DEMO_USER_PASSWORD || 'ChangeMeInDev123!';

describe('Feature F-04: Survey Summary & Aggregate Analytics (TEST-30..TEST-34)', () => {
  let owner1Cookie: string[];
  let owner2Cookie: string[];
  let student1Cookie: string[];
  let student2Cookie: string[];

  let populatedSurveyId: string;
  let singleChoiceQId: string;
  let optClearId: string;
  let optNeutralId: string;
  let optUnclearId: string;
  let ratingQId: string;

  let zeroSurveyId: string;

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

    // 2. Authenticate Owner 2
    const owner2Login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'owner2@pollipop.local', password: DEMO_PASSWORD });
    owner2Cookie = owner2Login.headers['set-cookie'];

    // 3. Authenticate Student 1 (RESPONDENT)
    const student1Login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student1@pollipop.local', password: DEMO_PASSWORD });
    student1Cookie = student1Login.headers['set-cookie'];

    // 4. Authenticate Student 2 (RESPONDENT)
    const student2Login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student2@pollipop.local', password: DEMO_PASSWORD });
    student2Cookie = student2Login.headers['set-cookie'];

    // 5. Create and publish survey for Owner 1
    const createSurveyRes = await request(app)
      .post('/api/surveys')
      .set('Cookie', owner1Cookie)
      .send({
        title: 'CPE 334 Course Evaluation Summary Test',
        description: 'Comprehensive test for summary metrics',
        mode: 'IDENTIFIED',
        questions: [
          {
            text: 'How clear were the assignment instructions?',
            type: 'SINGLE_CHOICE',
            required: true,
            options: ['Clear', 'Neutral', 'Unclear'],
          },
          {
            text: 'Overall Course Rating (1-5)',
            type: 'RATING',
            required: true,
          },
        ],
      });
    populatedSurveyId = createSurveyRes.body.id;
    const questions = createSurveyRes.body.questions;
    singleChoiceQId = questions[0].id;
    optClearId = questions[0].options[0].id;
    optNeutralId = questions[0].options[1].id;
    optUnclearId = questions[0].options[2].id;
    ratingQId = questions[1].id;

    await request(app).post(`/api/surveys/${populatedSurveyId}/publish`).set('Cookie', owner1Cookie);

    // 6. Submit responses from Student 1 and Student 2
    // Student 1: 'Clear' (optClearId), Rating: 5
    await request(app)
      .post(`/api/surveys/${populatedSurveyId}/responses`)
      .set('Cookie', student1Cookie)
      .send({
        answers: [
          { questionId: singleChoiceQId, optionId: optClearId },
          { questionId: ratingQId, ratingValue: 5 },
        ],
      });

    // Student 2: 'Neutral' (optNeutralId), Rating: 4
    await request(app)
      .post(`/api/surveys/${populatedSurveyId}/responses`)
      .set('Cookie', student2Cookie)
      .send({
        answers: [
          { questionId: singleChoiceQId, optionId: optNeutralId },
          { questionId: ratingQId, ratingValue: 4 },
        ],
      });

    // 7. Create and publish a survey with 0 responses
    const zeroSurveyRes = await request(app)
      .post('/api/surveys')
      .set('Cookie', owner1Cookie)
      .send({
        title: 'Zero Responses Test Survey',
        mode: 'IDENTIFIED',
        questions: [
          {
            text: 'Sample Choice Question',
            type: 'SINGLE_CHOICE',
            required: true,
            options: ['Opt A', 'Opt B'],
          },
          {
            text: 'Sample Rating Question',
            type: 'RATING',
            required: true,
          },
        ],
      });
    zeroSurveyId = zeroSurveyRes.body.id;
    await request(app).post(`/api/surveys/${zeroSurveyId}/publish`).set('Cookie', owner1Cookie);
  });

  // AC-30 / TEST-30: Survey answered by 2 users -> owner1 calls GET /api/surveys/:id/summary
  it('TEST-30 / AC-30: Survey OWNER receives accurate counts, percentages, and rating mean (200 OK)', async () => {
    const res = await request(app)
      .get(`/api/surveys/${populatedSurveyId}/summary`)
      .set('Cookie', owner1Cookie);

    expect(res.status).toBe(200);
    expect(res.body.surveyId).toBe(populatedSurveyId);
    expect(res.body.title).toBe('CPE 334 Course Evaluation Summary Test');
    expect(res.body.status).toBe('PUBLISHED');
    expect(res.body.mode).toBe('IDENTIFIED');
    expect(res.body.totalResponses).toBe(2);
    expect(res.body.questions).toHaveLength(2);

    // Verify SINGLE_CHOICE question summary
    const choiceSummary = res.body.questions.find((q: any) => q.questionId === singleChoiceQId);
    expect(choiceSummary).toBeDefined();
    expect(choiceSummary.type).toBe('SINGLE_CHOICE');
    expect(choiceSummary.totalAnswered).toBe(2);
    expect(choiceSummary.options).toHaveLength(3);

    const clearOpt = choiceSummary.options.find((o: any) => o.optionId === optClearId);
    expect(clearOpt.count).toBe(1);
    expect(clearOpt.percentage).toBe(50);

    const neutralOpt = choiceSummary.options.find((o: any) => o.optionId === optNeutralId);
    expect(neutralOpt.count).toBe(1);
    expect(neutralOpt.percentage).toBe(50);

    const unclearOpt = choiceSummary.options.find((o: any) => o.optionId === optUnclearId);
    expect(unclearOpt.count).toBe(0);
    expect(unclearOpt.percentage).toBe(0);

    // Verify RATING question summary (ratings: 5 and 4 -> mean 4.5)
    const ratingSummary = res.body.questions.find((q: any) => q.questionId === ratingQId);
    expect(ratingSummary).toBeDefined();
    expect(ratingSummary.type).toBe('RATING');
    expect(ratingSummary.totalAnswered).toBe(2);
    expect(ratingSummary.averageRating).toBe(4.5);
    expect(ratingSummary.distribution).toEqual({
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 1,
      '5': 1,
    });
  });

  // AC-31 / TEST-31: Survey with 0 responses -> totalResponses: 0, averageRating: null (no division by zero)
  it('TEST-31 / AC-31: Survey with 0 responses returns totalResponses: 0 and averageRating: null cleanly', async () => {
    const res = await request(app)
      .get(`/api/surveys/${zeroSurveyId}/summary`)
      .set('Cookie', owner1Cookie);

    expect(res.status).toBe(200);
    expect(res.body.surveyId).toBe(zeroSurveyId);
    expect(res.body.totalResponses).toBe(0);

    for (const q of res.body.questions) {
      expect(q.totalAnswered).toBe(0);
      if (q.type === 'SINGLE_CHOICE') {
        for (const opt of q.options) {
          expect(opt.count).toBe(0);
          expect(opt.percentage).toBe(0);
        }
      } else if (q.type === 'RATING') {
        expect(q.averageRating).toBeNull();
        expect(q.distribution).toEqual({
          '1': 0,
          '2': 0,
          '3': 0,
          '4': 0,
          '5': 0,
        });
      }
    }
  });

  // AC-32 / TEST-32: Another owner (owner2) attempting GET /api/surveys/:id/summary of owner1 receives 403 Forbidden
  it('TEST-32 / AC-32: Non-owning OWNER (owner2) attempting summary access receives 403 Forbidden', async () => {
    const res = await request(app)
      .get(`/api/surveys/${populatedSurveyId}/summary`)
      .set('Cookie', owner2Cookie);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  // AC-33 / TEST-33: RESPONDENT (student1) attempting GET /api/surveys/:id/summary receives 403 Forbidden
  it('TEST-33 / AC-33: RESPONDENT attempting summary access receives 403 Forbidden', async () => {
    const res = await request(app)
      .get(`/api/surveys/${populatedSurveyId}/summary`)
      .set('Cookie', student1Cookie);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  // AC-34 / TEST-34: Unit calculation with optional question skipped computes metrics based strictly on actual answer count
  it('TEST-34 / AC-34: calculateSurveySummary calculates strictly on totalAnswered when optional questions are skipped', () => {
    const mockSurvey = {
      id: 'mock-survey-1',
      title: 'Mock Survey with Skipped Optional Questions',
      status: 'PUBLISHED',
      mode: 'IDENTIFIED',
      questions: [
        {
          id: 'q-req-choice',
          text: 'Required Choice',
          type: 'SINGLE_CHOICE',
          required: true,
          options: [
            { id: 'opt-a', text: 'Option A' },
            { id: 'opt-b', text: 'Option B' },
          ],
        },
        {
          id: 'q-opt-rating',
          text: 'Optional Rating Question',
          type: 'RATING',
          required: false,
        },
      ],
    };

    // 2 respondents total, but respondent 2 skipped optional rating question
    const mockResponses = [
      {
        id: 'resp-1',
        answers: [
          { questionId: 'q-req-choice', optionId: 'opt-a' },
          { questionId: 'q-opt-rating', ratingValue: 4 },
        ],
      },
      {
        id: 'resp-2',
        answers: [
          { questionId: 'q-req-choice', optionId: 'opt-b' },
          // q-opt-rating is skipped
        ],
      },
    ];

    const summary = calculateSurveySummary(mockSurvey, mockResponses);

    expect(summary.totalResponses).toBe(2);

    const ratingQ = summary.questions.find((q) => q.questionId === 'q-opt-rating');
    expect(ratingQ).toBeDefined();
    expect(ratingQ?.type).toBe('RATING');
    expect(ratingQ?.totalAnswered).toBe(1);
    expect((ratingQ as any).averageRating).toBe(4);
    expect((ratingQ as any).distribution).toEqual({
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 1,
      '5': 0,
    });
  });

  // Edge Case: Non-existent survey returns 404 NOT_FOUND
  it('Non-existent survey returns 404 NOT_FOUND', async () => {
    const res = await request(app)
      .get('/api/surveys/non-existent-survey-id/summary')
      .set('Cookie', owner1Cookie);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  // Edge Case: Unauthenticated request returns 401 UNAUTHORIZED
  it('Unauthenticated access returns 401 UNAUTHORIZED', async () => {
    const res = await request(app).get(`/api/surveys/${populatedSurveyId}/summary`);

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
