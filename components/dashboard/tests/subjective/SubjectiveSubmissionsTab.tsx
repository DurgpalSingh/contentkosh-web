'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2, RefreshCw, Search } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import {
  SubjectiveDisplayStatus,
  SubjectiveTestsService,
  type SubjectiveRosterRow,
  type SubjectiveTest,
} from '@/lib/api'
import { SubjectiveGradeModal } from '@/components/dashboard/tests/subjective/SubjectiveGradeModal'
import { formatDateTime } from '@/lib/tests/testUiMappers'
import {
  SUBJECTIVE_DISPLAY_STATUS_BADGE,
  SUBJECTIVE_DISPLAY_STATUS_LABEL,
} from '@/lib/tests/subjectiveTestConstants'
import { SUBJECTIVE_SUBMISSIONS_PAGE_SIZE } from '@/lib/tests/subjectiveTest.config'
import { getApiErrorDetailMessage } from '@/lib/tests/getApiErrorDetailMessage'

const ALL_STATUSES = 'all'
const SEARCH_DEBOUNCE_MS = 300

const STATUS_OPTIONS = [
  { value: ALL_STATUSES, label: 'All statuses' },
  ...(Object.values(SubjectiveDisplayStatus) as SubjectiveDisplayStatus[]).map((status) => ({
    value: status,
    label: SUBJECTIVE_DISPLAY_STATUS_LABEL[status],
  })),
]

const isGradable = (row: SubjectiveRosterRow) =>
  Boolean(row.submissionId) &&
  (row.displayStatus === SubjectiveDisplayStatus.SUBMITTED || row.displayStatus === SubjectiveDisplayStatus.CHECKED)

/** Batch roster with each student's submission; submitted/checked rows open the grading modal. */
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="relative sm:max-w-xs flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search student name or email…"
              className="pl-9"
            />
          </div>
          <div className="sm:w-48">
            <Select
              id="submission-status-filter"
              value={statusFilter}
              onChange={(v) => {
                setStatusFilter(v as SubjectiveDisplayStatus | typeof ALL_STATUSES)
                setPage(1)
              }}
              options={STATUS_OPTIONS}
              placeholder="All statuses"
            />
          </div>
        </div>
        <Button type="button" variant="outline" onClick={() => void load()} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Submitted</th>
              <th className="px-4 py-3">Marks</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-blue-600" aria-hidden />
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                  No students match these filters.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.studentId}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{row.studentName}</div>
                    <div className="text-xs text-gray-500">{row.studentEmail}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${SUBJECTIVE_DISPLAY_STATUS_BADGE[row.displayStatus]}`}
                    >
                      {SUBJECTIVE_DISPLAY_STATUS_LABEL[row.displayStatus]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{row.submittedAt ? formatDateTime(row.submittedAt) : '—'}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {row.marksAwarded != null ? `${row.marksAwarded} / ${test.totalMarks}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {isGradable(row) && (
                      <Button type="button" size="sm" variant="outline" onClick={() => setGradeTarget(row)}>
                        {row.displayStatus === SubjectiveDisplayStatus.CHECKED ? 'Update grade' : 'Review'}
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
