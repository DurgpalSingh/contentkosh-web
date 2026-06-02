'use client'

import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { StudentAttemptResultsTable } from '@/components/dashboard/tests/analytics/StudentAttemptResultsTable'
import type { TestAnalyticsApiResponse } from '@/lib/tests/testAnalyticsTypes'
import { BarChart3, Loader2, RefreshCw, TrendingDown, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { HtmlContent } from '@/components/common/HtmlContent'

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
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({})

  const toggleExpanded = (id: string) => setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onRefresh}
          disabled={analyticsLoading}
          aria-label="Refresh analytics"
          className="border-blue-200 text-blue-800 hover:bg-blue-50"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
        <Button type="button" variant="outline" onClick={onExportCsv}
          className="border-blue-200 text-blue-800 hover:bg-blue-50"
        >
          Export CSV
        </Button>
      </div>

      {analyticsLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-7 w-7 animate-spin text-blue-600" aria-hidden />
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
                {analytics.questionStats.map((q) => {
                  const expanded = Boolean(expandedIds[q.questionId])
                  return (
                    <li key={q.questionId} className="px-4 py-3 flex items-start justify-between gap-2">
                      <div className="min-w-0 max-w-[70%]">
                        {q.questionText ? (
                          <div>
                            <div className={`text-sm text-gray-800 ${expanded ? '' : 'max-h-[3.2rem] overflow-hidden'}`}>
                              <HtmlContent html={q.questionText} />
                            </div>
                          </div>
                        ) : (
                          <span className="font-mono text-xs text-gray-500">{q.questionId.slice(0, 8)}…</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-800 mr-2">
                          {q.correctCount}/{q.totalAttempts} correct ({formatNum(q.accuracy)}%)
                        </span>
                        {q.questionText && (
                          <button type="button" onClick={() => toggleExpanded(q.questionId)} aria-label="Toggle question text" className="rounded p-1 text-gray-600 hover:bg-gray-100">
                            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>
                        )}
                      </div>
                    </li>
                  )
                })}
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
