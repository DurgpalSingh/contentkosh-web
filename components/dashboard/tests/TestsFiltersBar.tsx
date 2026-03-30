'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

export type TestsFiltersBatch = {
  id: number
  displayName?: string
  codeName?: string
}

export type TestsFiltersStatus = 'all' | 'draft' | 'published'

export interface TestsFiltersBarProps {
  search: string
  onSearchChange: (next: string) => void

  batches: TestsFiltersBatch[]
  batchFilter: number | 'all'
  onBatchFilterChange: (next: number | 'all') => void

  statusFilter: TestsFiltersStatus
  onStatusFilterChange: (next: TestsFiltersStatus) => void

  searchPlaceholder?: string
}

export function TestsFiltersBar({
  search,
  onSearchChange,
  batches,
  batchFilter,
  onBatchFilterChange,
  statusFilter,
  onStatusFilterChange,
  searchPlaceholder = 'Search tests…',
}: TestsFiltersBarProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          className="pl-9"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search tests"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          className="border rounded-md h-10 px-3 text-sm bg-white"
          value={batchFilter === 'all' ? '' : batchFilter}
          onChange={(e) =>
            onBatchFilterChange(e.target.value === '' ? 'all' : Number(e.target.value))
          }
          aria-label="Filter by batch"
        >
          <option value="">All batches</option>
          {batches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.displayName || b.codeName || `Batch ${b.id}`}
            </option>
          ))}
        </select>

        <select
          className="border rounded-md h-10 px-3 text-sm bg-white"
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value as TestsFiltersStatus)}
          aria-label="Filter by status"
        >
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>
    </div>
  )
}

