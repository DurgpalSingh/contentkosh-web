"use client"

import { useMemo, useState } from 'react'
import { format, formatDuration, intervalToDuration, isValid, parseISO } from 'date-fns'
import type { TestAnalyticsAttemptRow } from '@/lib/tests/testAnalyticsTypes'
import { sortRows, toggleDir, type SortDir } from '@/lib/utils/sort'

interface StudentAttemptResultsTableProps {
  rows: TestAnalyticsAttemptRow[]
}

const formatSubmittedAt = (iso: string | undefined): string => {
  if (!iso) return '—'
  const parsed = parseISO(iso)
  if (!isValid(parsed)) return '—'
  return format(parsed, 'PPp')
}

const formatTimeTaken = (minutes: number | null): string => {
  if (minutes == null) return '—'
  if (minutes <= 0) return '0 min'
  const duration = intervalToDuration({ start: 0, end: minutes * 60 * 1000 })
  const label = formatDuration(duration, { format: ['hours', 'minutes'] })
  return label || '0 min'
}

const percentageToneClass = (pct: number): string => {
  if (pct >= 70) return 'bg-emerald-100 text-emerald-800'
  if (pct >= 40) return 'bg-amber-100 text-amber-800'
  return 'bg-red-100 text-red-800'
}

export const StudentAttemptResultsTable = ({ rows }: StudentAttemptResultsTableProps) => {
  const [sortBy, setSortBy] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const sorted = useMemo(() => {
    if (!sortBy) return rows
    const accessor = (r: TestAnalyticsAttemptRow) => {
      switch (sortBy) {
        case 'student':
          return (r.studentName || '').toLowerCase()
        case 'score':
          return Number(r.score ?? 0)
        case 'percentage':
          return Number(r.percentage ?? 0)
        case 'time':
          return Number(r.timeTakenMinutes ?? 0)
        case 'submitted':
          return r.submittedAt ? Date.parse(r.submittedAt) : 0
        default:
          return (r as any)[sortBy]
      }
    }
    return sortRows(rows, accessor, sortDir)
  }, [rows, sortBy, sortDir])

  const toggleSort = (key: string) => {
    if (sortBy === key) {
      setSortDir(prev => toggleDir(prev))
    } else {
      setSortBy(key)
      setSortDir('desc')
    }
  }

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
            <th className="px-4 py-3 font-medium text-gray-700">
              <button type="button" onClick={() => toggleSort('student')} className="flex items-center gap-2">
                Student
                {sortBy === 'student' ? (sortDir === 'asc' ? '↑' : '↓') : null}
              </button>
            </th>
            <th className="px-4 py-3 font-medium text-gray-700">
              <button type="button" onClick={() => toggleSort('score')} className="flex items-center gap-2">Score{sortBy === 'score' ? (sortDir === 'asc' ? ' ↑' : ' ↓') : null}</button>
            </th>
            <th className="px-4 py-3 font-medium text-gray-700">
              <button type="button" onClick={() => toggleSort('percentage')} className="flex items-center gap-2">Percentage{sortBy === 'percentage' ? (sortDir === 'asc' ? ' ↑' : ' ↓') : null}</button>
            </th>
            <th className="px-4 py-3 font-medium text-gray-700">
              <button type="button" onClick={() => toggleSort('time')} className="flex items-center gap-2">Time taken{sortBy === 'time' ? (sortDir === 'asc' ? ' ↑' : ' ↓') : null}</button>
            </th>
            <th className="px-4 py-3 font-medium text-gray-700">
              <button type="button" onClick={() => toggleSort('submitted')} className="flex items-center gap-2">Submitted{sortBy === 'submitted' ? (sortDir === 'asc' ? ' ↑' : ' ↓') : null}</button>
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => {
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
