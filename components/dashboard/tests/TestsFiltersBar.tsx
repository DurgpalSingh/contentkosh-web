'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState, type ComponentType, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
  BookMarked,
  CircleDot,
  Layers,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react';
import type { Subject } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { resolveSubjectsForBatchFilter, type SubjectsByCourseIndex } from '@/lib/subjectsByCourseIndex';
import { cn } from '@/lib/utils';
import { useAuthStore } from '../../../store/useAuthStore';
import { USER_ROLES } from '@/lib/constants';
import { TEST_KIND, TEST_KIND_LABEL } from '@/lib/tests/testConstants';
import {
  TEACHER_TESTS_FILTER,
  TEACHER_TEST_PUBLISH_FILTER,
  type TeacherTestsKindFacet,
  type TeacherTestsPublishFacet,
} from '@/lib/tests/testConstants';

export type TestsFiltersBatch = {
  id: number;
  displayName?: string;
  codeName?: string;
  courseId?: number;
};

export type TestsFiltersStatus = TeacherTestsPublishFacet;

export type TestsKindFilter = TeacherTestsKindFacet;

/** Facet filters (batch / subject / kind / status) — one object for the bar and parent list logic. */
export type TestsFiltersFacets = {
  batch: number | 'all';
  subject: number | 'all';
  kind: TestsKindFilter;
  status: TestsFiltersStatus;
};

const KIND_OPTIONS = [
  { value: TEACHER_TESTS_FILTER.ALL, label: 'All types' },
  { value: TEST_KIND.PRACTICE, label: TEST_KIND_LABEL[TEST_KIND.PRACTICE] },
  { value: TEST_KIND.EXAM, label: TEST_KIND_LABEL[TEST_KIND.EXAM] },
] as const;

const STATUS_OPTIONS = [
  { value: TEACHER_TEST_PUBLISH_FILTER.ALL, label: 'All statuses' },
  { value: TEACHER_TEST_PUBLISH_FILTER.DRAFT, label: 'Draft' },
  { value: TEACHER_TEST_PUBLISH_FILTER.PUBLISHED, label: 'Published' },
] as const;

const SELECT_TRIGGER =
  'h-10 w-full min-w-[10rem] max-w-full rounded-xl border border-slate-200/90 bg-white px-3.5 text-sm text-slate-800 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50/80 focus-visible:border-blue-400/80 focus-visible:ring-2 focus-visible:ring-blue-500/20';

export interface TestsFiltersBarProps {
  search: string;
  onSearchChange: (next: string) => void;

  batches: TestsFiltersBatch[];
  /** From `useTestListSubjectIndex` in `@/lib/subjectsByCourseIndex` — same maps as Contents page. */
  subjectIndex: SubjectsByCourseIndex;

  facets: TestsFiltersFacets;
  onFacetsChange: (next: TestsFiltersFacets) => void;

  searchPlaceholder?: string;
  /** When false, subject row is hidden (facets.subject should stay `'all'`). */
  showSubjectFilter?: boolean;
  showKindFilter?: boolean;
}

function FilterField({
  icon: Icon,
  label,
  htmlFor,
  children,
  className,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  htmlFor: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('min-w-0 space-y-2', className)}>
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden />
        <label htmlFor={htmlFor} className="cursor-default select-none">
          {label}
        </label>
      </div>
      {children}
    </div>
  );
}

export function TestsFiltersBar({
  search,
  onSearchChange,
  batches,
  subjectIndex,
  facets,
  onFacetsChange,
  searchPlaceholder = 'Search tests…',
  showSubjectFilter = true,
  showKindFilter = true,
}: TestsFiltersBarProps) {
  const baseId = useId();
  const filterPanelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const {  user, business } = useAuthStore();

  const searchId = `${baseId}-search`;
  const filtersTitleId = `${baseId}-filters-title`;
  const idBatch = `${baseId}-batch`;
  const idSubject = `${baseId}-subject`;
  const idKind = `${baseId}-kind`;
  const idStatus = `${baseId}-status`;

  const [filterOpen, setFilterOpen] = useState(false);
  const [draft, setDraft] = useState<TestsFiltersFacets>(facets);

  const syncDraftFromFacets = useCallback(() => {
    setDraft(facets);
  }, [facets]);

  useEffect(() => {
    if (!filterOpen) setDraft(facets);
  }, [facets, filterOpen]);

  const draftBatchSubjects = useMemo(
    () => resolveSubjectsForBatchFilter(draft.batch, batches, subjectIndex),
    [draft.batch, batches, subjectIndex],
  );

  const subjectOptions = useMemo(
    () => [
      { value: TEACHER_TESTS_FILTER.ALL, label: 'All subjects' },
      ...draftBatchSubjects.subjects
        .filter((s): s is Subject & { id: number } => typeof s.id === 'number')
        .map((s) => ({ value: s.id, label: s.name ?? `Subject ${s.id}` })),
    ],
    [draftBatchSubjects.subjects],
  );

  useEffect(() => {
    if (draft.subject === TEACHER_TESTS_FILTER.ALL) return;
    if (!draftBatchSubjects.subjectIds.has(draft.subject)) {
      setDraft((d) => ({ ...d, subject: TEACHER_TESTS_FILTER.ALL }));
    }
  }, [draft.batch, draft.subject, draftBatchSubjects.subjectIds]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!filterOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFilterOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [filterOpen]);

  useEffect(() => {
    if (!filterOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [filterOpen]);

  const batchOptions = useMemo(
    () => [
      { value: TEACHER_TESTS_FILTER.ALL, label: 'All batches' },
      ...batches.map((b) => ({
        value: b.id,
        label: b.displayName || b.codeName || `Batch ${b.id}`,
      })),
    ],
    [batches],
  );

  const hasFacetFiltersActive =
    facets.batch !== TEACHER_TESTS_FILTER.ALL ||
    facets.subject !== TEACHER_TESTS_FILTER.ALL ||
    facets.kind !== TEACHER_TESTS_FILTER.ALL ||
    facets.status !== TEACHER_TEST_PUBLISH_FILTER.ALL;

  const hasAnyActive = search.trim() !== '' || hasFacetFiltersActive;

  const clearAll = () => {
    setFilterOpen(false);
    onSearchChange('');
    onFacetsChange({
      batch: TEACHER_TESTS_FILTER.ALL,
      subject: TEACHER_TESTS_FILTER.ALL,
      kind: TEACHER_TESTS_FILTER.ALL,
      status: TEACHER_TEST_PUBLISH_FILTER.ALL,
    });
    setDraft({
      batch: TEACHER_TESTS_FILTER.ALL,
      subject: TEACHER_TESTS_FILTER.ALL,
      kind: TEACHER_TESTS_FILTER.ALL,
      status: TEACHER_TEST_PUBLISH_FILTER.ALL,
    });
  };

  const applyDraft = () => {
    onFacetsChange(draft);
    setFilterOpen(false);
  };

  const openFilters = (open: boolean) => {
    if (open) syncDraftFromFacets();
    setFilterOpen(open);
  };

  const batchVal = draft.batch === TEACHER_TESTS_FILTER.ALL ? TEACHER_TESTS_FILTER.ALL : draft.batch;
  const subjectVal =
    draft.subject === TEACHER_TESTS_FILTER.ALL ? TEACHER_TESTS_FILTER.ALL : draft.subject;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06),0_4px_16px_-4px_rgba(15,23,42,0.08)]">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200/80 to-transparent"
        aria-hidden
      />
      <div className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <Input
              id={searchId}
              className={cn(
                'h-11 rounded-xl border-slate-200/90 bg-slate-50/60 pl-10 pr-4 text-sm text-slate-900 shadow-inner shadow-slate-900/5',
                'placeholder:text-slate-400',
                'transition-all focus-visible:border-blue-400/70 focus-visible:bg-white focus-visible:shadow-md focus-visible:ring-2 focus-visible:ring-blue-500/15',
              )}
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              aria-label="Search tests"
            />
          </div>

          <div className="flex shrink-0 items-center justify-end gap-2 sm:justify-start">
            {hasAnyActive && (
              <button
                type="button"
                onClick={clearAll}
                className="hidden text-xs font-medium text-slate-500 underline-offset-2 hover:text-slate-800 hover:underline sm:inline"
              >
                Clear all
              </button>
            )}

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="relative h-11 w-11 shrink-0 rounded-xl border-slate-200 bg-white shadow-sm transition-colors hover:bg-slate-50"
              aria-label="Open filters"
              aria-haspopup="dialog"
              aria-expanded={filterOpen}
              onClick={() => openFilters(!filterOpen)}
            >
              <SlidersHorizontal className="h-4 w-4 text-slate-700" aria-hidden />
              {hasFacetFiltersActive && (
                <span
                  className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-white"
                  aria-hidden
                />
              )}
            </Button>

            {mounted &&
              filterOpen &&
              createPortal(
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
                  role="presentation"
                >
                  <div
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]"
                    aria-hidden
                    onClick={() => setFilterOpen(false)}
                  />
                  <div
                    ref={filterPanelRef}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={filtersTitleId}
                    className="relative z-10 flex max-h-[min(90dvh,36rem)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-900/15 outline-none"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="shrink-0 border-b border-slate-100 px-4 py-3">
                      <h3 id={filtersTitleId} className="text-sm font-semibold text-slate-900">
                        Filters
                      </h3>
                      <p className="text-xs text-slate-500">
                        Choose criteria, then apply to update the list.
                      </p>
                    </div>

                    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4">
                      <FilterField icon={Layers} label="Batch" htmlFor={idBatch}>
                        <Select
                          id={idBatch}
                          formRootRef={filterPanelRef}
                          value={batchVal}
                          onChange={(v) =>
                            setDraft((d) => ({
                              ...d,
                              batch: v === TEACHER_TESTS_FILTER.ALL ? TEACHER_TESTS_FILTER.ALL : Number(v),
                            }))
                          }
                          options={batchOptions}
                          placeholder="All batches"
                          triggerClassName={SELECT_TRIGGER}
                        />
                      </FilterField>

                      {showSubjectFilter && subjectOptions.length > 1 && (
                        <FilterField icon={BookMarked} label="Subject" htmlFor={idSubject}>
                          <Select
                            id={idSubject}
                            formRootRef={filterPanelRef}
                            value={subjectVal}
                            onChange={(v) =>
                              setDraft((d) => ({
                                ...d,
                                subject:
                                  v === TEACHER_TESTS_FILTER.ALL ? TEACHER_TESTS_FILTER.ALL : Number(v),
                              }))
                            }
                            options={subjectOptions}
                            placeholder="All subjects"
                            triggerClassName={SELECT_TRIGGER}
                          />
                        </FilterField>
                      )}

                      {showKindFilter && (
                        <FilterField icon={Sparkles} label="Type" htmlFor={idKind}>
                          <Select
                            id={idKind}
                            formRootRef={filterPanelRef}
                            value={draft.kind}
                            onChange={(v) =>
                              setDraft((d) => ({ ...d, kind: v as TestsKindFilter }))
                            }
                            options={[...KIND_OPTIONS]}
                            placeholder="All types"
                            triggerClassName={SELECT_TRIGGER}
                          />
                        </FilterField>
                      )}

                      {user?.role !== USER_ROLES.STUDENT && (
                        <FilterField icon={CircleDot} label="Status" htmlFor={idStatus}>
                          <Select
                            id={idStatus}
                            formRootRef={filterPanelRef}
                            value={draft.status}
                            onChange={(v) =>
                            setDraft((d) => ({ ...d, status: v as TestsFiltersStatus }))
                          }
                          options={[...STATUS_OPTIONS]}
                          placeholder="All statuses"
                          triggerClassName={SELECT_TRIGGER}
                        />
                      </FilterField>)}
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/90 px-4 py-3">
                      <button
                        type="button"
                        onClick={() =>
                          setDraft({
                            batch: TEACHER_TESTS_FILTER.ALL,
                            subject: TEACHER_TESTS_FILTER.ALL,
                            kind: TEACHER_TESTS_FILTER.ALL,
                            status: TEACHER_TEST_PUBLISH_FILTER.ALL,
                          })
                        }
                        className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
                      >
                        Reset
                      </button>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-lg"
                          onClick={() => setFilterOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          className="rounded-lg bg-blue-600 hover:bg-blue-700"
                          onClick={applyDraft}
                        >
                          Apply filters
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>,
                document.body,
              )}
          </div>
        </div>

        {hasAnyActive && (
          <button
            type="button"
            onClick={clearAll}
            className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 sm:hidden"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
            Clear search and filters
          </button>
        )}
      </div>
    </div>
  );
}
