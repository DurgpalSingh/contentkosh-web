'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';
import { BatchesService, ExamTestsService, PracticeTestsService } from '@/lib/api';
import { getApiErrorDetailMessage } from '@/lib/tests/getApiErrorDetailMessage';
import type { PracticeCatalogRow, ExamCatalogRow } from '@/lib/tests/studentTestCatalog';
import { StudentTestsListView } from '@/components/dashboard/tests/student/StudentTestsListView';

export default function StudentMyTestListPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { business, isAuthenticated, isInitialized } = useAuthStore();
  const businessId = business?.id;

  const [practiceRows, setPracticeRows] = useState<PracticeCatalogRow[]>([]);
  const [examRows, setExamRows] = useState<ExamCatalogRow[]>([]);
  const [batches, setBatches] = useState<{ id: number; displayName?: string; codeName?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTests = useCallback(async () => {
    if (typeof businessId !== 'number') return;
    setLoading(true);
    setError(null);
    try {
      const [practiceRes, examRes, batchesRes] = await Promise.all([
        PracticeTestsService.getApiBusinessPracticeTestsAvailable(businessId),
        ExamTestsService.getApiBusinessExamTestsAvailable(businessId),
        BatchesService.getApiBatchesAll(),
      ]);
      setPracticeRows((practiceRes.data ?? []) as PracticeCatalogRow[]);
      setExamRows((examRes.data ?? []) as ExamCatalogRow[]);
      const list = (batchesRes?.data ?? []) as { id?: number; displayName?: string; codeName?: string }[];
      setBatches(list.map((b) => ({ id: b.id!, displayName: b.displayName, codeName: b.codeName })));
    } catch (e: unknown) {
      const msg = getApiErrorDetailMessage(e, 'Failed to load tests');
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    if (isInitialized && isAuthenticated && typeof businessId === 'number') {
      void loadTests();
    }
  }, [isInitialized, isAuthenticated, businessId, loadTests]);

  return (
    <StudentTestsListView
      slug={slug}
      practiceRows={practiceRows}
      examRows={examRows}
      batches={batches}
      loading={loading}
      error={error}
    />
  );
}
