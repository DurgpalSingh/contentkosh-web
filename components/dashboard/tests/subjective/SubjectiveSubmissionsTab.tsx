'use client'

import { useCallback, useEffect, useState } from 'react'
import { FileText, Loader2, RefreshCw, Search, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import {
  SubjectiveDisplayStatus,
  SubjectiveTestFilesService,
  SubjectiveTestsService,
  type SubjectiveRosterRow,
  type SubjectiveTest,
} from '@/lib/api'
import { DownloadFileButton } from '@/components/common/DownloadFileButton'
import { SubjectiveGradeModal } from '@/components/dashboard/tests/subjective/SubjectiveGradeModal'
import { SubjectiveStatusBadge } from '@/components/dashboard/tests/subjective/SubjectiveStatusBadge'
import { formatDateTime } from '@/lib/tests/testUiMappers'
import { SUBJECTIVE_STAFF_STATUS_LABEL } from '@/lib/tests/subjectiveTestConstants'
import { SUBJECTIVE_SUBMISSIONS_PAGE_SIZE } from '@/lib/tests/subjectiveTest.config'
import { getApiErrorDetailMessage } from '@/lib/tests/getApiErrorDetailMessage'

const ALL_STATUSES = 'all'
const SEARCH_DEBOUNCE_MS = 300

const STATUS_OPTIONS = [
  { value: ALL_STATUSES, label: 'All Status' },
  ...(Object.values(SubjectiveDisplayStatus) as SubjectiveDisplayStatus[]).map((status) => ({
    value: status,
    label: SUBJECTIVE_STAFF_STATUS_LABEL[status],
  })),
]

function SubmissionCard({
  row,
  businessId,
  test,
  onGrade,
}: {
  row: SubjectiveRosterRow
  businessId: number
  test: SubjectiveTest
  onGrade: () => void
}) {
  const submissionId = row.submissionId
  const isChecked = row.displayStatus === SubjectiveDisplayStatus.CHECKED
  const canGrade = Boolean(submissionId) && (isChecked || row.displayStatus === SubjectiveDisplayStatus.SUBMITTED)
  const answerName = row.answerSheetName ?? `${row.studentName} - answer sheet.pdf`

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-gray-900">{row.studentName}</h3>
            <SubjectiveStatusBadge status={row.displayStatus} audience="staff" />
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-gray-500">
            <span>{row.studentEmail}</span>
            {row.answerSheetName && (
              <span className="inline-flex items-center gap-1">
                <FileText className="h-4 w-4" aria-hidden />
                {row.answerSheetName}
              </span>
            )}
            {row.submittedAt && <span>Submitted: {formatDateTime(row.submittedAt)}</span>}
            {isChecked && row.marksAwarded != null && (
              <span className="font-semibold text-green-600">
                Marks: {row.marksAwarded}/{test.totalMarks}
              </span>
            )}
          </div>
          {row.remarks && (
            <p className="rounded-lg bg-gray-50 px-4 py-2 text-sm text-gray-600">Remarks: {row.remarks}</p>
          )}
        </div>

        {submissionId && canGrade && (
          <div className="flex flex-wrap gap-2 shrink-0">
            <DownloadFileButton
              fetchBlob={() => SubjectiveTestFilesService.getStaffAnswerSheet(businessId, test.id, submissionId)}
              fileName={answerName}
            >
              Answer Sheet
            </DownloadFileButton>
            {row.hasCheckedAnswerSheet && (
              <DownloadFileButton
                fetchBlob={() => SubjectiveTestFilesService.getStaffCheckedAnswerSheet(businessId, test.id, submissionId)}
                fileName={`${row.studentName} - checked copy.pdf`}
              >
                Checked Copy
              </DownloadFileButton>
            )}
            <Button type="button" className="bg-blue-600 hover:bg-blue-700" onClick={onGrade}>
              {isChecked ? <RefreshCw className="h-4 w-4 mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
              {isChecked ? 'Replace Checked' : 'Upload Checked'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

/** Batch roster with each student's submission; submitted/checked rows can be graded. */
export function SubjectiveSubmissionsTab({
  businessId,
  test,
  onGraded,
}: {
  businessId: number
  test: SubjectiveTest
  onGraded: () => void
}) {
  const [rows, setRows] = useState<SubjectiveRosterRow[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<SubjectiveDisplayStatus | typeof ALL_STATUSES>(ALL_STATUSES)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [gradeTarget, setGradeTarget] = useState<SubjectiveRosterRow | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [searchInput])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await SubjectiveTestsService.getApiBusinessSubjectiveTestsSubmissions1(
        businessId,
        test.id,
        statusFilter === ALL_STATUSES ? undefined : statusFilter,
        search || undefined,
        page,
        SUBJECTIVE_SUBMISSIONS_PAGE_SIZE,
      )
      setRows(res.data?.items ?? [])
      setTotal(res.data?.total ?? 0)
    } catch (e: unknown) {
      toast.error(getApiErrorDetailMessage(e, 'Failed to load submissions'))
    } finally {
      setLoading(false)
    }
  }, [businessId, test.id, statusFilter, search, page])

  useEffect(() => {
    void load()
  }, [load])

  const pageCount = Math.max(1, Math.ceil(total / SUBJECTIVE_SUBMISSIONS_PAGE_SIZE))

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search students..."
            className="h-12 rounded-xl bg-white pl-11"
          />
        </div>
        <div className="sm:w-60">
          <Select
            id="submission-status-filter"
            value={statusFilter}
            onChange={(v) => {
              setStatusFilter(v as SubjectiveDisplayStatus | typeof ALL_STATUSES)
              setPage(1)
            }}
            options={STATUS_OPTIONS}
            placeholder="All Status"
          />
        </div>
      </div>

      {loading && rows.length === 0 ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" aria-hidden />
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center text-sm text-gray-500">
          No students match these filters.
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((row) => (
            <SubmissionCard
              key={row.studentId}
              row={row}
              businessId={businessId}
              test={test}
              onGrade={() => setGradeTarget(row)}
            />
          ))}
        </div>
      )}

      {total > SUBJECTIVE_SUBMISSIONS_PAGE_SIZE && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Page {page} of {pageCount} · {total} students
          </span>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= pageCount}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {gradeTarget?.submissionId && (
        <SubjectiveGradeModal
          key={gradeTarget.submissionId}
          isOpen
          onClose={() => setGradeTarget(null)}
          businessId={businessId}
          test={test}
          submissionId={gradeTarget.submissionId}
          studentName={gradeTarget.studentName}
          onSaved={() => {
            setGradeTarget(null)
            void load()
            onGraded()
          }}
        />
      )}
    </div>
  )
}
