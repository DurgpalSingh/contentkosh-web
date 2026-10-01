'use client';

import { useParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { SubjectiveStudentTestView } from '@/components/dashboard/tests/subjective/SubjectiveStudentTestView';

export default function StudentSubjectiveTestPage() {
  const params = useParams();
  const slug = params.slug as string;
  const submissionId = params.submissionId as string;
  const { business, isAuthenticated, isInitialized } = useAuthStore();
  const businessId = business?.id;

  if (!isInitialized) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || typeof businessId !== 'number') return null;

  return <SubjectiveStudentTestView businessId={businessId} submissionId={submissionId} slug={slug} />;
}
