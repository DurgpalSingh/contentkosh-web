'use client'

import type { TestAnalyticsAttemptRow } from '@/lib/tests/testAnalyticsTypes'

interface StudentAttemptResultsTableProps {
  rows: TestAnalyticsAttemptRow[]
}

const formatSubmittedAt = (iso: string | undefined): string => {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return '—'
  }
}

const formatTimeTaken = (minutes: number | null): string => {
  if (minutes == null) return '—'
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

const percentageToneClass = (pct: number): string => {
  if (pct >= 70) return 'bg-emerald-100 text-emerald-800'
  if (pct >= 40) return 'bg-amber-100 text-amber-800'
  return 'bg-red-100 text-red-800'
}

export const StudentAttemptResultsTable = ({ rows }: StudentAttemptResultsTableProps) => {
  if (rows.length === 0) {
    return (
      <p className="text-sm text-gray-600 py-6 text-center border border-dashed border-gray-200 rounded-lg">
        No submitted attempts yet.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-left">
            <th className="px-4 py-3 font-medium text-gray-700">Student</th>
            <th className="px-4 py-3 font-medium text-gray-700">Score</th>
            <th className="px-4 py-3 font-medium text-gray-700">Percentage</th>
            <th className="px-4 py-3 font-medium text-gray-700">Time taken</th>
            <th className="px-4 py-3 font-medium text-gray-700">Submitted</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const pct = Math.round(row.percentage ?? 0)
            return (
              <tr key={row.attemptId} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{row.studentName || '—'}</div>
                  <div className="text-xs text-gray-500">{row.studentEmail || ''}</div>
                </td>
                <td className="px-4 py-3 text-gray-800">
                  {row.score ?? 0}/{row.totalScore ?? 0}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${percentageToneClass(pct)}`}
                  >
                    {pct}%
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700">{formatTimeTaken(row.timeTakenMinutes)}</td>
                <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                  {formatSubmittedAt(row.submittedAt)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
