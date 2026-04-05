import { MCQ_MIN_OPTIONS } from '@/lib/tests/testConstants'
import { questionType } from '@/lib/tests/testUiMappers'
import type { QuestionOptionRow } from './useTeacherQuestionForm'

export type QuestionFormErrors = {
  questionText?: string
  questionType?: string
  options?: string
  correctOption?: string
  correctAnswer?: string
}

function getMeaningfulTextLength(input: string): number {
  // Approximate server-side "empty after sanitization" check:
  // strip tags and normalize whitespace.
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim().length
}

export function validateQuestionForm(state: {
  questionTypeValue: number | null
  questionText: string
  options: Array<{ text: string }>
  correctSingleId: string
  correctMultiIds: Record<string, boolean>
  correctText: string
}): QuestionFormErrors {
  const errors: QuestionFormErrors = {}

  if (getMeaningfulTextLength(state.questionText) === 0) {
    errors.questionText = 'Question text is required'
  }

  if (state.questionTypeValue === null) {
    errors.questionType = 'Question type is required'
    return errors
  }

  const isMcq =
    state.questionTypeValue === questionType.singleChoice ||
    state.questionTypeValue === questionType.multipleChoice

  if (isMcq) {
    const filled = state.options.filter((o) => o.text.trim())
    if (filled.length < MCQ_MIN_OPTIONS) {
      errors.options = `MCQ questions require at least ${MCQ_MIN_OPTIONS} options`
    }

    const hasCorrect =
      state.questionTypeValue === questionType.singleChoice
        ? !!state.correctSingleId
        : Object.values(state.correctMultiIds).some(Boolean)

    if (!hasCorrect) {
      errors.correctOption = 'At least one correct option must be selected'
    }
  }

  const isTextAnswer =
    state.questionTypeValue === questionType.trueFalse ||
    state.questionTypeValue === questionType.numerical ||
    state.questionTypeValue === questionType.fillInTheBlank

  if (isTextAnswer && !state.correctText.trim()) {
    errors.correctAnswer = 'Correct answer is required'
  }

  return errors
}
