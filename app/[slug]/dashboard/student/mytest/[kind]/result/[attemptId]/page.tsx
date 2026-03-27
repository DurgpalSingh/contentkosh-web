'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/button';
import {
  ExamTestsService,
  PracticeTestsService,
  type PracticeTestAttemptDetails,
  type ExamTestAttemptDetails,
} from '@/lib/api';
import { toast } from 'sonner';
import { getApiErrorDetailMessage } from '@/lib/tests/getApiErrorDetailMessage';
import { studentTestBasePath } from '@/lib/tests/studentTestCatalog';
import { StudentTestResultView } from '@/components/dashboard/tests/student/StudentTestResultView';

type AttemptDetails = PracticeTestAttemptDetails | ExamTestAttemptDetails;

export default function StudentMyTestResultPage() {
  const params = useParams();
  const slug = params.slug as string;
  const kind = params.kind as 'practice' | 'exam';
  const attemptId = params.attemptId as string;
  const { business, isAuthenticated, isInitialized } = useAuthStore();
  const businessId = business?.id;

  const [details, setDetails] = useState<AttemptDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (typeof businessId !== 'number') return;
    setLoading(true);
    setError(null);
    try {
      const res =
        kind === 'practice'
          ? await PracticeTestsService.getApiBusinessPracticeTestsAttempts(businessId, attemptId)
          : await ExamTestsService.getApiBusinessExamTestsAttempts(businessId, attemptId);
      const data = res.data;
      if (!data) {
        setError('Could not load results');
        return;
      }
      setDetails(data);
    } catch (e: unknown) {
      const msg = getApiErrorDetailMessage(e, 'Failed to load results');
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [businessId, kind, attemptId]);

  useEffect(() => {
    if (isInitialized && isAuthenticated && typeof businessId === 'number') {
      void load();
    }
  }, [isInitialized, isAuthenticated, businessId, load]);

  if (!isInitialized || (loading && !details)) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || typeof businessId !== 'number') return null;

  if (error && !details) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
        <Button variant="outline" asChild>
          <Link href={studentTestBasePath(slug)}>Back to My Tests</Link>
        </Button>
      </div>
    );
  }

  if (!details) return null;

  return <StudentTestResultView kind={kind} attemptId={attemptId} slug={slug} details={details} />;
}
