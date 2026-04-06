'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { QuestionFormFields } from '@/components/dashboard/tests/questions/QuestionFormFields'
import { useTeacherQuestionForm } from '@/components/dashboard/tests/questions/useTeacherQuestionForm'
import { ExamTestsService, PracticeTestsService, type UpdateQuestionDTO } from '@/lib/api'
import { getApiErrorDetailMessage } from '@/lib/tests/getApiErrorDetailMessage'
import type { TeacherTestQuestion } from '@/lib/tests/teacherQuestionTypes'
import { TEST_KIND, type TestKind } from '@/lib/tests/testConstants'
import {
  validateQuestionForm,
  type QuestionFormErrors,
} from '@/components/dashboard/tests/questions/questionFormValidation'
import { toast } from 'sonner'

interface EditQuestionModalProps {
  isOpen: boolean
  onClose: () => void
  businessId: number
  kind: TestKind
  question: TeacherTestQuestion
  onSaved: () => void
}

export const EditQuestionModal = ({
  isOpen,
  onClose,
  businessId,
  kind,
  question,
  onSaved,
}: EditQuestionModalProps) => {
  const form = useTeacherQuestionForm(isOpen, question)
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
    if (!question.id) return
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
      const payload = form.buildPayload() as UpdateQuestionDTO
      if (kind === TEST_KIND.PRACTICE) {
        await PracticeTestsService.putApiBusinessPracticeTestsQuestions(
          businessId,
          question.id,
          payload,
        )
      } else {
        await ExamTestsService.putApiBusinessExamTestsQuestions(businessId, question.id, payload)
      }
      toast.success('Question updated')
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 overflow-y-auto">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 max-w-5xl w-full max-h-[90vh] my-4 sm:my-6 flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-q-title"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 sm:px-8 py-4 sm:py-5">
          <h2 id="edit-q-title" className="text-xl font-semibold tracking-tight text-slate-900">
            Edit question
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 sm:p-8">
            <QuestionFormFields form={form} formId="edit-question" kind={kind} />
            {Object.keys(formErrors).length > 0 && (
              <div className="space-y-1" role="alert">
                {formErrors.questionText && (
                  <p className="text-sm text-red-600">{formErrors.questionText}</p>
                )}
                {formErrors.questionType && (
                  <p className="text-sm text-red-600">{formErrors.questionType}</p>
                )}
                {formErrors.options && (
                  <p className="text-sm text-red-600">{formErrors.options}</p>
                )}
                {formErrors.correctOption && (
                  <p className="text-sm text-red-600">{formErrors.correctOption}</p>
                )}
                {formErrors.correctAnswer && (
                  <p className="text-sm text-red-600">{formErrors.correctAnswer}</p>
                )}
              </div>
            )}
            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
          </div>
          <div className="flex shrink-0 justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:px-8">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
