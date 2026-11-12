import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { requireAuth, requireRole, setNoStoreHeaders } from '../auth';
import { createSurveySchema, formatZodError } from '../validation';
import { submitSurveyResponseHandler } from './response.routes';

export const surveyRouter = Router();

// F-02: POST /api/surveys (AC-09, AC-10, AC-11, AC-12, AC-13 / TEST-09..TEST-13)
surveyRouter.post('/', requireAuth, requireRole('OWNER'), async (req: Request, res: Response) => {
  setNoStoreHeaders(res);

  const parsed = createSurveySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'ข้อมูลการสร้างแบบสอบถามไม่ถูกต้อง',
        details: formatZodError(parsed.error),
      },
    });
  }

  const { title, description, mode, questions } = parsed.data;
  const ownerId = req.user!.id;

  try {
    const survey = await prisma.$transaction(async (tx) => {
      const createdSurvey = await tx.survey.create({
        data: {
          title,
          description: description || null,
          mode: mode || 'IDENTIFIED',
          status: 'DRAFT',
          ownerId,
        },
      });

      for (let qIdx = 0; qIdx < questions.length; qIdx++) {
        const q = questions[qIdx];
        const createdQuestion = await tx.question.create({
          data: {
            surveyId: createdSurvey.id,
            text: q.text,
            type: q.type,
            required: q.required ?? true,
            orderIndex: qIdx,
          },
        });

        if (q.type === 'SINGLE_CHOICE' && q.options && q.options.length > 0) {
          for (let optIdx = 0; optIdx < q.options.length; optIdx++) {
            await tx.choiceOption.create({
              data: {
                questionId: createdQuestion.id,
                text: q.options[optIdx],
                orderIndex: optIdx,
              },
            });
          }
        }
      }

      return await tx.survey.findUnique({
        where: { id: createdSurvey.id },
        include: {
          questions: {
            include: { options: { orderBy: { orderIndex: 'asc' } } },
            orderBy: { orderIndex: 'asc' },
          },
        },
      });
    });

    return res.status(201).json(survey);
  } catch (error) {
    console.error('Failed to create survey:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'เกิดข้อผิดพลาดในการสร้างแบบสอบถาม',
      },
    });
  }
});

// F-02: GET /api/surveys (AC-17, AC-18 / TEST-17, TEST-18)
surveyRouter.get('/', requireAuth, async (req: Request, res: Response) => {
  setNoStoreHeaders(res);
  const currentUser = req.user!;

  try {
    if (currentUser.role === 'OWNER') {
      const surveys = await prisma.survey.findMany({
        where: { ownerId: currentUser.id },
        include: {
          _count: {
            select: { responses: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const result = surveys.map((s) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        status: s.status,
        mode: s.mode,
        createdAt: s.createdAt,
        responseCount: s._count.responses,
      }));

      return res.status(200).json(result);
    } else {
      // RESPONDENT: PUBLISHED and CLOSED surveys with participation annotation (AC-18 / DEC-06)
      const surveys = await prisma.survey.findMany({
        where: { status: { in: ['PUBLISHED', 'CLOSED'] } },
        include: {
          participations: {
            where: { userId: currentUser.id },
          },
          responses: {
            where: { respondentId: currentUser.id },
            select: { id: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const result = surveys.map((s) => {
        const hasParticipated = s.participations.length > 0 || s.responses.length > 0;
        const responseId = s.responses.length > 0 ? s.responses[0].id : null;

        return {
          id: s.id,
          title: s.title,
          description: s.description,
          status: s.status,
          mode: s.mode,
          createdAt: s.createdAt,
          answered: hasParticipated,
          responseId,
        };
      });

      return res.status(200).json(result);
    }
  } catch (error) {
    console.error('Failed to list surveys:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'เกิดข้อผิดพลาดในการดึงรายการแบบสอบถาม',
      },
    });
  }
});

// F-02: GET /api/surveys/:id (AC-16, AC-19 / TEST-16, TEST-19)
surveyRouter.get('/:id', requireAuth, async (req: Request, res: Response) => {
  setNoStoreHeaders(res);
  const { id } = req.params;
  const currentUser = req.user!;

  try {
    const survey = await prisma.survey.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            options: { orderBy: { orderIndex: 'asc' } },
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!survey) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'ไม่พบแบบสอบถามที่ระบุ',
        },
      });
    }

    if (currentUser.role === 'OWNER') {
      if (survey.ownerId !== currentUser.id) {
        return res.status(403).json({
          error: {
            code: 'FORBIDDEN',
            message: 'คุณไม่มีสิทธิ์เข้าถึงแบบสอบถามนี้',
          },
        });
      }
      return res.status(200).json(survey);
    } else {
      // RESPONDENT: Hide DRAFT surveys (BR-07 / AC-19)
      if (survey.status === 'DRAFT') {
        return res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: 'ไม่พบแบบสอบถามที่ระบุ',
          },
        });
      }
      return res.status(200).json(survey);
    }
  } catch (error) {
    console.error('Failed to get survey details:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'เกิดข้อผิดพลาดในการดึงรายละเอียดแบบสอบถาม',
      },
    });
  }
});

// F-02: POST /api/surveys/:id/publish (AC-14, AC-15, AC-16 / TEST-14..TEST-16)
surveyRouter.post('/:id/publish', requireAuth, requireRole('OWNER'), async (req: Request, res: Response) => {
  setNoStoreHeaders(res);
  const { id } = req.params;
  const currentUser = req.user!;

  try {
    const survey = await prisma.survey.findUnique({
      where: { id },
    });

    if (!survey) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'ไม่พบแบบสอบถามที่ระบุ',
        },
      });
    }

    if (survey.ownerId !== currentUser.id) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'คุณไม่มีสิทธิ์เผยแพร่แบบสอบถามนี้',
        },
      });
    }

    if (survey.status !== 'DRAFT') {
      return res.status(409).json({
        error: {
          code: 'INVALID_STATE_TRANSITION',
          message: 'แบบสอบถามต้องอยู่ในสถานะฉบับร่าง (DRAFT) ก่อนทำการเผยแพร่',
        },
      });
    }

    const updated = await prisma.survey.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
      include: {
        questions: {
          include: { options: { orderBy: { orderIndex: 'asc' } } },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    return res.status(200).json(updated);
  } catch (error) {
    console.error('Failed to publish survey:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'เกิดข้อผิดพลาดในการเผยแพร่แบบสอบถาม',
      },
    });
  }
});

// F-02: POST /api/surveys/:id/close (AC-22, AC-35 / TEST-22, TEST-35)
surveyRouter.post('/:id/close', requireAuth, requireRole('OWNER'), async (req: Request, res: Response) => {
  setNoStoreHeaders(res);
  const { id } = req.params;
  const currentUser = req.user!;

  try {
    const survey = await prisma.survey.findUnique({
      where: { id },
    });

    if (!survey) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'ไม่พบแบบสอบถามที่ระบุ',
        },
      });
    }

    if (survey.ownerId !== currentUser.id) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'คุณไม่มีสิทธิ์ปิดรับคำตอบแบบสอบถามนี้',
        },
      });
    }

    if (survey.status !== 'PUBLISHED') {
      return res.status(409).json({
        error: {
          code: 'INVALID_STATE_TRANSITION',
          message: 'แบบสอบถามต้องอยู่ในสถานะเผยแพร่ (PUBLISHED) ก่อนทำการปิดรับคำตอบ',
        },
      });
    }

    const updated = await prisma.survey.update({
      where: { id },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
      },
      include: {
        questions: {
          include: { options: { orderBy: { orderIndex: 'asc' } } },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    return res.status(200).json(updated);
  } catch (error) {
    console.error('Failed to close survey:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'เกิดข้อผิดพลาดในการปิดรับคำตอบแบบสอบถาม',
      },
    });
  }
});

// F-03: POST /api/surveys/:id/responses (AC-20..AC-26, AC-36 / TEST-20..TEST-26, TEST-36, TEST-37)
surveyRouter.post('/:id/responses', requireAuth, requireRole('RESPONDENT'), submitSurveyResponseHandler);


