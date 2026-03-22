'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/button';
import {
  BatchesService,
  ExamTest,
  ExamTestsService,
  PracticeTest,
  PracticeTestsService,
} from '@/lib/api';
import { Plus, FlaskConical, BookOpen, GraduationCap, HelpCircle, Star } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import { toast } from 'sonner';
import { CreateTestModal, TestKindForm } from '@/components/modals/CreateTestModal';
import { DeleteConfirmModal } from '@/components/modals/DeleteConfirmModal';
import {
  filterTests,
  formatDurationMinutes,
  testStatus,
  testStatusLabel,
} from '@/lib/tests/testUiMappers';
import { TEST_STATUS } from '@/lib/tests/testConstants';
import { TestsFiltersBar } from '@/components/dashboard/tests/TestsFiltersBar';

type UnifiedRow =
  | { kind: 'practice'; test: PracticeTest }
  | { kind: 'exam'; test: ExamTest };

export default function TestsListPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const { business, isAuthenticated, isInitialized } = useAuthStore();

  const [practiceRows, setPracticeRows] = useState<PracticeTest[]>([]);
  const [examRows, setExamRows] = useState<ExamTest[]>([]);
  const [batches, setBatches] = useState<{ id: number; displayName?: string; codeName?: string }[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [batchFilter, setBatchFilter] = useState<number | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all');

  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UnifiedRow | null>(null);

  const businessId = business?.id;

  const load = useCallback(async () => {
    if (typeof businessId !== 'number') return;
    setLoading(true);
    setError(null);
    try {
      const [practiceRes, examRes, batchesRes] = await Promise.all([
        PracticeTestsService.getApiBusinessPracticeTests(businessId),
        ExamTestsService.getApiBusinessExamTests(businessId),
        BatchesService.getApiBatchesAll(),
      ]);

      setPracticeRows(practiceRes.data ?? []);
      setExamRows(examRes.data ?? []);
      const list = (batchesRes?.data ?? []) as { id?: number; displayName?: string; codeName?: string }[];
      setBatches(
        list.map((b: { id?: number; displayName?: string; codeName?: string }) => ({
          id: b.id!,
          displayName: b.displayName,
          codeName: b.codeName,
        })),
      );
    } catch {
      setError('Failed to load tests');
      toast.error('Failed to load tests');
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    if (isInitialized && isAuthenticated && businessId) {
      void load();
    }
  }, [isInitialized, isAuthenticated, businessId, load]);

  const merged: UnifiedRow[] = useMemo(() => {
    const p = practiceRows.map((test) => ({ kind: 'practice' as const, test }));
    const e = examRows.map((test) => ({ kind: 'exam' as const, test }));
    return [...p, ...e].sort((a, b) => {
      const da = new Date(a.test.updatedAt).getTime();
      const db = new Date(b.test.updatedAt).getTime();
      return db - da;
    });
  }, [practiceRows, examRows]);

  const filtered = useMemo(
    () => filterTests(merged, { search, batchFilter, statusFilter }),
    [merged, search, batchFilter, statusFilter],
  );

  const goToDetail = (kind: TestKindForm, id: string) => {
    const base = `/${slug}/dashboard/tests`;
    if (kind === 'practice') router.push(`${base}/practice/${id}`);
    else router.push(`${base}/exam/${id}`);
  };

  const handleCreated = (kind: TestKindForm, testId: string) => {
    void load();
    goToDetail(kind, testId);
  };

  const handleDelete = async () => {
    if (!deleteTarget || typeof businessId !== 'number') return;
    if (deleteTarget.kind === 'practice') {
      await PracticeTestsService.deleteApiBusinessPracticeTests(
        businessId,
        deleteTarget.test.id,
      );
    } else {
      await ExamTestsService.deleteApiBusinessExamTests(businessId, deleteTarget.test.id);
    }
    toast.success('Test deleted');
    void load();
  };

  if (!isInitialized || (loading && !practiceRows.length && !examRows.length)) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex flex-col items-start justify-center gap-1">
            <div className='flex items-center item-center bg-blue-50 rounded-2xl'>
              <div className="h-4 w-4 text-blue-800 flex items-center justify-center">
                <FlaskConical className="h-4 w-4" />
              </div>
              <span className="inline-flex items-center text-blue-800 text-xs font-semibold px-0.5 py-0.5">
                Test Module
              </span>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Tests</h1>
              <p className="text-gray-600 mt-1">
                Create and manage practice and exam tests for your batches.
              </p>
            </div>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setCreateOpen(true)}
            disabled={!businessId}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Test
          </Button>
        </div>
      </div>

      <TestsFiltersBar
        search={search}
        onSearchChange={setSearch}
        batches={batches}
        batchFilter={batchFilter}
        onBatchFilterChange={setBatchFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        searchPlaceholder="Search by title or description…"
      />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          title="No tests yet"
          description="Create a practice or exam test to get started."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((row) => {
            const t = row.test;
            const st = typeof t.status === 'number' ? t.status : 0;
            const isPractice = row.kind === 'practice';
            const TypeIcon = isPractice ? BookOpen : GraduationCap;
            const typeBadgeClass = isPractice
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-amber-50 text-amber-700';
            const statusBadgeClass =
              st === TEST_STATUS.PUBLISHED
                ? 'bg-blue-50 text-blue-700'
                : 'bg-gray-100 text-gray-600';
            return (
              <div
                key={`${row.kind}-${t.id}`}
                onClick={() => goToDetail(row.kind, t.id)}
                className="bg-white hover:bg-gray-50 cursor-pointer border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col gap-3 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`mt-0.5 h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${isPractice ? 'bg-emerald-50' : 'bg-amber-50'}`}
                    >
                      <TypeIcon
                        className={`h-4 w-4 ${isPractice ? 'text-emerald-600' : 'text-amber-600'}`}
                        aria-hidden
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 line-clamp-2">{t.name}</h3>
                      {t.batchName && (
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{t.batchName}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeBadgeClass}`}>
                      {isPractice ? 'Practice' : 'Exam'}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusBadgeClass}`}>
                      {testStatusLabel(st)}
                    </span>
                  </div>
                </div>
                {t.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{t.description}</p>
                )}
                <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm border-t border-gray-100 pt-3">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <HelpCircle className="h-3.5 w-3.5" aria-hidden />
                    <span className="font-medium text-gray-900">{t.totalQuestions ?? '—'}</span>
                    <span>Questions</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Star className="h-3.5 w-3.5" aria-hidden />
                    <span className="font-medium text-gray-900">{t.totalMarks ?? '—'}</span>
                    <span>marks</span>
                  </div>
                  {row.kind === 'exam' && 'durationMinutes' in t && (
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <span className="font-medium text-gray-900">
                        {formatDurationMinutes(t.durationMinutes)}
                      </span>
                      <span>duration</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {businessId && (
        <CreateTestModal
          isOpen={createOpen}
          onClose={() => setCreateOpen(false)}
          businessId={businessId}
          batches={batches}
          onCreated={handleCreated}
        />
      )}

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete test"
        message="This will permanently delete the test and its questions for this business."
        itemName={deleteTarget?.test.name}
      />
    </div>
  );
}
