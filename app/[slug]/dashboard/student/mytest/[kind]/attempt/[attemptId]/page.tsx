'use client';

import { useParams } from 'next/navigation';
import { StudentAttemptWorkspace } from '@/components/dashboard/tests/student/StudentAttemptWorkspace';

export default function StudentMyTestAttemptPage() {
  const params = useParams();
  const kind = params.kind as 'practice' | 'exam';
  const attemptId = params.attemptId as string;
  return <StudentAttemptWorkspace kind={kind} attemptId={attemptId} />;
}

