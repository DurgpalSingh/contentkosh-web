import { MCQ_MIN_OPTIONS } from '@/lib/tests/testConstants'
import { questionType } from '@/lib/tests/testUiMappers'

export type QuestionFormErrors = {
  questionText?: string
  questionType?: string
  options?: string
  correctOption?: string
  correctAnswer?: string
}

/**
 * Mirrors server `getMeaningfulTextLength` in `sanitizeHtml.ts`:
 * visible text after tags, plus LaTeX from `data-latex` (TipTap math nodes).
 */
export function getRichTextMeaningfulLength(html: string): number {
  const textFromTags = html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const latexParts = [...html.matchAll(/data-latex="([^"]*)"/g)]
    .map((m) => m[1])
    .join(' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const combined = `${textFromTags} ${latexParts}`.replace(/\s+/g, ' ').trim();
  return combined.length;
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

  if (getRichTextMeaningfulLength(state.questionText) === 0) {
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
      errors.correctOption = 'Please select at least one correct option.'
    }
  }

  const isTextAnswer =
    state.questionTypeValue === questionType.trueFalse ||
    state.questionTypeValue === questionType.numerical ||
    state.questionTypeValue === questionType.fillInTheBlank

  if (isTextAnswer && !state.correctText.trim()) {
    errors.correctAnswer = 'Correct answer is required'
  }

  if (
    state.questionTypeValue === questionType.numerical &&
    state.correctText.trim() &&
    !Number.isFinite(Number(state.correctText.trim()))
  ) {
    errors.correctAnswer = 'Enter a valid number for the correct answer.'
  }

  return errors
}
