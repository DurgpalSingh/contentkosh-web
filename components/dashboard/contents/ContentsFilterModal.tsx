'use client';

import { Batch, Subject } from '@/lib/api';
import { Filter } from 'lucide-react';
import { Select } from '@/components/ui/select';

interface ContentFilterProps {
  batches: Batch[];
  selectedBatchId?: number;
  onBatchChange: (batchId?: number) => void;
  subjectsForCourse: Subject[];
  selectedSubjectId?: number;
  onSubjectChange: (subjectId?: number) => void;
  label?: string;
}

export function ContentsFilterModal({
  batches,
  selectedBatchId,
  onBatchChange,
  subjectsForCourse,
  selectedSubjectId,
  onSubjectChange,
}: ContentFilterProps) {
  return (
    <div className="w-full xl:w-[360px]">
      <div className="mt-1 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="relative flex-1 min-w-0">
          <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Select
            id="contents-batch-filter"
            value={selectedBatchId ?? ''}
            onChange={(value) =>
              onBatchChange(value === '' ? undefined : Number(value))
            }
            options={[
              { value: '', label: 'Select a batch' },
              ...batches.flatMap((batch) =>
                typeof batch.id === 'number'
                  ? [
                      {
                        value: batch.id,
                        label: batch.displayName || batch.codeName || 'Unnamed Batch',
                      },
                    ]
                  : [],
              ),
            ]}
            disabled={batches.length === 0}
            triggerClassName="w-full truncate rounded-lg border border-slate-300 bg-slate-50 py-2 pl-9 pr-10 text-sm font-semibold text-slate-900 shadow-sm outline-none transition-colors hover:bg-slate-100 focus:border-transparent focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="relative flex-1 min-w-0">
          <Select
            id="contents-subject-filter"
            value={selectedSubjectId ?? ''}
            onChange={(value) =>
              onSubjectChange(value === '' ? undefined : Number(value))
            }
            options={[
              { value: '', label: 'All subjects' },
              ...subjectsForCourse.map((s) => ({
                value: s.id ?? 0,
                label: s.name || 'Unnamed Subject',
              })),
            ]}
            disabled={subjectsForCourse.length === 0}
            triggerClassName="w-full truncate rounded-lg border border-slate-300 bg-slate-50 py-2 pl-3 pr-10 text-sm font-semibold text-slate-900 shadow-sm outline-none transition-colors hover:bg-slate-100 focus:border-transparent focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
