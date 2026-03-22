'use client';

import { useParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { TeacherTestDetailView } from '@/components/dashboard/tests/TeacherTestDetailView';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function PracticeTestDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const practiceTestId = params.practiceTestId as string;
  const { business, isInitialized } = useAuthStore();
  const businessId = business?.id;

  if (!isInitialized) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (typeof businessId !== 'number') {
    return (
      <p className="text-sm text-gray-600">Business context is required to view this test.</p>
    );
  }

  return (
    <TeacherTestDetailView
      kind="practice"
      testId={practiceTestId}
      businessId={businessId}
      slug={slug}
    />
  );
}
