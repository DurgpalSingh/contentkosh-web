'use client';

import { useEffect, useMemo } from 'react';
import type { Subject } from '@/lib/api';
import type { IndexedFilterParams } from '@/lib/indexedFiltering';
import type { TestListIndexedFacets } from '@/lib/tests/testUiMappers';
import {
  TEACHER_TESTS_FILTER,
  TEACHER_TEST_PUBLISH_FILTER,
  TEST_STATUS,
  type TeacherTestsKindFacet,
  type TeacherTestsPublishFacet,
} from '@/lib/tests/testConstants';

export type SubjectsByCourseIndex = {
  subjectsByCourseId: Map<number, Subject[]>;
  subjectIdsByCourseId: Map<number, Set<number>>;
};

/**
 * Single pass over `subjects` — same indexing as the Contents page
 * (`subjectsByCourseId` / `subjectIdsByCourseId` lookups).
 */
export function buildSubjectsByCourseIndex(subjects: Subject[]): SubjectsByCourseIndex {
  const subjectsByCourseId = new Map<number, Subject[]>();
  const subjectIdsByCourseId = new Map<number, Set<number>>();

  for (const subject of subjects) {
    const courseId = subject.courseId;
    if (typeof courseId !== 'number') continue;

    const subjectsForCourse = subjectsByCourseId.get(courseId) ?? [];
    subjectsForCourse.push(subject);
    subjectsByCourseId.set(courseId, subjectsForCourse);

    if (typeof subject.id !== 'number') continue;
    const subjectIdsForCourse = subjectIdsByCourseId.get(courseId) ?? new Set<number>();
    subjectIdsForCourse.add(subject.id);
    subjectIdsByCourseId.set(courseId, subjectIdsForCourse);
  }

  return { subjectsByCourseId, subjectIdsByCourseId };
}

export type BatchWithCourse = {
  id: number;
  courseId?: number;
};

function courseIdsFromBatches(batches: BatchWithCourse[]): Set<number> {
  const ids = new Set<number>();
  for (const b of batches) {
    if (typeof b.courseId === 'number') ids.add(b.courseId);
  }
  return ids;
}

export type BatchFilterSubjects = {
  subjectIds: Set<number>;
  subjects: Subject[];
};

/**
 * Valid subject ids + subject rows for the tests batch filter — mirrors Contents checks like
 * `subjectIdsByCourseId.get(selectedCourseId)?.has(selectedSubjectId)`; for "all batches",
 * merges per course that appears on a batch (deduped by subject id).
 */
export function resolveSubjectsForBatchFilter(
  batchFilter: number | 'all',
  batches: BatchWithCourse[],
  index: SubjectsByCourseIndex,
): BatchFilterSubjects {
  if (batchFilter !== 'all') {
    const batch = batches.find((b) => b.id === batchFilter);
    const courseId = batch?.courseId;
    if (typeof courseId !== 'number') {
      return { subjectIds: new Set(), subjects: [] };
    }
    return {
      subjectIds: new Set(index.subjectIdsByCourseId.get(courseId) ?? []),
      subjects: index.subjectsByCourseId.get(courseId) ?? [],
    };
  }

  const batchCourseIds = courseIdsFromBatches(batches);
  const subjectIds = new Set<number>();
  const seen = new Map<number, Subject>();
  for (const cid of batchCourseIds) {
    for (const s of index.subjectsByCourseId.get(cid) ?? []) {
      if (typeof s.id !== 'number') continue;
      subjectIds.add(s.id);
      if (!seen.has(s.id)) seen.set(s.id, s);
    }
  }
  return { subjectIds, subjects: Array.from(seen.values()) };
}

/**
 * One index for the list + `TestsFiltersBar`; keeps `subjectFilter` valid when `batchFilter` changes
 * (same idea as Contents subject validation against `subjectIdsForSelectedCourse`).
 */
export function useTestListSubjectIndex(
  subjects: Subject[],
  batches: BatchWithCourse[],
  batchFilter: number | 'all',
  subjectFilter: number | 'all',
  setSubjectFilter: (next: number | 'all') => void,
): SubjectsByCourseIndex {
  const index = useMemo(() => buildSubjectsByCourseIndex(subjects), [subjects]);

  const validSubjectIds = useMemo(
    () => resolveSubjectsForBatchFilter(batchFilter, batches, index).subjectIds,
    [batchFilter, batches, index],
  );

  useEffect(() => {
    if (subjectFilter === 'all') return;
    if (!validSubjectIds.has(subjectFilter)) setSubjectFilter('all');
  }, [batchFilter, subjectFilter, validSubjectIds, setSubjectFilter]);

  return index;
}

export type TestListFacetFilterState = {
  batchFilter: number | typeof TEACHER_TESTS_FILTER.ALL;
  subjectFilter: number | typeof TEACHER_TESTS_FILTER.ALL;
  statusFilter: TeacherTestsPublishFacet;
  kindFilter: TeacherTestsKindFacet;
};

/**
 * Builds `selectedFacets` for `createIndexedTextFilter` on teacher/student test lists.
 */
export function buildTestListSelectedFacets(
  state: TestListFacetFilterState,
): IndexedFilterParams<TestListIndexedFacets>['selectedFacets'] {
  const { batchFilter, subjectFilter, statusFilter, kindFilter } = state;
  const selectedFacets: IndexedFilterParams<TestListIndexedFacets>['selectedFacets'] = {};
  if (batchFilter !== TEACHER_TESTS_FILTER.ALL) selectedFacets.batchId = batchFilter;
  if (subjectFilter !== TEACHER_TESTS_FILTER.ALL) selectedFacets.subjectId = subjectFilter;
  if (statusFilter !== TEACHER_TEST_PUBLISH_FILTER.ALL) {
    selectedFacets.status =
      statusFilter === TEACHER_TEST_PUBLISH_FILTER.DRAFT
        ? TEST_STATUS.DRAFT
        : TEST_STATUS.PUBLISHED;
  }
  if (kindFilter !== TEACHER_TESTS_FILTER.ALL) selectedFacets.kind = kindFilter;
  return selectedFacets;
}
