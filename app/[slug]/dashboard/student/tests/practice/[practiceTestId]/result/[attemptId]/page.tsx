'use client';

import { useParams } from 'next/navigation';
import { StudentTestResultView } from '@/components/dashboard/tests/student/StudentTestResultView';

export default function StudentPracticeResultPage() {
  const params = useParams();
  const attemptId = params.attemptId as string;
  return <StudentTestResultView kind="practice" attemptId={attemptId} />;
}
