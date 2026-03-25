'use client';

import { Batch, Subject } from '@/lib/api';
import { ChevronDown, Filter } from 'lucide-react';

interface ContentFilterProps {
  batches: Batch[];
  selectedBatchId?: number;
  onBatchChange: (batchId?: number) => void;
  subjects: Subject[];
  selectedSubjectId?: number;
  onSubjectChange: (subjectId?: number) => void;
  label?: string;
}

export function ContentsFilterModal({
  batches,
  selectedBatchId,
  onBatchChange,
  subjects,
  selectedSubjectId,
  onSubjectChange,
}: ContentFilterProps) {
  const selectedBatch = batches.find(b => b.id === selectedBatchId);
  const selectedCourseId = selectedBatch?.courseId;

  const subjectsForCourse = selectedCourseId
    ? subjects.filter(s => s.courseId === selectedCourseId)
    : [];

  return (
    <div className="w-full lg:w-[320px]">
      <div className="mt-1 flex items-start gap-3">
        <div className="relative flex-1">
          <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <select
            value={selectedBatchId ?? ''}
            onChange={(e) => onBatchChange(e.target.value ? Number(e.target.value) : undefined)}
            className="w-full appearance-none rounded-lg border border-slate-300 bg-slate-50 py-2 pl-9 pr-10 text-sm font-semibold text-slate-900 shadow-sm outline-none transition-colors hover:bg-slate-100 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            disabled={batches.length === 0}
          >
            <option value="">Select a batch</option>
            {batches.map((batch) => (
              <option key={batch.id} value={batch.id}>
                {batch.displayName || batch.codeName || 'Unnamed Batch'}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>

        <div className="relative flex-1">
          <select
            value={selectedSubjectId ?? ''}
            onChange={(e) => onSubjectChange(e.target.value ? Number(e.target.value) : undefined)}
            className="w-full appearance-none rounded-lg border border-slate-300 bg-slate-50 py-2 pl-3 pr-10 text-sm font-semibold text-slate-900 shadow-sm outline-none transition-colors hover:bg-slate-100 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            disabled={subjectsForCourse.length === 0}
          >
            <option value="">All subjects</option>
            {subjectsForCourse.map((s) => (
              <option key={s.id!} value={s.id!}>
                {s.name || 'Unnamed Subject'}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
      </div>
    </div>
  );
}
