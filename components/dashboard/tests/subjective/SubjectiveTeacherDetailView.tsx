'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, FileText, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  SubjectiveDisplayStatus,
  SubjectiveTestFilesService,
  SubjectiveTestsService,
  type SubjectiveTestDetail,
} from '@/lib/api'
import { PublishConfirmModal } from '@/components/modals/PublishConfirmModal'
import { PdfFileViewerModal } from '@/components/common/PdfFileViewerModal'
import { SubjectiveSubmissionsTab } from '@/components/dashboard/tests/subjective/SubjectiveSubmissionsTab'
import { SubjectiveSettingsTab } from '@/components/dashboard/tests/subjective/SubjectiveSettingsTab'
import { teacherTestsListPath } from '@/lib/tests/testPaths'
import { TEST_KIND, TEST_KIND_LABEL } from '@/lib/tests/testConstants'
import { formatDateTime, formatDurationMinutes, testStatus, testStatusLabel } from '@/lib/tests/testUiMappers'
import {
  SUBJECTIVE_DISPLAY_STATUS_BADGE,
  SUBJECTIVE_DISPLAY_STATUS_LABEL,
  SUBJECTIVE_KIND_BADGE,
} from '@/lib/tests/subjectiveTestConstants'
import { getApiErrorDetailMessage } from '@/lib/tests/getApiErrorDetailMessage'

const SUBJECTIVE_TAB = {
  SUBMISSIONS: 'submissions',
  SETTINGS: 'settings',
} as const

type SubjectiveTabId = (typeof SUBJECTIVE_TAB)[keyof typeof SUBJECTIVE_TAB]

const SUBJECTIVE_TAB_LABEL: Record<SubjectiveTabId, string> = {
  submissions: 'Submissions',
  settings: 'Settings',
}

export function SubjectiveTeacherDetailView({
  testId,
  businessId,
  slug,
}: {
  testId: string
  businessId: number
  slug: string
}) {
  const router = useRouter()
  const listHref = teacherTestsListPath(slug)
  const [test, setTest] = useState<SubjectiveTestDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<SubjectiveTabId>(SUBJECTIVE_TAB.SUBMISSIONS)
  const [publishOpen, setPublishOpen] = useState(false)
  const [paperOpen, setPaperOpen] = useState(false)

  const loadTest = useCallback(async () => {
    setLoading(true)
    try {
      const res = await SubjectiveTestsService.getApiBusinessSubjectiveTests1(businessId, testId)
      setTest(res.data ?? null)
    } catch (e: unknown) {
      setTest(null)
      toast.error(getApiErrorDetailMessage(e, 'Failed to load test'))
    } finally {
      setLoading(false)
    }
  }, [businessId, testId])

  useEffect(() => {
    void loadTest()
  }, [loadTest])

  const runPublish = async () => {
    await SubjectiveTestsService.postApiBusinessSubjectiveTestsPublish(businessId, { subjectiveTestId: testId })
    toast.success('Test published')
    await loadTest()
  }

  const fetchQuestionPaper = useCallback(
    () => SubjectiveTestFilesService.getQuestionPaper(businessId, testId),
    [businessId, testId],
  )

  if (loading && !test) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" aria-hidden />
      </div>
    )
  }

  if (!test) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Test not found.{' '}
        <Link href={listHref} className="underline font-medium">
          Back to list
        </Link>
      </div>
    )
  }

  const isDraft = test.status === testStatus.draft

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href={listHref} className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            All tests
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">{test.name}</h1>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${SUBJECTIVE_KIND_BADGE}`}>
              {TEST_KIND_LABEL[TEST_KIND.SUBJECTIVE]}
            </span>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                isDraft ? 'bg-gray-100 text-gray-700' : 'bg-blue-50 text-blue-800'
              }`}
            >
              {testStatusLabel(test.status)}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {[
              test.paperType,
              test.batchName,
              test.subjectName,
              `${test.totalMarks} marks`,
              `Duration ${formatDurationMinutes(test.durationMinutes)}`,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {formatDateTime(test.startAt)} → {formatDateTime(test.deadlineAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => setPaperOpen(true)} disabled={!test.hasQuestionPaper}>
            <FileText className="h-4 w-4 mr-2" />
            {test.hasQuestionPaper ? 'View question paper' : 'No question paper'}
          </Button>
          {isDraft && (
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setPublishOpen(true)} type="button">
              Publish test
            </Button>
          )}
        </div>
      </div>

      {!isDraft && (
        <div className="flex flex-wrap gap-2">
          {(Object.values(SubjectiveDisplayStatus) as SubjectiveDisplayStatus[]).map((status) => (
            <span
              key={status}
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${SUBJECTIVE_DISPLAY_STATUS_BADGE[status]}`}
            >
              {SUBJECTIVE_DISPLAY_STATUS_LABEL[status]}: {test.submissionCounts[status]}
            </span>
          ))}
        </div>
      )}

      <div className="border-b border-gray-200 flex gap-1">
        {(Object.values(SUBJECTIVE_TAB) as SubjectiveTabId[]).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              activeTab === id
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {SUBJECTIVE_TAB_LABEL[id]}
          </button>
        ))}
      </div>

      {activeTab === SUBJECTIVE_TAB.SUBMISSIONS && (
        <SubjectiveSubmissionsTab businessId={businessId} test={test} onGraded={() => void loadTest()} />
      )}

      {activeTab === SUBJECTIVE_TAB.SETTINGS && (
        <SubjectiveSettingsTab
          businessId={businessId}
          test={test}
          onSaved={() => void loadTest()}
          onDeleted={() => router.push(listHref)}
        />
      )}

      <PdfFileViewerModal
        isOpen={paperOpen}
        onClose={() => setPaperOpen(false)}
        title={`${test.name} — question paper`}
        downloadName={`${test.name} - question paper.pdf`}
        fetchBlob={fetchQuestionPaper}
      />

      <PublishConfirmModal
        isOpen={publishOpen}
        onClose={() => setPublishOpen(false)}
        onConfirm={runPublish}
        title="Publish test?"
        message="Once published, students in the batch can start this test during its schedule. A published test cannot be edited."
        itemName={test.name}
      />
    </div>
  )
}
