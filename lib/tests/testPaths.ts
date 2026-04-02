/** Teacher dashboard routes under `/[slug]/dashboard/tests`. */
import { TEST_ROUTE_SEGMENT as SEG, TEST_KIND } from '@/lib/tests/testConstants';

export function teacherTestsListPath(slug: string): string {
  return `/${slug}/${SEG.DASHBOARD}/${SEG.TESTS}`;
}

export function teacherPracticeTestPath(slug: string, practiceTestId: string): string {
  return `${teacherTestsListPath(slug)}/${TEST_KIND.PRACTICE}/${practiceTestId}`;
}

export function teacherExamTestPath(slug: string, examTestId: string): string {
  return `${teacherTestsListPath(slug)}/${TEST_KIND.EXAM}/${examTestId}`;
}

/**
 * Matches `/[slug]/dashboard/student/mytest/(practice|exam)/attempt/[attemptId]`.
 * Used by dashboard layout to hide chrome on fullscreen student attempts.
 */
export function isStudentAttemptFullscreenPath(pathname: string): boolean {
  const { DASHBOARD, STUDENT, MYTEST, ATTEMPT } = SEG;
  const kindAlt = `${TEST_KIND.PRACTICE}|${TEST_KIND.EXAM}`;
  const pattern = new RegExp(
    `^/[^/]+/${DASHBOARD}/${STUDENT}/${MYTEST}/(?:${kindAlt})/${ATTEMPT}/[^/]+`,
  );
  return pattern.test(pathname);
}
