'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FlaskConical } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { ExamTestsService, PracticeTestsService, type Subject } from '@/lib/api';
import { createIndexedTextFilter } from '@/lib/indexedFiltering';
import { EmptyState } from '@/components/common/EmptyState';
import type { PracticeCatalogRow, ExamCatalogRow, UnifiedStudentRow } from '@/lib/tests/studentTestCatalog';
import {
  buildCardViewModel,
  lockedReasonLabel,
  studentExamAttemptPath,
  studentExamResultPath,
  studentPracticeAttemptPath,
  studentPracticeResultPath,
  TEST_CARD_ACTION,
} from '@/lib/tests/studentTestCatalog';
import { StartAttemptConfirmModal, type StartAttemptTestInfo } from '@/components/modals/StartAttemptConfirmModal';
import { formatDateTime, formatDurationMinutes, type TestListIndexedFacets } from '@/lib/tests/testUiMappers';
import {
  TestsFiltersBar,
  type TestsKindFilter,
} from '@/components/dashboard/tests/TestsFiltersBar';
import { buildTestListSelectedFacets, useTestListSubjectIndex } from '@/lib/subjectsByCourseIndex';
import { STUDENT_TEST_STATUS, TEACHER_TESTS_FILTER, TEACHER_TEST_PUBLISH_FILTER } from '@/lib/tests/testConstants';

export function StudentTestsListView({
  slug,
  practiceRows,
  examRows,
  batches,
  subjects,
  loading,
  error,
}: {
  slug: string;
  practiceRows: PracticeCatalogRow[];
  examRows: ExamCatalogRow[];
  batches: { id: number; displayName?: string; codeName?: string; courseId?: number }[];
  subjects: Subject[];
  loading: boolean;
  error: string | null;
}) {
  const router = useRouter();
  const { business, isAuthenticated, isInitialized } = useAuthStore();
  const businessId = business?.id;

  const [search, setSearch] = useState('');
  const [batchFilter, setBatchFilter] = useState<number | typeof TEACHER_TESTS_FILTER.ALL>(
    TEACHER_TESTS_FILTER.ALL,
  );
  const [subjectFilter, setSubjectFilter] = useState<number | typeof TEACHER_TESTS_FILTER.ALL>(
    TEACHER_TESTS_FILTER.ALL,
  );
  const [kindFilter, setKindFilter] = useState<TestsKindFilter>(TEACHER_TESTS_FILTER.ALL);
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>(TEACHER_TEST_PUBLISH_FILTER.ALL);

  const [startConfirmOpen, setStartConfirmOpen] = useState(false);
  const [startConfirmPayload, setStartConfirmPayload] = useState<StartAttemptTestInfo | null>(null);

  const merged: UnifiedStudentRow[] = useMemo(() => {
    const p = practiceRows.map((row) => ({ kind: 'practice' as const, row }));
    const e = examRows.map((row) => ({ kind: 'exam' as const, row }));
    return [...p, ...e].sort((a, b) => (a.row.name ?? '').localeCompare(b.row.name ?? ''));
  }, [practiceRows, examRows]);

  const subjectIndex = useTestListSubjectIndex(
    subjects,
    batches,
    batchFilter,
    subjectFilter,
    setSubjectFilter,
  );

  const indexedTestFilter = useMemo(() => {
    return createIndexedTextFilter<UnifiedStudentRow, string, TestListIndexedFacets>(merged, {
      getId: (item) => `${item.kind}-${item.row.id}`,
      getSearchText: (item) => {
        const r = item.row;
        const parts = [r.name, r.description, r.batchName, r.subjectName].filter(
          (x): x is string => typeof x === 'string' && x.length > 0,
        );
        return parts.join(' ');
      },
      getCreatedAt: (item) => {
        const r = item.row;
        if ('lastAttemptAt' in r && r.lastAttemptAt) return r.lastAttemptAt;
        return undefined;
      },
      getFacetValues: (item, id) => {
        const r = item.row;
        const batchId = Number(r.batchId);
        const status = typeof r.status === 'number' ? r.status : 0;
        const entries: Array<readonly [string, keyof TestListIndexedFacets, string | number]> = [
          [id, 'batchId', batchId],
          [id, 'status', status],
          [id, 'kind', item.kind],
        ];
        const sid = r.subjectId;
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

  const startPractice = async (testId: string): Promise<void> => {
    if (typeof businessId !== 'number') throw new Error('Not authorized');
    const res = await PracticeTestsService.postApiBusinessPracticeTestsAttempts(businessId, { practiceTestId: testId });
    const aid = res.data?.attemptId;
    if (!aid) throw new Error('Could not start attempt');
    router.push(studentPracticeAttemptPath(slug, aid));
  };

  const startExam = async (testId: string): Promise<void> => {
    if (typeof businessId !== 'number') throw new Error('Not authorized');
    const res = await ExamTestsService.postApiBusinessExamTestsAttempts(businessId, { examTestId: testId });
    const aid = res.data?.attemptId;
    if (!aid) throw new Error('Could not start attempt');
    router.push(studentExamAttemptPath(slug, aid));
  };

  const closeStartConfirm = () => {
    setStartConfirmOpen(false);
    setStartConfirmPayload(null);
  };

  const openStartConfirm = (item: UnifiedStudentRow) => {
    const { kind, row } = item;
    if (kind === 'practice') {
      const pr = row as PracticeCatalogRow;
      setStartConfirmPayload({
        kind,
        testId: pr.id,
        testName: pr.name,
        batchName: pr.batchName,
        rulesDescription: pr.description,
        questionCount: pr.totalQuestions ?? 0,
        marksPerQuestion: pr.defaultMarksPerQuestion,
      });
    } else {
      const er = row as ExamCatalogRow;
      setStartConfirmPayload({
        kind,
        testId: er.id,
        testName: er.name,
        batchName: er.batchName,
        rulesDescription: er.description,
        questionCount: er.totalQuestions ?? 0,
        marksPerQuestion: er.defaultMarksPerQuestion,
        negativeMarksPerQuestion: er.negativeMarksPerQuestion,
        timing: {
          startAtLabel: formatDateTime(er.startAt),
          deadlineAtLabel: formatDateTime(er.deadlineAt),
          durationLabel: formatDurationMinutes(er.durationMinutes),
        },
      });
    }
    setStartConfirmOpen(true);
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
        <div className="flex flex-col items-start justify-center gap-1">
          <div className="flex items-center bg-blue-50 rounded-2xl">
            <div className="h-4 w-4 text-blue-800 flex items-center justify-center">
              <FlaskConical className="h-4 w-4" />
            </div>
            <span className="inline-flex items-center text-blue-800 text-xs font-semibold px-0.5 py-0.5">
              Test Module
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Tests</h1>
            <p className="text-gray-600 mt-1">
              Practice and exam tests from your batches. Start a new attempt or resume where you left off.
            </p>
          </div>
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
        searchPlaceholder="Search by title, batch, description, or subject…"
      />

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}

      {filtered.length === 0 ? (
        <EmptyState
          title="No tests available"
          description="When your teachers publish tests for your batches, they will appear here."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((item) => {
            const vm = buildCardViewModel(item);
            const { row } = item;
            const er = item.kind === 'exam' ? (row as ExamCatalogRow) : null;

            const statusBadgeClass =
              vm.displayStatus === STUDENT_TEST_STATUS.LIVE
                ? 'bg-green-50 text-green-700'
                : vm.displayStatus === STUDENT_TEST_STATUS.IN_PROGRESS
                  ? 'bg-blue-50 text-blue-700'
                  : vm.displayStatus === STUDENT_TEST_STATUS.COMPLETED
                    ? 'bg-violet-50 text-violet-700'
                    : vm.displayStatus === STUDENT_TEST_STATUS.STARTS_SOON
                      ? 'bg-yellow-50 text-yellow-700'
                      : 'bg-gray-100 text-gray-600';

            const statusLabel =
              vm.displayStatus === STUDENT_TEST_STATUS.LIVE
                ? 'Live'
                : vm.displayStatus === STUDENT_TEST_STATUS.IN_PROGRESS
                  ? 'In progress'
                  : vm.displayStatus === STUDENT_TEST_STATUS.COMPLETED
                    ? 'Completed'
                    : vm.displayStatus === STUDENT_TEST_STATUS.STARTS_SOON
                      ? 'Starts soon'
                      : 'Expired';

            return (
              <div
                key={`${vm.kind}-${vm.id}`}
                className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-wrap justify-between gap-2"
              >
                <div className="flex flex-col gap-3 items-start">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 line-clamp-2">{vm.name}</h3>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {[vm.batchName || 'Batch', vm.subjectName].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <div className="flex items-end gap-1 shrink-0 justify-center">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${vm.badgeClass}`}>{vm.kindLabel}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusBadgeClass}`}>{statusLabel}</span>
                    </div>
                  </div>

                  {vm.description && <p className="text-sm text-gray-600 line-clamp-3">{vm.description}</p>}

                  <dl className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-sm">
                    <div className="flex gap-3">
                      <dt className="text-gray-400">Questions</dt>
                      <dd className="font-medium text-gray-900">{vm.totalQuestions ?? '—'}</dd>
                    </div>
                    <div className="flex gap-3">
                      <dt className="text-gray-400">Marks</dt>
                      <dd className="font-medium text-gray-900">{vm.totalMarks ?? '—'}</dd>
                    </div>
                    {vm.durationMinutes != null && (
                      <div className="col-span-2 flex gap-3">
                        <dt className="text-gray-400">Duration</dt>
                        <dd className="font-medium text-gray-900">{formatDurationMinutes(vm.durationMinutes)}</dd>
                      </div>
                    )}
                    {vm.deadlineAt && (
                      <div className="col-span-2 flex gap-3">
                        <dt className="text-gray-400">Deadline</dt>
                        <dd className="font-medium text-gray-900">{formatDateTime(vm.deadlineAt)}</dd>
                      </div>
                    )}
                    {vm.bestScore != null && (
                      <div className="col-span-2 flex gap-3">
                        <dt className="text-gray-400">Best score</dt>
                        <dd className="font-medium text-gray-900">{vm.bestScore}</dd>
                      </div>
                    )}
                  </dl>

                  {vm.actions.some((a) => a.type === TEST_CARD_ACTION.LOCKED) && er && (
                    <div className="rounded-md bg-gray-50 border border-gray-200 px-3 py-2 text-sm text-gray-700">
                      {lockedReasonLabel(vm.lockedReason ?? undefined)}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mt-auto pt-2">
                  {vm.actions.map((action, index) => {
                    if (action.type === TEST_CARD_ACTION.START) {
                      return (
                        <Button
                          key={index}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 w-fit cursor-pointer"
                          onClick={() => openStartConfirm(item)}
                        >
                          Start
                        </Button>
                      );
                    }
                    if (action.type === TEST_CARD_ACTION.RESUME) {
                      return (
                        <Button
                          key={index}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 w-fit cursor-pointer"
                          onClick={() => {
                            if (vm.kind === 'practice')
                              router.push(studentPracticeAttemptPath(slug, action.attemptId));
                            else router.push(studentExamAttemptPath(slug, action.attemptId));
                          }}
                        >
                          Resume
                        </Button>
                      );
                    }
                    if (action.type === TEST_CARD_ACTION.VIEW_RESULT) {
                      return (
                        <Button
                          key={index}
                          variant="outline"
                          className="flex-1 cursor-pointer"
                          onClick={() => {
                            const aid = action.attemptId;
                            if (vm.kind === 'practice')
                              router.push(studentPracticeResultPath(slug, vm.id, aid));
                            else router.push(studentExamResultPath(slug, vm.id, aid));
                          }}
                        >
                          View result
                        </Button>
                      );
                    }
                    if (action.type === TEST_CARD_ACTION.SOON) {
                      return (
                        <Button key={index} disabled className="flex-1 w-fit">
                          Starts soon
                        </Button>
                      );
                    }
                    if (action.type === TEST_CARD_ACTION.EXPIRED) {
                      return (
                        <Button key={index} disabled className="flex-1 w-fit">
                          Expired
                        </Button>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {startConfirmPayload && (
        <StartAttemptConfirmModal
          isOpen={startConfirmOpen}
          onClose={closeStartConfirm}
          onConfirm={async () => {
            if (!startConfirmPayload) return;
            if (startConfirmPayload.kind === 'practice') {
              await startPractice(startConfirmPayload.testId);
            } else {
              await startExam(startConfirmPayload.testId);
            }
          }}
          testInfo={startConfirmPayload}
        />
      )}
    </div>
  );
}
