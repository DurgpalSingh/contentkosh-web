'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, ArrowLeft, Clock, FileText, Loader2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  SubjectiveDisplayStatus,
  SubjectiveTestFilesService,
  SubjectiveTestsService,
  type SubjectiveStudentSubmission,
} from '@/lib/api'
import { DownloadFileButton } from '@/components/common/DownloadFileButton'
import { PublishConfirmModal } from '@/components/modals/PublishConfirmModal'
import { SubjectivePill, SubjectiveStatusBadge } from '@/components/dashboard/tests/subjective/SubjectiveStatusBadge'
import { SubjectivePdfPicker } from '@/components/dashboard/tests/subjective/SubjectivePdfPicker'
import { studentTestBasePath } from '@/lib/tests/studentTestCatalog'
import { SUBJECTIVE_TIME_WARNING_SECONDS } from '@/lib/tests/subjectiveTest.config'
import {
  SUBJECTIVE_AVAILABILITY_BADGE,
  SUBJECTIVE_AVAILABILITY_LABEL,
  SUBJECTIVE_NEUTRAL_BADGE,
} from '@/lib/tests/subjectiveTestConstants'
import { formatCountdown, useCountdown } from '@/lib/tests/useCountdown'
import { formatDateTime, formatDurationMinutes } from '@/lib/tests/testUiMappers'
import { getApiErrorDetailMessage } from '@/lib/tests/getApiErrorDetailMessage'

const CARD = 'rounded-2xl border border-gray-200 bg-white p-6 shadow-sm'

/** Student page for one subjective attempt: test info, question paper, and the answer sheet / result. */
export function SubjectiveStudentTestView({
  businessId,
  submissionId,
  slug,
}: {
  businessId: number
  submissionId: string
  slug: string
}) {
  const [submission, setSubmission] = useState<SubjectiveStudentSubmission | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [answerSheet, setAnswerSheet] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await SubjectiveTestsService.getApiBusinessSubjectiveTestsSubmissions(businessId, submissionId)
      setSubmission(res.data ?? null)
    } catch (e: unknown) {
      setLoadError(getApiErrorDetailMessage(e, 'Failed to load this test'))
    }
  }, [businessId, submissionId])

  useEffect(() => {
    void load()
  }, [load])

  const inProgress = submission?.displayStatus === SubjectiveDisplayStatus.IN_PROGRESS
  const secondsLeft = useCountdown(inProgress ? submission?.effectiveDeadlineAt : null)
  const timeOver = secondsLeft === 0

  const testId = submission?.test.id ?? ''
  const fetchQuestionPaper = useCallback(
    () => SubjectiveTestFilesService.getQuestionPaper(businessId, testId),
    [businessId, testId],
  )

  const submitAnswerSheet = async () => {
    if (!answerSheet) return
    // Errors are shown inline by the confirm modal (backend message as-is).
    await SubjectiveTestsService.postApiBusinessSubjectiveTestsSubmissions(businessId, testId, { answerSheet })
    toast.success('Answer sheet submitted')
    setAnswerSheet(null)
    await load()
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

  const { test, result, displayStatus } = submission
  const questionPaperName = test.questionPaperName ?? `${test.name} - question paper.pdf`
  const answerSheetName = submission.answerSheetName ?? `${test.name} - answer sheet.pdf`
  const hasSubmitted =
    displayStatus === SubjectiveDisplayStatus.SUBMITTED || displayStatus === SubjectiveDisplayStatus.CHECKED
  const lowTime = secondsLeft !== null && secondsLeft <= SUBJECTIVE_TIME_WARNING_SECONDS

  return (
    <div className="max-w-5xl space-y-6">
      <Link href={studentTestBasePath(slug)} className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4 mr-1" />
        My Tests
      </Link>

      {/* Test info */}
      <section className={`${CARD} space-y-5`}>
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <SubjectivePill className={SUBJECTIVE_NEUTRAL_BADGE}>{test.paperType}</SubjectivePill>
            <SubjectivePill className={SUBJECTIVE_AVAILABILITY_BADGE[test.availability]}>
              {SUBJECTIVE_AVAILABILITY_LABEL[test.availability]}
            </SubjectivePill>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{test.name}</h1>
        </div>
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            ['Total marks', String(test.totalMarks)],
            ['Duration', formatDurationMinutes(test.durationMinutes)],
            ['Starts', formatDateTime(test.startAt)],
            ['Deadline', formatDateTime(test.deadlineAt)],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-sm text-gray-500">{label}</dt>
              <dd className="font-semibold text-gray-900">{value}</dd>
            </div>
          ))}
        </dl>
        {test.instructions && (
          <p className="rounded-lg bg-gray-50 px-5 py-3 text-sm text-gray-600 whitespace-pre-wrap">{test.instructions}</p>
        )}
      </section>

      {/* 1. Question paper */}
      <section className={`${CARD} space-y-4`}>
        <h2 className="text-base font-semibold text-gray-900">1. Question Paper</h2>
        <div className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
              <FileText className="h-6 w-6" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-gray-900">{questionPaperName}</p>
              <p className="text-sm text-gray-500">PDF · Write your answers and scan them as one PDF</p>
            </div>
          </div>
          <DownloadFileButton fetchBlob={fetchQuestionPaper} fileName={questionPaperName} className="shrink-0">
            Download
          </DownloadFileButton>
        </div>
      </section>

      {/* 2. Answer sheet */}
      <section className={`${CARD} space-y-4`}>
        <h2 className="text-base font-semibold text-gray-900">2. Your Answer Sheet</h2>

        {hasSubmitted ? (
          <>
            <div className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-semibold text-gray-900">{answerSheetName}</p>
                  <SubjectiveStatusBadge status={displayStatus} audience="student" />
                </div>
                {submission.submittedAt && (
                  <p className="text-sm text-gray-500">Submitted {formatDateTime(submission.submittedAt)}</p>
                )}
              </div>
              <DownloadFileButton
                fetchBlob={() => SubjectiveTestFilesService.getOwnAnswerSheet(businessId, submissionId)}
                fileName={answerSheetName}
                className="shrink-0"
              >
                My Sheet
              </DownloadFileButton>
            </div>

            {result ? (
              <div className="flex flex-col gap-4 rounded-xl border border-green-200 bg-green-50 p-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">Marks awarded</p>
                  <p className="text-3xl font-bold text-green-600">
                    {result.marksAwarded}
                    <span className="text-lg font-semibold text-gray-600">/{result.totalMarks}</span>
                  </p>
                  {result.remarks && (
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">Teacher&apos;s remarks: {result.remarks}</p>
                  )}
                </div>
                {result.hasCheckedAnswerSheet && (
                  <DownloadFileButton
                    variant="default"
                    className="shrink-0 bg-blue-600 hover:bg-blue-700"
                    fetchBlob={() => SubjectiveTestFilesService.getOwnCheckedAnswerSheet(businessId, submissionId)}
                    fileName={`${test.name} - checked copy.pdf`}
                  >
                    Checked Copy
                  </DownloadFileButton>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Your teacher will check your answer sheet. Marks and the checked copy will appear here.
              </p>
            )}
          </>
        ) : inProgress && !timeOver ? (
          <>
            <div
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium ${
                lowTime ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
              }`}
              aria-live="polite"
            >
              <Clock className="h-4 w-4" aria-hidden />
              Time left {secondsLeft === null ? '—' : formatCountdown(secondsLeft)} · submit before{' '}
              {formatDateTime(submission.effectiveDeadlineAt)}
            </div>
            <p className="text-sm font-medium text-gray-900">Upload your answer sheet once you have finished (PDF)</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <SubjectivePdfPicker file={answerSheet} onChange={setAnswerSheet} onError={setFileError} />
              <Button
                type="button"
                className="h-12 bg-blue-600 px-6 hover:bg-blue-700"
                disabled={!answerSheet}
                onClick={() => setConfirmOpen(true)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Submit
              </Button>
            </div>
            {fileError && <p className="text-sm text-red-600">{fileError}</p>}
          </>
        ) : (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden />
            Time over. Answer sheets can no longer be submitted for this test.
          </div>
        )}
      </section>

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
