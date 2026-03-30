import {
  ExamTestsService,
  PracticeTestsService,
} from '@/lib/api';

export type TestKind = 'practice' | 'exam';

export async function downloadTestAnalyticsCsv(
  kind: TestKind,
  businessId: number,
  testId: string,
  downloadBaseName: string,
): Promise<void> {
  const csv =
    kind === 'practice'
      ? await PracticeTestsService.getApiBusinessPracticeTestsAnalyticsExport(
          businessId,
          testId,
        )
      : await ExamTestsService.getApiBusinessExamTestsAnalyticsExport(businessId, testId);

  const blob = new Blob([typeof csv === 'string' ? csv : String(csv)], {
    type: 'text/csv;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${downloadBaseName}-analytics.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
