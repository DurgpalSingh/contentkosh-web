'use client';

import { useParams } from 'next/navigation';
import { StudentTestResultView } from '@/components/dashboard/tests/student/StudentTestResultView';

export default function StudentMyTestResultPage() {
  const params = useParams();
  const kind = params.kind as 'practice' | 'exam';
  const attemptId = params.attemptId as string;
  return <StudentTestResultView kind={kind} attemptId={attemptId} />;
}

