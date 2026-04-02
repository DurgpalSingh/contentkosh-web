import type { ExamAvailableTest } from '@/lib/api/models/ExamAvailableTest';
import type { PracticeAvailableTest } from '@/lib/api/models/PracticeAvailableTest';
import { TEST_KIND } from './testConstants';
import { TEST_ROUTE_SEGMENT as SEG } from '@/lib/tests/testConstants';
import type { TestListSubjectFields } from '@/lib/tests/testUiMappers';
import { STUDENT_TEST_STATUS } from './testConstants';
import type { StudentTestDisplayStatus, TestKind } from './testConstants';

/** Extra fields returned by the backend student catalog (may be missing in older OpenAPI snapshots). */
export type PracticeCatalogRow = PracticeAvailableTest &
  TestListSubjectFields & {
    canStart?: boolean;
    canResume?: boolean;
    attemptStatus?: number | null;
  };

export type ExamCatalogRow = ExamAvailableTest &
  TestListSubjectFields & {
    attemptStatus?: number | null;
    timeRemainingSeconds?: number | null;
  };

export const attemptStatusInProgress = 0;
export const attemptStatusSubmitted = 1;
export const attemptStatusAutoSubmitted = 2;
export const attemptStatusExpired = 3;

export function isAttemptInProgress(status: number | null | undefined): boolean {
  return status === attemptStatusInProgress;
}

export function isAttemptFinished(status: number | null | undefined): boolean {
  if (status == null) return false;
  return (
    status === attemptStatusSubmitted ||
    status === attemptStatusAutoSubmitted ||
    status === attemptStatusExpired
  );
}

export function lockedReasonLabel(reason: number | undefined): string {
  switch (reason) {
    case 0:
      return 'Not started yet';
    case 1:
      return 'Deadline passed';
    case 2:
      return 'Already attempted';
    default:
      return 'Unavailable';
  }
}

export const STUDENT_TEST_ROUTES = {
  BASE: (slug: string) => `/${slug}/${SEG.DASHBOARD}/${SEG.STUDENT}/${SEG.MYTEST}`,
  ATTEMPT: (slug: string, kind: TestKind, attemptId: string) => `${STUDENT_TEST_ROUTES.BASE(slug)}/${kind}/${SEG.ATTEMPT}/${attemptId}`,
  RESULT: (slug: string, kind: TestKind, attemptId: string) => `${STUDENT_TEST_ROUTES.BASE(slug)}/${kind}/${SEG.RESULT}/${attemptId}`,
} as const;

export function studentTestBasePath(slug: string): string {
  return STUDENT_TEST_ROUTES.BASE(slug);
}


export function studentPracticeAttemptPath(slug: string, attemptId: string): string {
  return STUDENT_TEST_ROUTES.ATTEMPT(slug, TEST_KIND.PRACTICE, attemptId);
}

export function studentExamAttemptPath(slug: string, attemptId: string): string {
  return STUDENT_TEST_ROUTES.ATTEMPT(slug, TEST_KIND.EXAM, attemptId);
}

export function studentPracticeResultPath(
  slug: string,
  practiceTestId: string,
  attemptId: string,
): string {
  void practiceTestId;
  return STUDENT_TEST_ROUTES.RESULT(slug, TEST_KIND.PRACTICE, attemptId);
}

export function studentExamResultPath(slug: string, examTestId: string, attemptId: string): string {
  void examTestId;
  return STUDENT_TEST_ROUTES.RESULT(slug, TEST_KIND.EXAM, attemptId);
}

export type { StudentTestDisplayStatus };

export type UnifiedStudentRow =
  | { kind: 'practice'; row: PracticeCatalogRow }
  | { kind: 'exam'; row: ExamCatalogRow };

export const TEST_CARD_ACTION = {
  START: 'start',
  RESUME: 'resume',
  VIEW_RESULT: 'view_result',
  LOCKED: 'locked',
  SOON: 'soon',
  EXPIRED: 'expired',
  NONE: 'none',
} as const;

export type TestCardAction =
  | { type: typeof TEST_CARD_ACTION.START }
  | { type: typeof TEST_CARD_ACTION.RESUME; attemptId: string }
  | { type: typeof TEST_CARD_ACTION.VIEW_RESULT; attemptId: string }
  | { type: typeof TEST_CARD_ACTION.LOCKED; reason?: number | null }
  | { type: typeof TEST_CARD_ACTION.SOON }
  | { type: typeof TEST_CARD_ACTION.EXPIRED }
  | { type: typeof TEST_CARD_ACTION.NONE };

// ── computeTestDisplayStatus ──────────────────────────────────────────────────

export function computeTestDisplayStatus(params: {
  startAt?: string | Date | null;
  deadlineAt?: string | Date | null;
  attemptStatus?: number | null;
  now?: Date;
}): StudentTestDisplayStatus {
  const now = params.now ?? new Date();
  const start = params.startAt ? new Date(params.startAt) : null;
  const deadline = params.deadlineAt ? new Date(params.deadlineAt) : null;

  if (start && now < start) return STUDENT_TEST_STATUS.STARTS_SOON;
  if (deadline && now > deadline) return STUDENT_TEST_STATUS.EXPIRED;

  const s = params.attemptStatus;
  if (s === attemptStatusInProgress) return STUDENT_TEST_STATUS.IN_PROGRESS;
  if (s === attemptStatusSubmitted || s === attemptStatusAutoSubmitted) return STUDENT_TEST_STATUS.COMPLETED;
  return STUDENT_TEST_STATUS.LIVE;
}

export function computeTestCardActions(item: UnifiedStudentRow, displayStatus: StudentTestDisplayStatus): TestCardAction[] {
  const { kind, row } = item;
  const attemptId = row.attemptId ?? undefined;
  const attemptStatus = 'attemptStatus' in row ? (row as PracticeCatalogRow | ExamCatalogRow).attemptStatus : undefined;

  if (kind === 'practice') {
    const pr = row as PracticeCatalogRow;
    const actions: TestCardAction[] = [];
    if (pr.canResume && attemptId) {
      actions.push({ type: TEST_CARD_ACTION.RESUME, attemptId });
    } else if (pr.canStart !== false) {
      actions.push({ type: TEST_CARD_ACTION.START });
    }
    if (isAttemptFinished(attemptStatus) && attemptId) {
      actions.push({ type: TEST_CARD_ACTION.VIEW_RESULT, attemptId });
    }
    return actions;
  }

  // For exam, only one action
  const er = row as ExamCatalogRow;
  if (displayStatus === STUDENT_TEST_STATUS.STARTS_SOON) {
    return [{ type: TEST_CARD_ACTION.SOON }];
  }
  if (isAttemptFinished(attemptStatus) && attemptId) {
    return [{ type: TEST_CARD_ACTION.VIEW_RESULT, attemptId }];
  }
  if (displayStatus === STUDENT_TEST_STATUS.EXPIRED && !isAttemptFinished(attemptStatus)) {
    return [{ type: TEST_CARD_ACTION.EXPIRED }];
  }
  if (er.canAttempt === false) {
    return [{ type: TEST_CARD_ACTION.LOCKED, reason: er.lockedReason }];
  }
  if (isAttemptInProgress(attemptStatus) && attemptId) {
    return [{ type: TEST_CARD_ACTION.RESUME, attemptId }];
  }

  return [{ type: TEST_CARD_ACTION.START }];
}

// ── buildCardViewModel ────────────────────────────────────────────────────────

export type StudentTestCardViewModel = {
  id: string;
  kind: 'practice' | 'exam';
  kindLabel: string;
  badgeClass: string;
  name: string;
  batchName: string;
  subjectName?: string;
  description?: string | null;
  totalQuestions: number | null;
  totalMarks: number | null;
  durationMinutes?: number;
  deadlineAt?: string;
  bestScore?: number | null;
  lockedReason?: number | null;
  displayStatus: StudentTestDisplayStatus;
  actions: TestCardAction[];
};

export function buildCardViewModel(item: UnifiedStudentRow, now?: Date): StudentTestCardViewModel {
  const { kind, row } = item;
  const isPractice = kind === 'practice';
  const displayStatus = computeTestDisplayStatus({
    startAt: 'startAt' in row ? (row as ExamCatalogRow).startAt : undefined,
    deadlineAt: 'deadlineAt' in row ? (row as ExamCatalogRow).deadlineAt : undefined,
    attemptStatus: 'attemptStatus' in row ? row.attemptStatus : undefined,
    now,
  });
  const actions = computeTestCardActions(item, displayStatus);
  return {
    id: row.id,
    kind,
    kindLabel: isPractice ? 'Practice' : 'Exam',
    badgeClass: isPractice ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800',
    name: row.name,
    batchName: row.batchName ?? '',
    subjectName: row.subjectName,
    description: row.description,
    totalQuestions: row.totalQuestions ?? null,
    totalMarks: row.totalMarks ?? null,
    durationMinutes: 'durationMinutes' in row ? (row as ExamCatalogRow).durationMinutes ?? undefined : undefined,
    deadlineAt: 'deadlineAt' in row ? (row as ExamCatalogRow).deadlineAt ?? undefined : undefined,
    bestScore: isPractice ? (row as PracticeCatalogRow).bestScore ?? undefined : undefined,
    lockedReason: !isPractice ? (row as ExamCatalogRow).lockedReason ?? undefined : undefined,
    displayStatus,
    actions,
  };
}
