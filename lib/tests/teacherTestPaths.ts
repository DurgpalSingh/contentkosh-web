/** Teacher dashboard routes under `/[slug]/dashboard/tests`. */

export function teacherTestsListPath(slug: string): string {
  return `/${slug}/dashboard/tests`;
}

export function teacherPracticeTestPath(slug: string, practiceTestId: string): string {
  return `${teacherTestsListPath(slug)}/practice/${practiceTestId}`;
}

export function teacherExamTestPath(slug: string, examTestId: string): string {
  return `${teacherTestsListPath(slug)}/exam/${examTestId}`;
}
