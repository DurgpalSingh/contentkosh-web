import { useCallback, useEffect, useState } from 'react'
import type { CreateQuestionDTO } from '@/lib/api'
import { questionType } from '@/lib/tests/testUiMappers'
import type { TeacherTestQuestion } from '@/lib/tests/teacherQuestionTypes'

const createOptionId = (): string => crypto.randomUUID()

export type QuestionOptionRow = { id: string; text: string }

export type TeacherQuestionFormPayload = Omit<CreateQuestionDTO, 'correctOptionIdsAnswers'> & {
  explanation?: string
  /** 1-based indices into the submitted options array (API contract; backend resolves to option ids). */
  correctOptionIdsAnswers?: Array<number | string>
}

const defaultOptions = (): QuestionOptionRow[] => [
  { id: createOptionId(), text: '' },
  { id: createOptionId(), text: '' },
]

const emptyMultiCorrect = (): Record<string, boolean> => ({})

/** 1-based position of an option row in the submitted (non-empty) options list. */
const toOneBasedOptionIndex = (optionId: string, cleanedOptions: QuestionOptionRow[]): number => {
  const zeroBased = cleanedOptions.findIndex((o) => o.id === optionId)
  if (zeroBased < 0) {
    throw new Error('Could not resolve selected option position')
  }
  return zeroBased + 1
}

type McqMode = 'single' | 'multiple'

const buildMcqPayload = (
  base: TeacherQuestionFormPayload,
  mode: McqMode,
  optionRows: QuestionOptionRow[],
  correctSingleId: string,
  correctMultiIds: Record<string, boolean>,
): TeacherQuestionFormPayload => {
  const cleaned = optionRows.filter((o) => o.text.trim())
  if (cleaned.length < 2) {
    throw new Error('Add at least two options')
  }
  const withOptions: TeacherQuestionFormPayload = {
    ...base,
    options: cleaned.map((o) => ({ id: o.id, text: o.text.trim() })),
  }
  if (mode === 'single') {
    if (!correctSingleId) throw new Error('Select the correct option')
    return {
      ...withOptions,
      correctOptionIdsAnswers: [toOneBasedOptionIndex(correctSingleId, cleaned)],
    }
  }
  const selectedOptionIds = Object.entries(correctMultiIds)
    .filter(([, v]) => v)
    .map(([k]) => k)
  if (selectedOptionIds.length < 1) throw new Error('Select at least one correct option')
  const oneBasedSorted = selectedOptionIds
    .map((id) => toOneBasedOptionIndex(id, cleaned))
    .sort((a, b) => a - b)
  return { ...withOptions, correctOptionIdsAnswers: oneBasedSorted }
}

const buildTrueFalsePayload = (
  base: TeacherQuestionFormPayload,
  correctTextValue: string,
): TeacherQuestionFormPayload => ({
  ...base,
  correctTextAnswer: correctTextValue === 'true' ? 'true' : 'false',
})

const buildTextAnswerPayload = (
  base: TeacherQuestionFormPayload,
  correctTextValue: string,
): TeacherQuestionFormPayload => {
  const t = correctTextValue.trim()
  if (!t) throw new Error('Enter the correct answer')
  return { ...base, correctTextAnswer: t }
}

export const useTeacherQuestionForm = (
  isOpen: boolean,
  initialQuestion: TeacherTestQuestion | null,
) => {
  const [questionTypeValue, setQuestionTypeValue] = useState<number>(questionType.singleChoice)
  const [questionText, setQuestionText] = useState('')
  const [explanation, setExplanation] = useState('')
  const [options, setOptions] = useState<QuestionOptionRow[]>(defaultOptions)
  const [correctSingleId, setCorrectSingleId] = useState('')
  const [correctMultiIds, setCorrectMultiIds] = useState<Record<string, boolean>>(emptyMultiCorrect)
  const [correctText, setCorrectText] = useState('')

  useEffect(() => {
    if (!isOpen) return

    if (!initialQuestion) {
      setQuestionTypeValue(questionType.singleChoice)
      setQuestionText('')
      setExplanation('')
      setOptions(defaultOptions())
      setCorrectSingleId('')
      setCorrectMultiIds(emptyMultiCorrect())
      setCorrectText('')
      return
    }

    const q = initialQuestion
    const qt = typeof q.type === 'number' ? q.type : 0
    setQuestionTypeValue(qt)
    setQuestionText(q.questionText ?? q.text ?? '')
    setExplanation(q.explanation ?? '')

    const opts = q.options ?? []
    if (opts.length >= 2) {
      setOptions(
        opts.map((o) => ({
          id: o.id ?? createOptionId(),
          text: o.text ?? '',
        })),
      )
    } else {
      setOptions(defaultOptions())
    }

    const correctIds = q.correctOptionIdsAnswers ?? []
    if (qt === questionType.singleChoice) {
      setCorrectSingleId(correctIds[0] ?? '')
      setCorrectMultiIds(emptyMultiCorrect())
    } else if (qt === questionType.multipleChoice) {
      setCorrectSingleId('')
      const next: Record<string, boolean> = {}
      for (const id of correctIds) {
        next[id] = true
      }
      setCorrectMultiIds(next)
    } else {
      setCorrectSingleId('')
      setCorrectMultiIds(emptyMultiCorrect())
    }

    const cta = q.correctTextAnswer
    if (qt === questionType.trueFalse) {
      setCorrectText(cta === 'true' ? 'true' : 'false')
    } else if (qt === questionType.numerical || qt === questionType.fillInTheBlank) {
      setCorrectText(cta ?? '')
    } else {
      setCorrectText('')
    }
  }, [isOpen, initialQuestion])

  const buildPayload = useCallback((): TeacherQuestionFormPayload => {
    const trimmedExplanation = explanation.trim()
    const base: TeacherQuestionFormPayload = {
      type: questionTypeValue,
      questionText: questionText.trim(),
      ...(trimmedExplanation ? { explanation: trimmedExplanation } : {}),
    }

    switch (questionTypeValue) {
      case questionType.singleChoice:
        return buildMcqPayload(base, 'single', options, correctSingleId, correctMultiIds)
      case questionType.multipleChoice:
        return buildMcqPayload(base, 'multiple', options, correctSingleId, correctMultiIds)
      case questionType.trueFalse:
        return buildTrueFalsePayload(base, correctText)
      default:
        return buildTextAnswerPayload(base, correctText)
    }
  }, [
    correctMultiIds,
    correctSingleId,
    correctText,
    explanation,
    options,
    questionText,
    questionTypeValue,
  ])

  const toggleMulti = useCallback((id: string) => {
    setCorrectMultiIds((m) => ({ ...m, [id]: !m[id] }))
  }, [])

  const addOption = useCallback(() => {
    setOptions((o) => [...o, { id: createOptionId(), text: '' }])
  }, [])

  const removeOption = useCallback((id: string) => {
    setOptions((o) => (o.length <= 2 ? o : o.filter((x) => x.id !== id)))
  }, [])

  const updateOptionText = useCallback((id: string, text: string) => {
    setOptions((list) => list.map((x) => (x.id === id ? { ...x, text } : x)))
  }, [])

  return {
    questionTypeValue,
    setQuestionTypeValue,
    questionText,
    setQuestionText,
    explanation,
    setExplanation,
    options,
    correctSingleId,
    setCorrectSingleId,
    correctMultiIds,
    correctText,
    setCorrectText,
    toggleMulti,
    addOption,
    removeOption,
    updateOptionText,
    buildPayload,
  }
}
