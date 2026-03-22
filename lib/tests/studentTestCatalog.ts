import type { ExamAvailableTest } from '@/lib/api/models/ExamAvailableTest';
import type { PracticeAvailableTest } from '@/lib/api/models/PracticeAvailableTest';
import { STUDENT_TEST_STATUS } from './testConstants';
import type { StudentTestDisplayStatus } from './testConstants';

/** Extra fields returned by the backend student catalog (may be missing in older OpenAPI snapshots). */
export type PracticeCatalogRow = PracticeAvailableTest & {
  canStart?: boolean;
  canResume?: boolean;
  attemptStatus?: number | null;
};

export type ExamCatalogRow = ExamAvailableTest & {
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

export function studentTestBasePath(slug: string): string {
  return `/${slug}/dashboard/student/tests`;
}

export function studentPracticeAttemptPath(slug: string, attemptId: string): string {
  return `${studentTestBasePath(slug)}/practice/attempt/${attemptId}`;
}

export function studentExamAttemptPath(slug: string, attemptId: string): string {
  return `${studentTestBasePath(slug)}/exam/attempt/${attemptId}`;
}

export function studentPracticeResultPath(
  slug: string,
  practiceTestId: string,
  attemptId: string,
): string {
  return `${studentTestBasePath(slug)}/practice/${practiceTestId}/result/${attemptId}`;
}

export function studentExamResultPath(slug: string, examTestId: string, attemptId: string): string {
  return `${studentTestBasePath(slug)}/exam/${examTestId}/result/${attemptId}`;
}

export type { StudentTestDisplayStatus };

export type UnifiedStudentRow =
  | { kind: 'practice'; row: PracticeCatalogRow }
  | { kind: 'exam'; row: ExamCatalogRow };

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

export type TestCardAction =
  | { type: 'start' }
  | { type: 'resume'; attemptId: string }
  | { type: 'view_result'; attemptId: string }
  | { type: 'locked'; reason?: number | null }
  | { type: 'soon' }
  | { type: 'expired' }
  | { type: 'none' };

export function computeTestCardActions(item: UnifiedStudentRow, displayStatus: StudentTestDisplayStatus): TestCardAction[] {
  const { kind, row } = item;
  const attemptId = row.attemptId ?? undefined;
  const attemptStatus = 'attemptStatus' in row ? (row as PracticeCatalogRow | ExamCatalogRow).attemptStatus : undefined;

  if (kind === 'practice') {
    const pr = row as PracticeCatalogRow;
    const actions: TestCardAction[] = [];
    if (pr.canResume && attemptId) {
      actions.push({ type: 'resume', attemptId });
    } else if (pr.canStart !== false) {
      actions.push({ type: 'start' });
    }
    if (isAttemptFinished(attemptStatus) && attemptId) {
      actions.push({ type: 'view_result', attemptId });
    }
    return actions;
  }

  // For exam, only one action
  const er = row as ExamCatalogRow;
  if (displayStatus === STUDENT_TEST_STATUS.STARTS_SOON) {
    return [{ type: 'soon' }];
  }
  if (isAttemptFinished(attemptStatus) && attemptId) {
    return [{ type: 'view_result', attemptId }];
  }
  if (displayStatus === STUDENT_TEST_STATUS.EXPIRED && !isAttemptFinished(attemptStatus)) {
    return [{ type: 'expired' }];
  }
  if (er.canAttempt === false) {
    return [{ type: 'locked', reason: er.lockedReason }];
  }
  if (isAttemptInProgress(attemptStatus) && attemptId) {
    return [{ type: 'resume', attemptId }];
  }
  
  return [{ type: 'start' }];
}

// ── buildCardViewModel ────────────────────────────────────────────────────────

export type StudentTestCardViewModel = {
  id: string;
  kind: 'practice' | 'exam';
  kindLabel: string;
  badgeClass: string;
  name: string;
  batchName: string;
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
