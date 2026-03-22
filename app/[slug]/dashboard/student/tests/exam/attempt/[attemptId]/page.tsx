'use client';

import { useParams } from 'next/navigation';
import { StudentAttemptWorkspace } from '@/components/dashboard/tests/student/StudentAttemptWorkspace';

export default function StudentExamAttemptPage() {
  const params = useParams();
  const attemptId = params.attemptId as string;
  return <StudentAttemptWorkspace kind="exam" attemptId={attemptId} />;
}
