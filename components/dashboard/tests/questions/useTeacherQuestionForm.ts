import { useCallback, useEffect, useState } from 'react'
import type { CreateQuestionDTO } from '@/lib/api'
import { questionType } from '@/lib/tests/testUiMappers'
import type { TeacherTestQuestion } from '@/lib/tests/teacherQuestionTypes'
import { resolveMediaUrl } from '@/lib/resolveMediaUrl'

const createOptionId = (): string => crypto.randomUUID()

export type QuestionOptionRow = {
  id: string
  text: string
  /** Existing persisted image URL (comes from the server on edit) */
  existingMediaUrl?: string | null
  /** New file picked by the user — not yet uploaded */
  imageFile?: File | null
  /** True when user explicitly clicked "remove image" for this option */
  removeImage?: boolean
}

export type TeacherQuestionFormPayload = Omit<CreateQuestionDTO, 'correctOptionIdsAnswers'> & {
  explanation?: string
  /** 1-based indices into the submitted options array (API contract; backend resolves to option ids). */
  correctOptionIdsAnswers?: Array<number | string>
}

/**
 * Full build result — the JSON payload plus any image files that need to be
 * sent as separate multipart/form-data fields.
 */
export type QuestionFormBuildResult = {
  payload: TeacherQuestionFormPayload
  questionImageFile: File | null
  removeQuestionImage: boolean
  /** Keyed by option index (0-based) in the *cleaned* (non-empty) options list */
  optionImageFiles: Record<number, File>
  /** Keyed by option index — true means the user wants the existing image removed */
  removeOptionImages: Record<number, boolean>
}

const defaultOptions = (): QuestionOptionRow[] => [
  { id: createOptionId(), text: '' },
  { id: createOptionId(), text: '' },
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
    options: cleaned.map((o) => ({
      id: o.id,
      text: o.text.trim(),
      // Pass existing mediaUrl so the backend knows what already exists
      ...(o.existingMediaUrl !== undefined ? { mediaUrl: o.existingMediaUrl ?? undefined } : {}),
    })),
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

  // ── Image state ──────────────────────────────────────────────────────────
  /** New question-level image file picked by the user */
  const [questionImageFile, setQuestionImageFile] = useState<File | null>(null)
  /** Preview URL for the new file (blob URL) or the existing server URL */
  const [questionImagePreview, setQuestionImagePreview] = useState<string | null>(null)
  /** True when the user has explicitly removed the existing question image */
  const [removeQuestionImage, setRemoveQuestionImage] = useState(false)

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
      setQuestionImageFile(null)
      setQuestionImagePreview(null)
      setRemoveQuestionImage(false)
      return
    }

    const q = initialQuestion
    const qt = typeof q.type === 'number' ? q.type : 0
    setQuestionTypeValue(qt)
    setQuestionText(q.questionText ?? q.text ?? '')
    setExplanation(q.explanation ?? '')

    // Restore question-level image — resolve the server path to a full URL for the preview
    setQuestionImageFile(null)
    setQuestionImagePreview(resolveMediaUrl(q.mediaUrl ?? null))
    setRemoveQuestionImage(false)

    const opts = q.options ?? []
    if (opts.length >= 2) {
      setOptions(
        opts.map((o) => ({
          id: o.id ?? createOptionId(),
          text: o.text ?? '',
          existingMediaUrl: o.mediaUrl ?? null,
          imageFile: null,
          removeImage: false,
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

  // ── Question image handlers ───────────────────────────────────────────────
  const handleQuestionImageChange = useCallback((file: File | null) => {
    if (file) {
      setQuestionImageFile(file)
      setQuestionImagePreview(URL.createObjectURL(file))
      setRemoveQuestionImage(false)
    }
  }, [])

  const handleRemoveQuestionImage = useCallback(() => {
    setQuestionImageFile(null)
    setQuestionImagePreview(null)
    setRemoveQuestionImage(true)
  }, [])

  // ── Option image handlers ────────────────────────────────────────────────
  const handleOptionImageChange = useCallback((optionId: string, file: File | null) => {
    if (!file) return
    setOptions((list) =>
      list.map((o) =>
        o.id === optionId
          ? {
              ...o,
              imageFile: file,
              existingMediaUrl: o.existingMediaUrl, // keep for cleanup reference
              removeImage: false,
            }
          : o,
      ),
    )
  }, [])

  const handleRemoveOptionImage = useCallback((optionId: string) => {
    setOptions((list) =>
      list.map((o) =>
        o.id === optionId
          ? { ...o, imageFile: null, existingMediaUrl: null, removeImage: true }
          : o,
      ),
    )
  }, [])

  // ── Payload builder ──────────────────────────────────────────────────────
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

  /**
   * Builds the full submission result: JSON payload + image files.
   * The modals use this to decide whether to send JSON or multipart/form-data.
   */
  const buildSubmitData = useCallback((): QuestionFormBuildResult => {
    const payload = buildPayload()
    const cleanedOptions = options.filter((o) => o.text.trim())

    const optionImageFiles: Record<number, File> = {}
    const removeOptionImages: Record<number, boolean> = {}

    cleanedOptions.forEach((opt, idx) => {
      if (opt.imageFile) {
        optionImageFiles[idx] = opt.imageFile
      } else if (opt.removeImage) {
        removeOptionImages[idx] = true
      }
    })

    return {
      payload,
      questionImageFile,
      removeQuestionImage,
      optionImageFiles,
      removeOptionImages,
    }
  }, [buildPayload, options, questionImageFile, removeQuestionImage])

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
    // Image state & handlers
    questionImageFile,
    questionImagePreview,
    removeQuestionImage,
    handleQuestionImageChange,
    handleRemoveQuestionImage,
    handleOptionImageChange,
    handleRemoveOptionImage,
    // Payload builders
    buildPayload,
    buildSubmitData,
  }
}
