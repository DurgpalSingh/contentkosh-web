'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createIndexedTextFilter } from '@/lib/indexedFiltering';
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
  SubjectsService,
  type Subject,
} from '@/lib/api';
import { Plus, FlaskConical, BookOpen, GraduationCap, HelpCircle, Star } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import { toast } from 'sonner';
import { CreateTestModal } from '@/components/modals/CreateTestModal';
import { DeleteConfirmModal } from '@/components/modals/DeleteConfirmModal';
import {
  formatDurationMinutes,
  type TestListIndexedFacets,
  type UnifiedRow,
  testStatusLabel,
} from '@/lib/tests/testUiMappers';
import {
  TEACHER_TESTS_FILTER,
  TEACHER_TEST_PUBLISH_FILTER,
  TEST_STATUS,
  type TeacherTestsPublishFacet,
} from '@/lib/tests/testConstants';
import { TEST_KIND, TEST_KIND_LABEL, type TestKind } from '@/lib/tests/testConstants';
import { buildTestListSelectedFacets, useTestListSubjectIndex } from '@/lib/subjectsByCourseIndex';
import { teacherExamTestPath, teacherPracticeTestPath } from '@/lib/tests/testPaths';
import {
  TestsFiltersBar,
  type TestsKindFilter,
} from '@/components/dashboard/tests/TestsFiltersBar';

export default function TestsListPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const { business, isAuthenticated, isInitialized } = useAuthStore();

  const [practiceRows, setPracticeRows] = useState<PracticeTest[]>([]);
  const [examRows, setExamRows] = useState<ExamTest[]>([]);
  const [batches, setBatches] = useState<
    { id: number; displayName?: string; codeName?: string; courseId?: number; examId?: number }[]
  >([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [batchFilter, setBatchFilter] = useState<number | typeof TEACHER_TESTS_FILTER.ALL>(
    TEACHER_TESTS_FILTER.ALL,
  );
  const [subjectFilter, setSubjectFilter] = useState<number | typeof TEACHER_TESTS_FILTER.ALL>(
    TEACHER_TESTS_FILTER.ALL,
  );
  const [kindFilter, setKindFilter] = useState<TestsKindFilter>(TEACHER_TESTS_FILTER.ALL);
  const [statusFilter, setStatusFilter] = useState<TeacherTestsPublishFacet>(TEACHER_TEST_PUBLISH_FILTER.ALL);

  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UnifiedRow | null>(null);

  const businessId = business?.id;

  const load = useCallback(async () => {
    if (typeof businessId !== 'number') return;
    setLoading(true);
    setError(null);
    try {
      const [practiceRes, examRes, batchesRes, subjectsRes] = await Promise.all([
        PracticeTestsService.getApiBusinessPracticeTests(businessId),
        ExamTestsService.getApiBusinessExamTests(businessId),
        BatchesService.getApiBatchesAll('course'),
        SubjectsService.getApiSubjectsUser(),
      ]);
      setPracticeRows(practiceRes.data ?? []);
      setExamRows(examRes.data ?? []);
      setSubjects(subjectsRes.data ?? []);
      const list = (batchesRes?.data ?? []) as Array<{
        id?: number
        displayName?: string
        codeName?: string
        courseId?: number
        examId?: number
        course?: { id?: number; examId?: number }
      }>;
      setBatches(list as Array<{ id: number; displayName?: string; codeName?: string; courseId?: number }>);
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
    const p = practiceRows.map((test) => ({ kind: TEST_KIND.PRACTICE, test }));
    const e = examRows.map((test) => ({ kind: TEST_KIND.EXAM, test }));
    return [...p, ...e].sort((a, b) => {
      const da = new Date(a.test.updatedAt).getTime();
      const db = new Date(b.test.updatedAt).getTime();
      return db - da;
    });
  }, [practiceRows, examRows]);

  const subjectIndex = useTestListSubjectIndex(
    subjects,
    batches,
    batchFilter,
    subjectFilter,
    setSubjectFilter,
  );

  const indexedTestFilter = useMemo(() => {
    return createIndexedTextFilter<UnifiedRow, string, TestListIndexedFacets>(merged, {
      getId: (row) => `${row.kind}-${row.test.id}`,
      getSearchText: (row) => {
        const t = row.test;
        const parts = [t.name, t.description, t.batchName, t.subjectName].filter(
          (x): x is string => typeof x === 'string' && x.length > 0,
        );
        return parts.join(' ');
      },
      getCreatedAt: (row) => row.test.updatedAt,
      getFacetValues: (row, id) => {
        const t = row.test;
        const batchId = Number(t.batchId);
        const status = typeof t.status === 'number' ? t.status : 0;
        const entries: Array<readonly [string, keyof TestListIndexedFacets, string | number]> = [
          [id, 'batchId', batchId],
          [id, 'status', status],
          [id, 'kind', row.kind],
        ];
        const sid = t.subjectId;
        if (typeof sid === 'number') entries.push([id, 'subjectId', sid]);
        return entries;
      },
      ngramLength: 3,
    });
  }, [merged]);

  const filtered = useMemo(() => {
    return indexedTestFilter.filter({
      query: search,
      selectedFacets: buildTestListSelectedFacets({
        batchFilter,
        subjectFilter,
        statusFilter,
        kindFilter,
      }),
    });
  }, [
    indexedTestFilter,
    search,
    batchFilter,
    subjectFilter,
    statusFilter,
    kindFilter,
  ]);

  const goToDetail = (kind: TestKind, id: string) => {
    if (kind === TEST_KIND.PRACTICE) router.push(teacherPracticeTestPath(slug, id));
    else router.push(teacherExamTestPath(slug, id));
  };

  const handleCreated = (kind: TestKind, testId: string) => {
    void load();
    goToDetail(kind, testId);
  };

  const handleDelete = async () => {
    if (!deleteTarget || typeof businessId !== 'number') return;
    if (deleteTarget.kind === TEST_KIND.PRACTICE) {
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
        subjectIndex={subjectIndex}
        facets={{
          batch: batchFilter,
          subject: subjectFilter,
          kind: kindFilter,
          status: statusFilter,
        }}
        onFacetsChange={(f) => {
          setBatchFilter(f.batch);
          setSubjectFilter(f.subject);
          setKindFilter(f.kind);
          setStatusFilter(f.status);
        }}
        searchPlaceholder="Search by title, description, batch, or subject…"
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
            const isPractice = row.kind === TEST_KIND.PRACTICE;
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
                <div className="flex items-start justify-items-start gap-2">
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
                      {(t.batchName || t.subjectName) && (
                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                          {[t.batchName, t.subjectName].filter(Boolean).join(' · ')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeBadgeClass}`}>
                      {TEST_KIND_LABEL[row.kind]}
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
                  {row.kind === TEST_KIND.EXAM && 'durationMinutes' in t && (
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
          subjects={subjects}
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
