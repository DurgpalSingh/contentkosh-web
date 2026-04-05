import type { PracticeTest, ExamTest } from '@/lib/api';
import { TEST_KIND } from '@/lib/tests/testConstants';

/** Present on list API responses; generated OpenAPI models may omit these. */
export type TestListSubjectFields = {
  subjectId?: number | null;
  subjectName?: string;
};

export type PracticeTestWithListFields = PracticeTest & TestListSubjectFields;
export type ExamTestWithListFields = ExamTest & TestListSubjectFields;

export type UnifiedRow =
  | { kind: typeof TEST_KIND.PRACTICE; test: PracticeTestWithListFields }
  | { kind: typeof TEST_KIND.EXAM; test: ExamTestWithListFields };

/** Facet keys for `createIndexedTextFilter` on teacher/student test lists. */
export type TestListIndexedFacets = {
  batchId: number;
  subjectId: number;
  status: number;
  kind: string;
};

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

