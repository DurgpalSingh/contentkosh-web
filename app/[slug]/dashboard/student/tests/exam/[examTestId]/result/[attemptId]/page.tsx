'use client';

import { useParams } from 'next/navigation';
import { StudentTestResultView } from '@/components/dashboard/tests/student/StudentTestResultView';

export default function StudentExamResultPage() {
  const params = useParams();
  const attemptId = params.attemptId as string;
  return <StudentTestResultView kind="exam" attemptId={attemptId} />;
}
