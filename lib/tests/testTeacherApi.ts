import {
  ExamTestsService,
  PracticeTestsService,
} from '@/lib/api';
import { TEST_KIND, type QuestionTestKind } from '@/lib/tests/testConstants';
import { saveBlob } from '@/lib/utils/saveBlob';

export type { QuestionTestKind };

export async function downloadTestAnalyticsCsv(
  kind: QuestionTestKind,
  businessId: number,
  testId: string,
  downloadBaseName: string,
): Promise<void> {
  const csv =
    kind === TEST_KIND.PRACTICE
      ? await PracticeTestsService.getApiBusinessPracticeTestsAnalyticsExport(
          businessId,
          testId,
        )
      : await ExamTestsService.getApiBusinessExamTestsAnalyticsExport(businessId, testId);

  const blob = new Blob([typeof csv === 'string' ? csv : String(csv)], {
    type: 'text/csv;charset=utf-8',
  });
  saveBlob(blob, `${downloadBaseName}-analytics.csv`);
}
