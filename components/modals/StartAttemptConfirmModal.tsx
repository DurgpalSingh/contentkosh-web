'use client'

import { useEffect, useState } from 'react'
import { Clock, Play, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { TestLanguage } from '@/lib/api/models/TestLanguage'
import { TEST_LANGUAGE_OPTIONS } from '@/lib/tests/testLanguage'
import { cn } from '@/lib/utils'
import { TEST_KIND, TEST_KIND_LABEL, type TestKind } from '@/lib/tests/testConstants'

export type StartAttemptConfirmModalTiming = {
  startAtLabel?: string
  deadlineAtLabel?: string
  durationLabel?: string
}

export type StartAttemptTestInfo = {
  kind: TestKind
  testId: string
  testName: string
  batchName?: string
  rulesDescription?: string
  questionCount: number
  marksPerQuestion?: number
  negativeMarksPerQuestion?: number
  timing?: StartAttemptConfirmModalTiming
  /** Language configured for this test; the student must confirm the same language to start. */
  testLanguage: TestLanguage
}

export interface StartAttemptConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (language: TestLanguage) => Promise<void>
  testInfo: StartAttemptTestInfo
}

export function StartAttemptConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  testInfo,
}: StartAttemptConfirmModalProps) {
  const {
    kind,
    testName,
    batchName,
    rulesDescription,
    questionCount,
    marksPerQuestion,
    negativeMarksPerQuestion,
    timing,
    testLanguage,
  } = testInfo
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState<TestLanguage>(testLanguage)

  useEffect(() => {
    if (isOpen) {
      setSelectedLanguage(testLanguage)
    }
  }, [isOpen, testLanguage])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleClose = () => {
    setError(null)
    onClose()
  }

  const handleConfirm = async () => {
    setLoading(true)
    setError(null)
    try {
      await onConfirm(selectedLanguage)
      onClose()
    } catch (err: unknown) {
      const e = err as { body?: { message?: string }; message?: string }
      setError(e?.body?.message || e?.message || 'Failed to start attempt')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} aria-hidden />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-violet-100 flex items-center justify-center">
              <Play className="h-5 w-5 text-violet-600" aria-hidden />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              Start {TEST_KIND_LABEL[kind].toLowerCase()}?
            </h2>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" aria-hidden />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}

          <div className="space-y-1">
            <p className="text-sm text-gray-600">
              {testName}
              {batchName ? ` • ${batchName}` : ''}
            </p>
          </div>

          {rulesDescription && (
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-gray-700">Instructions</p>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{rulesDescription}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="attempt-language">Test language</Label>
            <Select
              id="attempt-language"
              value={selectedLanguage}
              onChange={(v) => setSelectedLanguage(v as TestLanguage)}
              options={TEST_LANGUAGE_OPTIONS.map((o) => ({
                value: o.value,
                label: o.label,
              }))}
              placeholder="Select language"
            />
            <p className="text-xs text-gray-500">
              Must match the language of this test. If it does not match, starting will fail.
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-gray-500">Questions</dt>
              <dd className="font-semibold text-gray-900">{questionCount}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Marks per question</dt>
              <dd className="font-semibold text-gray-900">
                {marksPerQuestion != null ? marksPerQuestion : '—'}
              </dd>
            </div>
            {negativeMarksPerQuestion != null && (
              <div className="col-span-2">
                <dt className="text-gray-500">Negative marks per question</dt>
                <dd className="font-semibold text-gray-900">{negativeMarksPerQuestion}</dd>
              </div>
            )}
          </dl>

          {kind === TEST_KIND.EXAM && timing && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                <Clock className="h-4 w-4 text-gray-500" aria-hidden />
                Timing
              </div>
              <div className="mt-2 grid grid-cols-2 gap-3 text-sm text-gray-700">
                <div>
                  <div className="text-xs text-gray-500">Start</div>
                  <div className="font-semibold">{timing.startAtLabel ?? '—'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Deadline</div>
                  <div className="font-semibold">{timing.deadlineAtLabel ?? '—'}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-xs text-gray-500">Duration</div>
                  <div className="font-semibold">{timing.durationLabel ?? '—'}</div>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
            {kind === TEST_KIND.EXAM
              ? 'Your countdown and auto-submit will start once you confirm. You can still navigate questions after you begin.'
              : 'Your practice attempt will start once you confirm. You can begin answering right away.'}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              className={cn('text-white bg-violet-600 hover:bg-violet-700 focus-visible:ring-violet-600')}
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? 'Starting…' : 'Start attempt'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

