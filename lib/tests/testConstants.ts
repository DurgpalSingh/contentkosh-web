export const TEACHER_TEST_TAB = {
  QUESTIONS: 'questions',
  ANALYTICS: 'analytics',
  SETTINGS: 'settings',
} as const;

export type TeacherTestTabId = (typeof TEACHER_TEST_TAB)[keyof typeof TEACHER_TEST_TAB];

export const TEACHER_TEST_TAB_LABEL: Record<TeacherTestTabId, string> = {
  questions: 'Questions',
  analytics: 'Analytics & results',
  settings: 'Settings',
};

export const TEST_STATUS = {
  DRAFT: 0,
  PUBLISHED: 1,
} as const;

export const STUDENT_TEST_STATUS = {
  LIVE: 'live',
  STARTS_SOON: 'starts_soon',
  EXPIRED: 'expired',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
} as const;

export type StudentTestDisplayStatus =
  (typeof STUDENT_TEST_STATUS)[keyof typeof STUDENT_TEST_STATUS];

export const EXAM_DURATION_MIN = 1;
export const EXAM_DURATION_MAX = 600;
export const MCQ_MIN_OPTIONS = 4;
