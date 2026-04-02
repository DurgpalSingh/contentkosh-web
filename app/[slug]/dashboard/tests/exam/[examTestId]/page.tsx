'use client';

import { useParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { TeacherTestDetailView } from '@/components/dashboard/tests/TeacherTestDetailView';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { TEST_KIND } from '@/lib/tests/testConstants';

export default function ExamTestDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const examTestId = params.examTestId as string;
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
    <TeacherTestDetailView kind={TEST_KIND.EXAM} testId={examTestId} businessId={businessId} slug={slug} />
  );
}
