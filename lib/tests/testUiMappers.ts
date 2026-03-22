
import { TEST_STATUS } from './testConstants';
import type { PracticeTest, ExamTest } from '@/lib/api';

export type UnifiedRow =
  | { kind: 'practice'; test: PracticeTest }
  | { kind: 'exam'; test: ExamTest };

/** Mirrors backend `test-enums.ts` numeric values. */
export const testStatus = {
  draft: 0,
  published: 1,
} as const;

export const questionType = {
  singleChoice: 0,
  multipleChoice: 1,
  trueFalse: 2,
  numerical: 3,
  fillInTheBlank: 4,
} as const;

export type QuestionTypeValue = (typeof questionType)[keyof typeof questionType];

export function testStatusLabel(status: number): string {
  return status === testStatus.published ? 'Published' : 'Draft';
}

export function questionTypeLabel(type: number): string {
  const n = type;
  switch (n) {
    case questionType.singleChoice:
      return 'Single choice';
    case questionType.multipleChoice:
      return 'Multiple choice';
    case questionType.trueFalse:
      return 'True / False';
    case questionType.numerical:
      return 'Numerical';
    case questionType.fillInTheBlank:
      return 'Fill in the blank';
    default:
      return `Type ${n}`;
  }
}

export function resultVisibilityExamLabel(v: number): string {
  const n = v;
  return n === 1 ? 'Hidden' : 'After deadline';
}

export function formatDurationMinutes(minutes: number | undefined): string {
  if (minutes == null || Number.isNaN(minutes)) return '—';
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function formatDateTime(iso: string | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function filterTests(
  rows: UnifiedRow[],
  opts: { search: string; batchFilter: number | 'all'; statusFilter: 'all' | 'draft' | 'published' }
): UnifiedRow[] {
  const q = opts.search.trim().toLowerCase();
  const desiredStatus =
    opts.statusFilter === 'all' ? null
    : opts.statusFilter === 'draft' ? TEST_STATUS.DRAFT
    : TEST_STATUS.PUBLISHED;

  return rows.filter((row) => {
    const t = row.test;
    if (opts.batchFilter !== 'all' && String(t.batchId) !== String(opts.batchFilter)) return false;
    if (desiredStatus !== null && (t.status as number) !== desiredStatus) return false;
    if (q) {
      const name = (t.name ?? '').toLowerCase();
      const desc = (t.description ?? '').toLowerCase();
      const batch = (t.batchName ?? '').toLowerCase();
      if (!name.includes(q) && !desc.includes(q) && !batch.includes(q)) return false;
    }
    return true;
  });
}
