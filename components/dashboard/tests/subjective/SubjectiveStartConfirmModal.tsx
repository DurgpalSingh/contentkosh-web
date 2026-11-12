'use client'

import { useEffect, useState } from 'react'
import { Clock, FileText, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { SubjectiveAvailableTest } from '@/lib/api'
import { formatDateTime, formatDurationMinutes } from '@/lib/tests/testUiMappers'
import { SUBJECTIVE_TEST_UPLOAD } from '@/lib/tests/subjectiveTest.config'
import { getApiErrorDetailMessage } from '@/lib/tests/getApiErrorDetailMessage'

/** Confirms starting a subjective test: the student's timer begins when they confirm. */
export function SubjectiveStartConfirmModal({
  test,
  isOpen,
  onClose,
  onConfirm,
}: {
  test: SubjectiveAvailableTest
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    setError(null)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  const handleConfirm = async () => {
    setLoading(true)
    setError(null)
    try {
      await onConfirm()
    } catch (err: unknown) {
      setError(getApiErrorDetailMessage(err, 'Failed to start test'))
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-y-auto max-h-[90vh]" role="dialog" aria-modal="true">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-sky-100 flex items-center justify-center">
              <FileText className="h-5 w-5 text-sky-700" aria-hidden />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Start subjective test?</h2>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" aria-hidden />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}

          <p className="text-sm text-gray-600">
            {test.name} · {test.paperType}
            {test.batchName ? ` · ${test.batchName}` : ''}
          </p>

          {test.instructions && (
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-gray-700">Instructions</p>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{test.instructions}</p>
            </div>
          )}

          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
              <Clock className="h-4 w-4 text-gray-500" aria-hidden />
              Timing
            </div>
            <dl className="mt-2 grid grid-cols-2 gap-3 text-sm text-gray-700">
              <div>
                <dt className="text-xs text-gray-500">Duration</dt>
                <dd className="font-semibold">{formatDurationMinutes(test.durationMinutes)}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Final deadline</dt>
                <dd className="font-semibold">{formatDateTime(test.deadlineAt)}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Total marks</dt>
                <dd className="font-semibold">{test.totalMarks}</dd>
              </div>
            </dl>
          </div>

          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
            <li>Your timer starts as soon as you confirm. It ends after the duration or at the final deadline, whichever is earlier.</li>
            <li>Download the question paper, write your answers, then upload them as one PDF (max {SUBJECTIVE_TEST_UPLOAD.maxPdfSizeMb} MB).</li>
            <li>You can submit only once. Unsubmitted work cannot be uploaded after the time is over.</li>
          </ul>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button className="text-white bg-sky-600 hover:bg-sky-700" onClick={handleConfirm} disabled={loading}>
              {loading ? 'Starting…' : 'Start test'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
