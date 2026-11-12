export interface ChoiceOptionSummary {
  optionId: string;
  text: string;
  count: number;
  percentage: number;
}

export interface SingleChoiceQuestionSummary {
  questionId: string;
  text: string;
  type: 'SINGLE_CHOICE';
  required: boolean;
  totalAnswered: number;
  options: ChoiceOptionSummary[];
}

export interface RatingQuestionSummary {
  questionId: string;
  text: string;
  type: 'RATING';
  required: boolean;
  totalAnswered: number;
  averageRating: number | null;
  distribution: {
    '1': number;
    '2': number;
    '3': number;
    '4': number;
    '5': number;
  };
}

export type QuestionSummary = SingleChoiceQuestionSummary | RatingQuestionSummary;

export interface SurveySummaryResult {
  surveyId: string;
  title: string;
  status: string;
  mode: string;
  totalResponses: number;
  questions: QuestionSummary[];
}

export interface OptionInput {
  id: string;
  text: string;
  orderIndex?: number;
}

export interface QuestionInput {
  id: string;
  text: string;
  type: string;
  required: boolean;
  orderIndex?: number;
  options?: OptionInput[];
}

export interface AnswerInput {
  questionId: string;
  optionId?: string | null;
  ratingValue?: number | null;
}

export interface ResponseInput {
  id?: string;
  answers?: AnswerInput[];
}

export interface SurveyInput {
  id: string;
  title: string;
  status: string;
  mode: string;
  questions: QuestionInput[];
  responses?: ResponseInput[];
}

/**
 * Computes aggregate summary metrics for a survey (F-04 / FR-10, BR-10 / AC-30..AC-34).
 * Protects against division-by-zero when totalResponses === 0 or totalAnswered === 0.
 */
export function calculateSurveySummary(
  survey: SurveyInput,
  externalResponses?: ResponseInput[]
): SurveySummaryResult {
  const responses = externalResponses ?? survey.responses ?? [];
  const totalResponses = responses.length;

  // Flatten all answers from all responses
  const allAnswers: AnswerInput[] = [];
  for (const resp of responses) {
    if (resp.answers && Array.isArray(resp.answers)) {
      for (const ans of resp.answers) {
        allAnswers.push(ans);
      }
    }
  }

  // Sort questions by orderIndex ascending
  const sortedQuestions = [...(survey.questions ?? [])].sort(
    (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)
  );

  const questionSummaries: QuestionSummary[] = sortedQuestions.map((q) => {
    const questionAnswers = allAnswers.filter((a) => a.questionId === q.id);

    if (q.type === 'SINGLE_CHOICE') {
      const validAnswers = questionAnswers.filter(
        (a) => a.optionId !== undefined && a.optionId !== null && a.optionId !== ''
      );
      const totalAnswered = validAnswers.length;

      const sortedOptions = [...(q.options ?? [])].sort(
        (a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)
      );

      const optionSummaries: ChoiceOptionSummary[] = sortedOptions.map((opt) => {
        const count = validAnswers.filter((a) => a.optionId === opt.id).length;
        const percentage =
          totalAnswered > 0 ? Number(((count / totalAnswered) * 100).toFixed(2)) : 0;
        return {
          optionId: opt.id,
          text: opt.text,
          count,
          percentage,
        };
      });

      return {
        questionId: q.id,
        text: q.text,
        type: 'SINGLE_CHOICE',
        required: q.required,
        totalAnswered,
        options: optionSummaries,
      };
    } else {
      // RATING question
      const validAnswers = questionAnswers.filter(
        (a) =>
          typeof a.ratingValue === 'number' &&
          Number.isInteger(a.ratingValue) &&
          a.ratingValue >= 1 &&
          a.ratingValue <= 5
      );
      const totalAnswered = validAnswers.length;

      const distribution: { '1': number; '2': number; '3': number; '4': number; '5': number } = {
        '1': 0,
        '2': 0,
        '3': 0,
        '4': 0,
        '5': 0,
      };

      let sumRatings = 0;
      for (const ans of validAnswers) {
        const rating = ans.ratingValue as 1 | 2 | 3 | 4 | 5;
        const key = String(rating) as '1' | '2' | '3' | '4' | '5';
        distribution[key] += 1;
        sumRatings += rating;
      }

      // AC-31: If 0 responses / 0 answered, averageRating is null (no division by zero)
      const averageRating =
        totalAnswered > 0 ? Number((sumRatings / totalAnswered).toFixed(2)) : null;

      return {
        questionId: q.id,
        text: q.text,
        type: 'RATING',
        required: q.required,
        totalAnswered,
        averageRating,
        distribution,
      };
    }
  });

  return {
    surveyId: survey.id,
    title: survey.title,
    status: survey.status,
    mode: survey.mode,
    totalResponses,
    questions: questionSummaries,
  };
}
