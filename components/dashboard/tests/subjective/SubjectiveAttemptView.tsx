'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertTriangle, ArrowLeft, Clock, FileText, Loader2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  SubjectiveDisplayStatus,
  SubjectiveTestFilesService,
  SubjectiveTestsService,
  type SubjectiveStudentSubmission,
} from '@/lib/api'
import { FileUploadArea } from '@/components/dashboard/contents/FileUploadArea'
import { PdfFileViewerModal } from '@/components/common/PdfFileViewerModal'
import { PublishConfirmModal } from '@/components/modals/PublishConfirmModal'
import { studentSubjectiveResultPath, studentTestBasePath } from '@/lib/tests/studentTestCatalog'
import { SUBJECTIVE_TEST_UPLOAD, SUBJECTIVE_TIME_WARNING_SECONDS } from '@/lib/tests/subjectiveTest.config'
import { formatCountdown, useCountdown } from '@/lib/tests/useCountdown'
import { formatDateTime } from '@/lib/tests/testUiMappers'
import { getApiErrorDetailMessage } from '@/lib/tests/getApiErrorDetailMessage'

/** In-progress subjective attempt: countdown, question paper, and a single answer-sheet upload. */
export function SubjectiveAttemptView({
  businessId,
  submissionId,
  slug,
}: {
  businessId: number
  submissionId: string
  slug: string
}) {
  const router = useRouter()
  const [submission, setSubmission] = useState<SubjectiveStudentSubmission | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [answerSheet, setAnswerSheet] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [paperOpen, setPaperOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const resultPath = studentSubjectiveResultPath(slug, submissionId)

  useEffect(() => {
    SubjectiveTestsService.getApiBusinessSubjectiveTestsSubmissions(businessId, submissionId)
      .then((res) => {
        const data = res.data ?? null
        // Anything other than an open attempt is shown on the result page.
        if (data && data.displayStatus !== SubjectiveDisplayStatus.IN_PROGRESS) {
          router.replace(resultPath)
          return
        }
        setSubmission(data)
      })
      .catch((e: unknown) => setLoadError(getApiErrorDetailMessage(e, 'Failed to load your attempt')))
  }, [businessId, submissionId, resultPath, router])

  const secondsLeft = useCountdown(submission?.effectiveDeadlineAt)
  const timeOver = secondsLeft === 0

  const fetchQuestionPaper = useCallback(
    () => SubjectiveTestFilesService.getQuestionPaper(businessId, submission?.test.id ?? ''),
    [businessId, submission?.test.id],
  )

  const submitAnswerSheet = async () => {
    if (!submission || !answerSheet) return
    // Errors are shown inline by the confirm modal (backend message as-is).
    await SubjectiveTestsService.postApiBusinessSubjectiveTestsSubmissions(businessId, submission.test.id, {
      answerSheet,
    })
    toast.success('Answer sheet submitted')
    router.replace(resultPath)
  }

  if (loadError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        {loadError}{' '}
        <Link href={studentTestBasePath(slug)} className="underline font-medium">
          Back to My Tests
        </Link>
      </div>
    )
  }

  if (!submission) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" aria-hidden />
      </div>
    )
  }

  const { test } = submission
  const lowTime = secondsLeft !== null && secondsLeft <= SUBJECTIVE_TIME_WARNING_SECONDS

  return (
    <div className="space-y-6 max-w-3xl">
      <Link href={studentTestBasePath(slug)} className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4 mr-1" />
        My Tests
      </Link>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{test.name}</h1>
            <p className="text-sm text-gray-600 mt-1">
              {[test.paperType, test.batchName, `${test.totalMarks} marks`].filter(Boolean).join(' · ')}
            </p>
          </div>
          <div
            className={`flex items-center gap-2 rounded-lg px-3 py-2 font-mono text-lg font-semibold ${
              timeOver ? 'bg-red-50 text-red-700' : lowTime ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
            }`}
            aria-live="polite"
          >
            <Clock className="h-5 w-5" aria-hidden />
            {secondsLeft === null ? '—' : formatCountdown(secondsLeft)}
          </div>
        </div>
        <p className="text-xs text-gray-500">Submit before {formatDateTime(submission.effectiveDeadlineAt)}.</p>

        {test.instructions && (
          <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3">
            <p className="text-sm font-medium text-gray-700">Instructions</p>
            <p className="text-sm text-gray-600 whitespace-pre-wrap mt-1">{test.instructions}</p>
          </div>
        )}

        <Button type="button" variant="outline" onClick={() => setPaperOpen(true)}>
          <FileText className="h-4 w-4 mr-2" />
          View / download question paper
        </Button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Upload your answer sheet</h2>
        {timeOver ? (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden />
            Time over. Answer sheets can no longer be submitted for this test.
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-600">
              Scan all pages into one PDF (max {SUBJECTIVE_TEST_UPLOAD.maxPdfSizeMb} MB). You can submit only once.
            </p>
            <FileUploadArea
              accept={SUBJECTIVE_TEST_UPLOAD.accept}
              acceptedLabel={SUBJECTIVE_TEST_UPLOAD.acceptedLabel}
              maxSizeMb={SUBJECTIVE_TEST_UPLOAD.maxPdfSizeMb}
              value={answerSheet}
              onChange={setAnswerSheet}
              onError={setFileError}
            />
            {fileError && <p className="text-sm text-red-600">{fileError}</p>}
            <div className="flex justify-end">
              <Button
                type="button"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!answerSheet}
                onClick={() => setConfirmOpen(true)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Submit answer sheet
              </Button>
            </div>
          </>
        )}
      </div>

      <PdfFileViewerModal
        isOpen={paperOpen}
        onClose={() => setPaperOpen(false)}
        title={`${test.name} — question paper`}
        downloadName={`${test.name} - question paper.pdf`}
        fetchBlob={fetchQuestionPaper}
      />

      <PublishConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={submitAnswerSheet}
        title="Submit answer sheet?"
        message="You can submit only once. Make sure every page is included and readable."
        itemName={answerSheet?.name}
        confirmLabel="Submit"
        loadingLabel="Submitting…"
      />
    </div>
  )
}
