'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Eye, Hourglass, Loader2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  SubjectiveDisplayStatus,
  SubjectiveTestFilesService,
  SubjectiveTestsService,
  type SubjectiveStudentSubmission,
} from '@/lib/api'
import { PdfFileViewerModal } from '@/components/common/PdfFileViewerModal'
import { studentSubjectiveAttemptPath, studentTestBasePath } from '@/lib/tests/studentTestCatalog'
import {
  SUBJECTIVE_DISPLAY_STATUS_BADGE,
  SUBJECTIVE_DISPLAY_STATUS_LABEL,
} from '@/lib/tests/subjectiveTestConstants'
import { formatDateTime } from '@/lib/tests/testUiMappers'
import { getApiErrorDetailMessage } from '@/lib/tests/getApiErrorDetailMessage'

type OpenFile = 'answer' | 'checked' | null

const STATUS_MESSAGE: Partial<Record<SubjectiveDisplayStatus, { icon: typeof Hourglass; text: string }>> = {
  [SubjectiveDisplayStatus.SUBMITTED]: {
    icon: Hourglass,
    text: 'Your answer sheet was submitted. Marks and the checked copy will appear here once your teacher checks it.',
  },
  [SubjectiveDisplayStatus.EXPIRED]: {
    icon: XCircle,
    text: 'Time ran out before an answer sheet was submitted.',
  },
}

/** Student's own submission: status, and once checked, marks, remarks and the checked copy. */
export function SubjectiveResultView({
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
  const [openFile, setOpenFile] = useState<OpenFile>(null)

  useEffect(() => {
    SubjectiveTestsService.getApiBusinessSubjectiveTestsSubmissions(businessId, submissionId)
      .then((res) => setSubmission(res.data ?? null))
      .catch((e: unknown) => setLoadError(getApiErrorDetailMessage(e, 'Failed to load your submission')))
  }, [businessId, submissionId])

  const fetchAnswerSheet = useCallback(
    () => SubjectiveTestFilesService.getOwnAnswerSheet(businessId, submissionId),
    [businessId, submissionId],
  )
  const fetchCheckedSheet = useCallback(
    () => SubjectiveTestFilesService.getOwnCheckedAnswerSheet(businessId, submissionId),
    [businessId, submissionId],
  )

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
  const statusMessage = STATUS_MESSAGE[displayStatus]

  return (
    <div className="space-y-6 max-w-3xl">
      <Link href={studentTestBasePath(slug)} className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4 mr-1" />
        My Tests
      </Link>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{test.name}</h1>
            <p className="text-sm text-gray-600 mt-1">
              {[test.paperType, test.batchName, test.subjectName].filter(Boolean).join(' · ')}
            </p>
          </div>
          <span className={`self-start text-xs font-medium px-2.5 py-1 rounded-full ${SUBJECTIVE_DISPLAY_STATUS_BADGE[displayStatus]}`}>
            {SUBJECTIVE_DISPLAY_STATUS_LABEL[displayStatus]}
          </span>
        </div>

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-gray-500">Started</dt>
            <dd className="font-medium text-gray-900">{formatDateTime(submission.startedAt)}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Submitted</dt>
            <dd className="font-medium text-gray-900">{submission.submittedAt ? formatDateTime(submission.submittedAt) : '—'}</dd>
          </div>
        </dl>

        {displayStatus === SubjectiveDisplayStatus.IN_PROGRESS && (
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href={studentSubjectiveAttemptPath(slug, submissionId)}>Continue test</Link>
          </Button>
        )}

        {statusMessage && (
          <div className="flex items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
            <statusMessage.icon className="h-4 w-4 mt-0.5 shrink-0" aria-hidden />
            {statusMessage.text}
          </div>
        )}
      </div>

      {result && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle2 className="h-5 w-5" aria-hidden />
            <h2 className="font-semibold">Checked{result.checkedAt ? ` on ${formatDateTime(result.checkedAt)}` : ''}</h2>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {result.marksAwarded}
            <span className="text-lg font-medium text-gray-500"> / {result.totalMarks}</span>
          </p>
          {result.remarks && (
            <div>
              <p className="text-sm font-medium text-gray-700">Remarks</p>
              <p className="text-sm text-gray-600 whitespace-pre-wrap mt-1">{result.remarks}</p>
            </div>
          )}
        </div>
      )}

      {(submission.hasAnswerSheet || result?.hasCheckedAnswerSheet) && (
        <div className="flex flex-wrap gap-2">
          {submission.hasAnswerSheet && (
            <Button type="button" variant="outline" onClick={() => setOpenFile('answer')}>
              <Eye className="h-4 w-4 mr-2" />
              My answer sheet
            </Button>
          )}
          {result?.hasCheckedAnswerSheet && (
            <Button type="button" variant="outline" onClick={() => setOpenFile('checked')}>
              <Eye className="h-4 w-4 mr-2" />
              Checked copy
            </Button>
          )}
        </div>
      )}

      <PdfFileViewerModal
        key={openFile ?? 'closed'}
        isOpen={openFile !== null}
        onClose={() => setOpenFile(null)}
        title={`${test.name} — ${openFile === 'checked' ? 'checked copy' : 'my answer sheet'}`}
        downloadName={`${test.name} - ${openFile === 'checked' ? 'checked copy' : 'answer sheet'}.pdf`}
        fetchBlob={openFile === 'checked' ? fetchCheckedSheet : fetchAnswerSheet}
      />
    </div>
  )
}
