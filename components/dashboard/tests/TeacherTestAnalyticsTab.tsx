'use client'

import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { StudentAttemptResultsTable } from '@/components/dashboard/tests/analytics/StudentAttemptResultsTable'
import type { TestAnalyticsApiResponse } from '@/lib/tests/testAnalyticsTypes'
import { BarChart3, Loader2, RefreshCw, TrendingDown, TrendingUp } from 'lucide-react'

interface TeacherTestAnalyticsTabProps {
  analytics: TestAnalyticsApiResponse | null
  analyticsLoading: boolean
  onRefresh: () => void
  onExportCsv: () => void
}

const formatNum = (n: number | undefined): string => {
  if (n == null || Number.isNaN(n)) return '—'
  return Number.isInteger(n) ? String(n) : n.toFixed(2)
}

export const TeacherTestAnalyticsTab = ({
  analytics,
  analyticsLoading,
  onRefresh,
  onExportCsv,
}: TeacherTestAnalyticsTabProps) => {
  const summary = analytics?.summary

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onRefresh}
          disabled={analyticsLoading}
          aria-label="Refresh analytics"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
        <Button type="button" variant="outline" onClick={onExportCsv}>
          Export CSV
        </Button>
      </div>

      {analyticsLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-7 w-7 animate-spin text-violet-600" aria-hidden />
        </div>
      ) : analytics && summary ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <AnalyticsStatCard label="Total attempts" value={summary.totalAttempts} />
            <AnalyticsStatCard
              label="Average score"
              value={formatNum(summary.averageScore)}
              icon={<BarChart3 className="h-4 w-4 text-violet-600" />}
            />
            <AnalyticsStatCard
              label="Highest score"
              value={formatNum(summary.highestScore)}
              icon={<TrendingUp className="h-4 w-4 text-emerald-600" />}
            />
            <AnalyticsStatCard
              label="Lowest score"
              value={formatNum(summary.lowestScore)}
              icon={<TrendingDown className="h-4 w-4 text-red-600" />}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnalyticsStatCard label="Average %" value={`${formatNum(summary.averagePercentage)}%`} />
            <AnalyticsStatCard label="Pass rate" value={`${formatNum(summary.passRate)}%`} />
          </div>

          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-3">Student results</h3>
            <StudentAttemptResultsTable rows={analytics.attempts} />
          </div>

          {analytics.questionStats.length > 0 && (
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-3">Per-question accuracy</h3>
              <ul className="divide-y divide-gray-200 border border-gray-200 rounded-lg bg-white text-sm">
                {analytics.questionStats.map((q) => (
                  <li key={q.questionId} className="px-4 py-3 flex flex-wrap justify-between gap-2">
                    <span className="font-mono text-xs text-gray-500">{q.questionId.slice(0, 8)}…</span>
                    <span className="text-gray-800">
                      {q.correctCount}/{q.totalAttempts} correct ({formatNum(q.accuracy)}%)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-gray-600">No analytics data.</p>
      )}
    </div>
  )
}

const AnalyticsStatCard = ({
  label,
  value,
  icon,
}: {
  label: string
  value: string | number
  icon?: ReactNode
}) => (
  <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
    <div className="flex items-center justify-between gap-2">
      <p className="text-xs text-gray-500">{label}</p>
      {icon}
    </div>
    <p className="text-xl font-semibold text-gray-900 mt-1">{value}</p>
  </div>
)
