'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Calendar } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/button';

export default function LegacyBatchDetailsPage() {
  const { business, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  const batchId = Number(searchParams.get('id'));
  const hasValidBatchId = Number.isInteger(batchId) && batchId > 0;

  useEffect(() => {
    if (!isAuthenticated || !business?.slug || !hasValidBatchId) return;
    router.replace(`/${business.slug}/dashboard/batches/${batchId}`);
  }, [batchId, business?.slug, hasValidBatchId, isAuthenticated, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (hasValidBatchId && business?.slug) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <div className="bg-slate-100 p-6 rounded-full">
        <Calendar className="h-12 w-12 text-slate-400" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800">No Batch Selected</h2>
      <p className="text-slate-500 max-w-md">
        Please open <b>Batches</b> and click <b>Show Details</b> to view a batch.
      </p>
      <Button onClick={() => router.push(`/${business?.slug}/dashboard/batches`)} className="mt-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Go to Batches
      </Button>
    </div>
  );
}
