import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { requireAuth, requireRole, setNoStoreHeaders } from '../auth';
import {
  submitResponsePayloadSchema,
  validateAnswersAgainstQuestions,
  formatZodError,
} from '../validation';

export const responseRouter = Router();

// F-03: POST /api/surveys/:id/responses (AC-20..AC-26, AC-36 / TEST-20..TEST-26, TEST-36, TEST-37)
export async function submitSurveyResponseHandler(req: Request, res: Response) {
  setNoStoreHeaders(res);
  const { id } = req.params;
  const currentUser = req.user!;

  try {
    // 1. Survey missing or DRAFT -> 404 Not Found (AC-22 / TEST-22)
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

    if (!survey || survey.status === 'DRAFT') {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'ไม่พบแบบสอบถามที่ระบุ',
        },
      });
    }

    // 2. Survey is CLOSED -> 409 Conflict (SURVEY_NOT_OPEN) (AC-22 / TEST-22)
    if (survey.status === 'CLOSED') {
      return res.status(409).json({
        error: {
          code: 'SURVEY_NOT_OPEN',
          message: 'แบบสอบถามนี้ปิดรับคำตอบแล้ว',
        },
      });
    }

    // 3. Single-submission check: prevent duplicate participation (BR-01 / AC-21 / TEST-21)
    const existingParticipation = await prisma.surveyParticipation.findUnique({
      where: {
        surveyId_userId: {
          surveyId: id,
          userId: currentUser.id,
        },
      },
    });

    if (existingParticipation) {
      return res.status(409).json({
        error: {
          code: 'ALREADY_SUBMITTED',
          message: 'คุณได้ส่งคำตอบสำหรับแบบสอบถามนี้ไปแล้ว',
        },
      });
    }

    // 4. Validate payload shape with Zod (AC-24, AC-25)
    const parsed = submitResponsePayloadSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'ข้อมูลการส่งคำตอบไม่ถูกต้อง',
          details: formatZodError(parsed.error),
        },
      });
    }

    // 5. Cross-validate answers against survey questions and options (BR-09 / AC-24..AC-26)
    const validationResult = validateAnswersAgainstQuestions(
      survey.questions,
      parsed.data.answers
    );

    if (!validationResult.valid) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'ข้อมูลการตอบคำถามไม่ถูกต้องตามเงื่อนไขของแบบสอบถาม',
          details: validationResult.details,
        },
      });
    }

    // 6. Atomic write: Response, Answers, and SurveyParticipation in a single transaction (AC-20, AC-36, TEST-37)
    const created = await prisma.$transaction(async (tx) => {
      // In ANONYMOUS mode: respondentId is null; in IDENTIFIED: respondentId is currentUser.id (BR-13 / AC-36)
      const responseRecord = await tx.response.create({
        data: {
          surveyId: id,
          respondentId: survey.mode === 'ANONYMOUS' ? null : currentUser.id,
        },
      });

      // Insert answers
      for (const ans of validationResult.normalizedAnswers) {
        await tx.answer.create({
          data: {
            responseId: responseRecord.id,
            questionId: ans.questionId,
            optionId: ans.optionId,
            ratingValue: ans.ratingValue,
          },
        });
      }

      // Record SurveyParticipation to enforce single submission even for anonymous surveys
      await tx.surveyParticipation.create({
        data: {
          surveyId: id,
          userId: currentUser.id,
          responseId: survey.mode === 'ANONYMOUS' ? null : responseRecord.id,
        },
      });

      return await tx.response.findUnique({
        where: { id: responseRecord.id },
        include: {
          answers: true,
        },
      });
    });

    return res.status(201).json(created);
  } catch (error: any) {
    // Catch database unique constraint violation (concurrent submission race condition TEST-37)
    if (error.code === 'P2002') {
      return res.status(409).json({
        error: {
          code: 'ALREADY_SUBMITTED',
          message: 'คุณได้ส่งคำตอบสำหรับแบบสอบถามนี้ไปแล้ว',
        },
      });
    }

    console.error('Failed to submit response:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'เกิดข้อผิดพลาดในการบันทึกคำตอบ',
      },
    });
  }
}

// F-03: GET /api/responses/:id (AC-27, AC-28, AC-29 / TEST-27, TEST-28, TEST-29)
responseRouter.get('/:id', requireAuth, requireRole('RESPONDENT'), async (req: Request, res: Response) => {
  setNoStoreHeaders(res);
  const { id } = req.params;
  const currentUser = req.user!;

  try {
    const response = await prisma.response.findUnique({
      where: { id },
      include: {
        survey: {
          select: {
            id: true,
            title: true,
            description: true,
            mode: true,
          },
        },
        answers: {
          include: {
            question: {
              select: {
                id: true,
                text: true,
                type: true,
                orderIndex: true,
              },
            },
            option: {
              select: {
                id: true,
                text: true,
              },
            },
          },
        },
      },
    });

    if (!response) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'ไม่พบข้อมูลคำตอบที่ระบุ',
        },
      });
    }

    // BR-06 / AC-28: Privacy isolation - student cannot view another respondent's response
    // Also if respondentId is null (ANONYMOUS mode), access is forbidden
    if (!response.respondentId || response.respondentId !== currentUser.id) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'คุณไม่มีสิทธิ์เข้าถึงคำตอบนี้',
        },
      });
    }

    // Sort answers by question orderIndex
    response.answers.sort((a, b) => (a.question?.orderIndex ?? 0) - (b.question?.orderIndex ?? 0));

    return res.status(200).json(response);
  } catch (error) {
    console.error('Failed to get response details:', error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'เกิดข้อผิดพลาดในการดึงข้อมูลคำตอบ',
      },
    });
  }
});
