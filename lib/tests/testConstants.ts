export const TEACHER_TESTS_FILTER = {
  ALL: 'all',
} as const;

export const TEACHER_TEST_PUBLISH_FILTER = {
  ALL: 'all',
  DRAFT: 'draft',
  PUBLISHED: 'published',
} as const;

export type TeacherTestsKindFacet =
  | (typeof TEACHER_TESTS_FILTER)['ALL']
  | TestKind;

export type TeacherTestsPublishFacet =
  (typeof TEACHER_TEST_PUBLISH_FILTER)[keyof typeof TEACHER_TEST_PUBLISH_FILTER];

  export const TEST_KIND = {
  PRACTICE: 'practice',
  EXAM: 'exam',
} as const;

/** Structural URL segments for dashboard test routes (excluding business slug and dynamic ids). */
export const TEST_ROUTE_SEGMENT = {
  DASHBOARD: 'dashboard',
  TESTS: 'tests',
  STUDENT: 'student',
  MYTEST: 'mytest',
  ATTEMPT: 'attempt',
  RESULT: 'result',
} as const;

export type TestKind = (typeof TEST_KIND)[keyof typeof TEST_KIND];

export const TEST_KIND_LABEL: Record<TestKind, string> = {
  [TEST_KIND.PRACTICE]: 'Practice',
  [TEST_KIND.EXAM]: 'Exam',
};

export function isTestKind(value: string): value is TestKind {
  return value === TEST_KIND.PRACTICE || value === TEST_KIND.EXAM;
}

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
