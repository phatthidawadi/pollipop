import { z, ZodError } from 'zod';

export interface ValidationErrorDetail {
  field: string;
  message: string;
}

export function formatZodError(error: ZodError): ValidationErrorDetail[] {
  return error.issues.map((issue) => ({
    field: issue.path.join('.') || 'root',
    message: issue.message,
  }));
}

export const loginSchema = z.object({
  email: z
    .string({
      required_error: 'กรุณากรอกอีเมล',
      invalid_type_error: 'รูปแบบอีเมลไม่ถูกต้อง',
    })
    .trim()
    .min(1, 'กรุณากรอกอีเมล')
    .email('รูปแบบอีเมลไม่ถูกต้อง'),
  password: z
    .string({
      required_error: 'กรุณากรอกรหัสผ่าน',
      invalid_type_error: 'กรุณากรอกรหัสผ่าน',
    })
    .min(1, 'กรุณากรอกรหัสผ่าน'),
});

export const questionInputSchema = z
  .object({
    text: z
      .string({
        required_error: 'กรุณากรอกข้อความคำถาม',
        invalid_type_error: 'ข้อความคำถามต้องเป็นตัวอักษร',
      })
      .trim()
      .min(1, 'ข้อความคำถามต้องไม่ว่างเปล่า')
      .max(500, 'ข้อความคำถามต้องมีความยาวไม่เกิน 500 ตัวอักษร'),
    type: z.enum(['SINGLE_CHOICE', 'RATING'], {
      required_error: 'กรุณาระบุประเภทคำถาม',
      invalid_type_error: 'ประเภทคำถามต้องเป็น SINGLE_CHOICE หรือ RATING เท่านั้น',
      message: 'ประเภทคำถามต้องเป็น SINGLE_CHOICE หรือ RATING เท่านั้น',
    }),
    required: z
      .boolean({
        invalid_type_error: 'ค่า required ต้องเป็น boolean',
      })
      .optional()
      .default(true),
    options: z
      .array(
        z
          .string({
            required_error: 'กรุณากรอกข้อความตัวเลือก',
            invalid_type_error: 'ข้อความตัวเลือกต้องเป็นตัวอักษร',
          })
          .trim()
          .min(1, 'ข้อความตัวเลือกต้องไม่ว่างเปล่า')
          .max(200, 'ข้อความตัวเลือกต้องยาวไม่เกิน 200 ตัวอักษร')
      )
      .optional(),
  })
  .superRefine((q, ctx) => {
    if (q.type === 'SINGLE_CHOICE') {
      if (!q.options || q.options.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['options'],
          message: 'คำถามแบบตัวเลือกเดียวต้องมีตัวเลือกอย่างน้อย 2 ตัวเลือก',
        });
      } else if (q.options.length > 10) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['options'],
          message: 'คำถามแบบตัวเลือกเดียวมีตัวเลือกได้ไม่เกิน 10 ตัวเลือก',
        });
      }
    }
  });

export const createSurveySchema = z.object({
  title: z
    .string({
      required_error: 'กรุณากรอกชื่อแบบสอบถาม',
      invalid_type_error: 'ชื่อแบบสอบถามต้องเป็นตัวอักษร',
    })
    .trim()
    .min(1, 'ชื่อแบบสอบถามต้องมีความยาวอย่างน้อย 1 ตัวอักษร')
    .max(200, 'ชื่อแบบสอบถามต้องมีความยาวไม่เกิน 200 ตัวอักษร'),
  description: z
    .string({
      invalid_type_error: 'คำอธิบายต้องเป็นตัวอักษร',
    })
    .trim()
    .max(1000, 'คำอธิบายต้องมีความยาวไม่เกิน 1000 ตัวอักษร')
    .nullable()
    .optional(),
  mode: z
    .enum(['IDENTIFIED', 'ANONYMOUS'], {
      invalid_type_error: 'โหมดแบบสอบถามต้องเป็น IDENTIFIED หรือ ANONYMOUS',
      message: 'โหมดแบบสอบถามต้องเป็น IDENTIFIED หรือ ANONYMOUS',
    })
    .optional()
    .default('IDENTIFIED'),
  questions: z
    .array(questionInputSchema, {
      required_error: 'กรุณาเพิ่มคำถามอย่างน้อย 1 ข้อ',
      invalid_type_error: 'รายการคำถามต้องเป็น Array',
    })
    .min(1, 'แบบสอบถามต้องมีคำถามอย่างน้อย 1 ข้อ')
    .max(50, 'แบบสอบถามมีคำถามได้ไม่เกิน 50 ข้อ'),
});

export const submitResponsePayloadSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z
        .string({
          required_error: 'กรุณาระบุรหัสคำถาม (questionId)',
        })
        .min(1, 'กรุณาระบุรหัสคำถาม (questionId)'),
      optionId: z.string().nullable().optional(),
      ratingValue: z.number().nullable().optional(),
    }),
    {
      required_error: 'กรุณาส่งรายการคำตอบ (answers)',
      invalid_type_error: 'รายการคำตอบต้องเป็น Array',
    }
  ),
});

export interface SurveyQuestionWithOptions {
  id: string;
  text: string;
  type: string;
  required: boolean;
  options: { id: string; text: string }[];
}

export interface NormalizedAnswerInput {
  questionId: string;
  optionId: string | null;
  ratingValue: number | null;
}

export function validateAnswersAgainstQuestions(
  questions: SurveyQuestionWithOptions[],
  rawAnswers: { questionId: string; optionId?: string | null; ratingValue?: number | null }[]
): { valid: true; normalizedAnswers: NormalizedAnswerInput[] } | { valid: false; details: ValidationErrorDetail[] } {
  const details: ValidationErrorDetail[] = [];
  const questionMap = new Map(questions.map((q) => [q.id, q]));
  const answerByQuestionId = new Map<
    string,
    { index: number; optionId?: string | null; ratingValue?: number | null }
  >();

  rawAnswers.forEach((ans, idx) => {
    const q = questionMap.get(ans.questionId);
    if (!q) {
      details.push({
        field: `answers.${idx}.questionId`,
        message: 'ไม่พบคำถามที่ระบุในแบบสอบถามนี้',
      });
      return;
    }
    if (answerByQuestionId.has(ans.questionId)) {
      details.push({
        field: `answers.${idx}.questionId`,
        message: 'ห้ามส่งคำตอบซ้ำในคำถามข้อเดียวกัน',
      });
      return;
    }
    answerByQuestionId.set(ans.questionId, { index: idx, ...ans });
  });

  const normalizedAnswers: NormalizedAnswerInput[] = [];

  for (const q of questions) {
    const submitted = answerByQuestionId.get(q.id);
    const hasOption = submitted?.optionId !== undefined && submitted?.optionId !== null && submitted?.optionId !== '';
    const hasRating = submitted?.ratingValue !== undefined && submitted?.ratingValue !== null;

    if (!hasOption && !hasRating) {
      if (q.required) {
        details.push({
          field: submitted ? `answers.${submitted.index}` : `questions.${q.id}`,
          message: `กรุณาตอบคำถามข้อบังคับ: "${q.text}"`,
        });
      }
      // For required: false, skipping or sending null is allowed (BR-09 / DEC-04)
      continue;
    }

    if (q.type === 'SINGLE_CHOICE') {
      if (!hasOption || typeof submitted?.optionId !== 'string') {
        details.push({
          field: `answers.${submitted?.index ?? 0}.optionId`,
          message: 'กรุณาเลือกตัวเลือกสำหรับคำถามแบบตัวเลือกเดียว',
        });
        continue;
      }
      const validOptionIds = new Set(q.options.map((opt) => opt.id));
      if (!validOptionIds.has(submitted.optionId)) {
        details.push({
          field: `answers.${submitted.index}.optionId`,
          message: 'ตัวเลือกที่ระบุไม่ตรงกับคำถามข้อนี้',
        });
        continue;
      }
      normalizedAnswers.push({
        questionId: q.id,
        optionId: submitted.optionId,
        ratingValue: null,
      });
    } else if (q.type === 'RATING') {
      const rating = submitted?.ratingValue;
      if (typeof rating !== 'number' || !Number.isInteger(rating) || rating < 1 || rating > 5) {
        details.push({
          field: `answers.${submitted?.index ?? 0}.ratingValue`,
          message: 'คะแนนความพึงพอใจต้องเป็นจำนวนเต็มตั้งแต่ 1 ถึง 5 เท่านั้น',
        });
        continue;
      }
      normalizedAnswers.push({
        questionId: q.id,
        optionId: null,
        ratingValue: rating,
      });
    }
  }

  if (details.length > 0) {
    return { valid: false, details };
  }

  return { valid: true, normalizedAnswers };
}

