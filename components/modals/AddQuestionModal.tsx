'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { QuestionFormFields } from '@/components/dashboard/tests/questions/QuestionFormFields'
import { useTeacherQuestionForm } from '@/components/dashboard/tests/questions/useTeacherQuestionForm'
import { CreateQuestionDTO, ExamTestsService, PracticeTestsService } from '@/lib/api'
import { getApiErrorDetailMessage } from '@/lib/tests/getApiErrorDetailMessage'
import { TEST_KIND, type TestKind } from '@/lib/tests/testConstants'
import {
  validateQuestionForm,
  type QuestionFormErrors,
} from '@/components/dashboard/tests/questions/questionFormValidation'
import { toast } from 'sonner'
import { QuestionModalFrame } from '@/components/modals/QuestionModalFrame'

interface AddQuestionModalProps {
  isOpen: boolean
  onClose: () => void
  businessId: number
  kind: TestKind
  testId: string
  onSaved: () => void
}

export const AddQuestionModal = ({
  isOpen,
  onClose,
  businessId,
  kind,
  testId,
  onSaved,
}: AddQuestionModalProps) => {
  const form = useTeacherQuestionForm(isOpen, null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<QuestionFormErrors>({})

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errors = validateQuestionForm({
      questionTypeValue: form.questionTypeValue,
      questionText: form.questionText,
      options: form.options,
      correctSingleId: form.correctSingleId,
      correctMultiIds: form.correctMultiIds,
      correctText: form.correctText,
    })
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }
    setFormErrors({})
    setLoading(true)
    setError(null)
    try {
      const payload = form.buildPayload() as CreateQuestionDTO
      if (kind === TEST_KIND.PRACTICE) {
        await PracticeTestsService.postApiBusinessPracticeTestsQuestions(
          businessId,
          testId,
          payload,
        )
      } else {
        await ExamTestsService.postApiBusinessExamTestsQuestions(businessId, testId, payload)
      }
      toast.success('Question added')
      onSaved()
      onClose()
    } catch (err: unknown) {
      const msg = getApiErrorDetailMessage(err, 'Failed to save question')
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <QuestionModalFrame
      open={isOpen}
      titleId="add-q-title"
      title="Add question"
      subtitle="Create a new question for this test."
      onClose={onClose}
    >
      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto bg-muted/15 px-5 py-6 sm:px-8 sm:py-8">
          <QuestionFormFields form={form} formId="add-question" />
          {Object.keys(formErrors).length > 0 && (
            <div
              className="rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive shadow-sm"
              role="alert"
            >
              <p className="mb-2 font-medium">Please fix the following</p>
              <ul className="list-inside list-disc space-y-1 text-destructive/95">
                {formErrors.questionText && <li>{formErrors.questionText}</li>}
                {formErrors.questionType && <li>{formErrors.questionType}</li>}
                {formErrors.options && <li>{formErrors.options}</li>}
                {formErrors.correctOption && <li>{formErrors.correctOption}</li>}
                {formErrors.correctAnswer && <li>{formErrors.correctAnswer}</li>}
              </ul>
            </div>
          )}
          {error && (
            <p
              className="rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive shadow-sm"
              role="alert"
            >
              {error}
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-col gap-3 border-t border-border/80 bg-muted/40 px-5 py-4 backdrop-blur-sm sm:flex-row sm:justify-end sm:gap-3 sm:px-8">
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="w-full min-w-[10rem] sm:w-auto" disabled={loading}>
            {loading ? 'Saving…' : 'Add question'}
          </Button>
        </div>
      </form>
    </QuestionModalFrame>
  )
}
