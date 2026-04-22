'use client'

import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { BulkUploadPreview } from '@/components/dashboard/tests/BulkUploadPreview'
import { QuestionModalFrame } from '@/components/modals/QuestionModalFrame'
import { BulkUploadService } from '@/lib/api'
import type { BulkUploadPreviewResponse } from '@/lib/api'
import { ApiError } from '@/lib/api'

interface BulkUploadModalProps {
  isOpen: boolean
  onClose: () => void
  businessId: number
  testId: string
  testType: 'practice' | 'exam'
  onSaved: () => void
}

type UploadState = 'idle' | 'uploading' | 'previewing' | 'confirming' | 'done'

function extractErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    // The ApiError body may contain a message field from the backend
    const body = err.body as { message?: string } | undefined
    if (body?.message) return body.message
    return err.message || fallback
  }
  if (err instanceof Error) return err.message
  return fallback
}

export const BulkUploadModal = ({
  isOpen,
  onClose,
  businessId,
  testId,
  testType,
  onSaved,
}: BulkUploadModalProps) => {
  const [state, setState] = useState<UploadState>('idle')
  const [preview, setPreview] = useState<BulkUploadPreviewResponse | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [confirmError, setConfirmError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setState('idle')
      setPreview(null)
      setUploadError(null)
      setConfirmError(null)
    }
  }, [isOpen])

  const onSavedRef = useRef(onSaved)
  const onCloseRef = useRef(onClose)
  useEffect(() => { onSavedRef.current = onSaved }, [onSaved])
  useEffect(() => { onCloseRef.current = onClose }, [onClose])

  // Trigger callbacks when done — use refs to avoid stale closure / infinite loop
  useEffect(() => {
    if (state === 'done') {
      onSavedRef.current()
      onCloseRef.current()
    }
  }, [state])

  const handleFileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const file = fileInputRef.current?.files?.[0]
    if (!file) return

    setState('uploading')
    setUploadError(null)

    try {
      const data = await BulkUploadService.uploadAndPreview(businessId, file, testId, testType)
      setPreview(data.data ?? null)
      setState('previewing')
    } catch (err) {
      setUploadError(extractErrorMessage(err, 'Failed to parse file. Please try again.'))
      setState('idle')
    }
  }

  const handleConfirm = async () => {
    if (!preview) return

    setState('confirming')
    setConfirmError(null)

    try {
      const result = await BulkUploadService.confirmBulkUpload(businessId, {
        sessionToken: preview.sessionToken,
        testId,
        testType,
      })
      const savedCount = result.data?.savedCount ?? 0
      toast.success(`${savedCount} question${savedCount !== 1 ? 's' : ''} saved successfully`)
      setState('done')
    } catch (err) {
      setConfirmError(extractErrorMessage(err, 'Failed to save questions. Please try again.'))
      setState('previewing')
    }
  }

  const handleCancel = () => {
    setPreview(null)
    setUploadError(null)
    setConfirmError(null)
    setState('idle')
  }

  const isPreviewingOrConfirming = state === 'previewing' || state === 'confirming'

  return (
    <QuestionModalFrame
      open={isOpen}
      titleId="bulk-upload-title"
      title="Upload questions from file"
      subtitle="Upload a .doc or .docx file to bulk-add questions."
      onClose={onClose}
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="min-h-0 flex-1 overflow-y-auto bg-muted/15 px-5 py-6 sm:px-8 sm:py-8">
          {/* Idle: file input */}
          {state === 'idle' && (
            <form id="bulk-upload-form" onSubmit={(e) => void handleFileSubmit(e)}>
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="bulk-file-input"
                    className="text-sm font-medium text-foreground"
                  >
                    Select file
                  </label>
                  <input
                    id="bulk-file-input"
                    ref={fileInputRef}
                    type="file"
                    accept=".doc,.docx"
                    required
                    className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
                  />
                </div>
                {uploadError && (
                  <p
                    className="rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive shadow-sm"
                    role="alert"
                  >
                    {uploadError}
                  </p>
                )}
              </div>
            </form>
          )}

          {/* Uploading: spinner */}
          {state === 'uploading' && (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
              <svg
                className="h-8 w-8 animate-spin text-primary"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <p className="text-sm font-medium">Parsing file…</p>
            </div>
          )}

          {/* Previewing / Confirming: show preview */}
          {isPreviewingOrConfirming && preview && (
            <div className="space-y-4">
              <BulkUploadPreview
                validQuestions={preview.validQuestions}
                invalidQuestions={preview.invalidQuestions}
              />
              {confirmError && (
                <p
                  className="rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive shadow-sm"
                  role="alert"
                >
                  {confirmError}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 flex-col gap-3 border-t border-border/80 bg-muted/40 px-5 py-4 backdrop-blur-sm sm:flex-row sm:justify-end sm:gap-3 sm:px-8">
          {state === 'idle' && (
            <>
              <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                form="bulk-upload-form"
                className="w-full min-w-[10rem] sm:w-auto"
              >
                Parse File
              </Button>
            </>
          )}

          {state === 'uploading' && (
            <Button type="button" className="w-full min-w-[10rem] sm:w-auto" disabled>
              Parsing file…
            </Button>
          )}

          {isPreviewingOrConfirming && (
            <>
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={handleCancel}
                disabled={state === 'confirming'}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="w-full min-w-[10rem] sm:w-auto"
                onClick={() => void handleConfirm()}
                disabled={
                  state === 'confirming' ||
                  !preview ||
                  preview.validQuestions.length === 0
                }
              >
                {state === 'confirming' ? 'Saving…' : 'Confirm and Save'}
              </Button>
            </>
          )}
        </div>
      </div>
    </QuestionModalFrame>
  )
}
