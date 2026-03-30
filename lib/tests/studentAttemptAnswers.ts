import type { TestAnswerSubmission } from '@/lib/api/models/TestAnswerSubmission';
import type { StudentAttemptQuestion } from '@/lib/api/models/StudentAttemptQuestion';
import { questionType } from '@/lib/tests/testUiMappers';

export type AnswerDraft = {
  selectedOptionIds?: string[];
  textAnswer?: string;
};

export function initAnswersFromAttemptQuestions(
  rows: StudentAttemptQuestion[],
): Record<string, AnswerDraft> {
  const out: Record<string, AnswerDraft> = {};
  for (const row of rows) {
    const qid = row.question.id;
    const sa = row.studentAnswer;
    if (sa?.selectedOptionIds && sa.selectedOptionIds.length > 0) {
      out[qid] = { selectedOptionIds: [...sa.selectedOptionIds] };
    } else if (sa?.textAnswer != null && String(sa.textAnswer).trim() !== '') {
      out[qid] = { textAnswer: String(sa.textAnswer) };
    }
  }
  return out;
}

export function isQuestionAnswered(qType: number, draft: AnswerDraft | undefined): boolean {
  if (!draft) return false;
  if (
    qType === questionType.singleChoice ||
    qType === questionType.multipleChoice
  ) {
    return (draft.selectedOptionIds?.length ?? 0) > 0;
  }
  return Boolean(draft.textAnswer?.trim());
}

export function countUnanswered(
  rows: StudentAttemptQuestion[],
  answers: Record<string, AnswerDraft>,
): number {
  return rows.filter(
    (row) => !isQuestionAnswered(row.question.type, answers[row.question.id]),
  ).length;
}

export function buildSubmitPayload(
  rows: StudentAttemptQuestion[],
  answers: Record<string, AnswerDraft>,
): TestAnswerSubmission[] {
  return rows.map(({ question }) => {
    const qid = question.id;
    const a = answers[qid];
    const out: TestAnswerSubmission = { questionId: qid };
    if (a?.selectedOptionIds?.length) out.selectedOptionIds = [...a.selectedOptionIds];
    if (a?.textAnswer != null && String(a.textAnswer).trim() !== '') {
      out.textAnswer = String(a.textAnswer).trim();
    }
    return out;
  });
}
