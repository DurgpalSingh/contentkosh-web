'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ListChecks, Loader2, Send, Settings } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  SubjectiveDisplayStatus,
  SubjectiveTestFilesService,
  SubjectiveTestsService,
  type SubjectiveTestDetail,
} from '@/lib/api'
import { PublishConfirmModal } from '@/components/modals/PublishConfirmModal'
import { DownloadFileButton } from '@/components/common/DownloadFileButton'
import { SubjectiveSubmissionsTab } from '@/components/dashboard/tests/subjective/SubjectiveSubmissionsTab'
import { SubjectiveSettingsTab } from '@/components/dashboard/tests/subjective/SubjectiveSettingsTab'
import { SubjectivePill } from '@/components/dashboard/tests/subjective/SubjectiveStatusBadge'
import { teacherTestsListPath } from '@/lib/tests/testPaths'
import { formatDateTime, testStatus } from '@/lib/tests/testUiMappers'
import {
  SUBJECTIVE_AVAILABILITY_BADGE,
  SUBJECTIVE_AVAILABILITY_LABEL,
  SUBJECTIVE_NEUTRAL_BADGE,
  getSubjectiveAvailability,
} from '@/lib/tests/subjectiveTestConstants'
import { getApiErrorDetailMessage } from '@/lib/tests/getApiErrorDetailMessage'

const VIEW = {
  SUBMISSIONS: 'submissions',
  SETTINGS: 'settings',
} as const

type ViewId = (typeof VIEW)[keyof typeof VIEW]

function StatTile({ label, value, valueClass }: { label: string; value: number; valueClass: string }) {
  return (
    <div className="rounded-xl bg-gray-50 px-5 py-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${valueClass}`}>{value}</p>
    </div>
  )
}

/** Staff page for one subjective test: summary, submission stats, and per-student review. */
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
  const [view, setView] = useState<ViewId | null>(null)
  const [publishOpen, setPublishOpen] = useState(false)

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
    setView(VIEW.SUBMISSIONS)
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
  // Drafts have no submissions yet, so they open on settings.
  const activeView = view ?? (isDraft ? VIEW.SETTINGS : VIEW.SUBMISSIONS)
  const availability = getSubjectiveAvailability(test.startAt, test.deadlineAt)
  const counts = test.submissionCounts
  const pending = counts[SubjectiveDisplayStatus.SUBMITTED]
  const checked = counts[SubjectiveDisplayStatus.CHECKED]

  return (
    <div className="space-y-6">
      <Link href={listHref} className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4 mr-1" />
        All tests
      </Link>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <SubjectivePill className={SUBJECTIVE_NEUTRAL_BADGE}>{test.paperType}</SubjectivePill>
              {isDraft ? (
                <SubjectivePill className={SUBJECTIVE_NEUTRAL_BADGE}>Draft</SubjectivePill>
              ) : (
                <SubjectivePill className={SUBJECTIVE_AVAILABILITY_BADGE[availability]}>
                  {SUBJECTIVE_AVAILABILITY_LABEL[availability]}
                </SubjectivePill>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{test.name}</h1>
            <p className="text-sm text-gray-500">
              {[test.batchName, `${test.totalMarks} marks`, `Deadline ${formatDateTime(test.deadlineAt)}`]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            {test.hasQuestionPaper && (
              <DownloadFileButton
                fetchBlob={fetchQuestionPaper}
                fileName={test.questionPaperName ?? `${test.name} - question paper.pdf`}
              >
                Question Paper
              </DownloadFileButton>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => setView(activeView === VIEW.SETTINGS ? VIEW.SUBMISSIONS : VIEW.SETTINGS)}
            >
              {activeView === VIEW.SETTINGS ? (
                <>
                  <ListChecks className="h-4 w-4 mr-2" />
                  Submissions
                </>
              ) : (
                <>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </>
              )}
            </Button>
            {isDraft && (
              <Button type="button" className="bg-blue-600 hover:bg-blue-700" onClick={() => setPublishOpen(true)}>
                <Send className="h-4 w-4 mr-2" />
                Publish
              </Button>
            )}
          </div>
        </div>

        {!isDraft && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatTile label="Submissions" value={pending + checked} valueClass="text-gray-900" />
            <StatTile label="Pending check" value={pending} valueClass="text-amber-500" />
            <StatTile label="Checked" value={checked} valueClass="text-green-500" />
          </div>
        )}
      </div>

      {activeView === VIEW.SUBMISSIONS ? (
        <SubjectiveSubmissionsTab businessId={businessId} test={test} onGraded={() => void loadTest()} />
      ) : (
        <SubjectiveSettingsTab
          businessId={businessId}
          test={test}
          onSaved={() => void loadTest()}
          onDeleted={() => router.push(listHref)}
        />
      )}

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
