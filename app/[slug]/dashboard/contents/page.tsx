'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';

import { useAuthStore } from '@/store/useAuthStore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Plus, Search, Layers3 } from 'lucide-react';
import { AddContentModal } from '@/components/modals/AddContentModal';
import { EditContentModal } from '@/components/modals/EditContentModal';
import { DeleteConfirmModal } from '@/components/modals/DeleteConfirmModal';
import { ContentsService, BatchesService, SubjectsService, Content, Batch, Subject } from '@/lib/api';
import { ContentGridCard } from '@/components/dashboard/contents/ContentGridCard';
import { ContentsFilterModal } from '@/components/dashboard/contents/ContentsFilterModal';
import { USER_ROLES } from '@/lib/constants';
import { EmptyState } from '@/components/common/EmptyState';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { createIndexedTextFilter } from '@/lib/indexedFiltering';

export default function ContentsPage() {
  const { user, business, isAuthenticated, isLoading, isInitialized } = useAuthStore();

  const [batches, setBatches] = useState<Batch[]>([]);

  const [selectedBatchId, setSelectedBatchId] = useState<number | undefined>(undefined);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | undefined>(undefined);

  const [contents, setContents] = useState<Content[]>([]);
  const contentsByBatchIdRef = useRef<Map<number, Content[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const isAdmin = user?.role === USER_ROLES.ADMIN;
  const isStudent = user?.role === USER_ROLES.STUDENT;

  const getCreatedAtTime = useCallback((date?: string) => {
    return date ? new Date(date).getTime() : 0;
  }, []);

  const subjectsByCourseId = useMemo(() => {
    const subjectsByCourseIdMap = new Map<number, Subject[]>();
    for (const subject of subjects) {
      if (typeof subject.courseId === 'number') {
        const existing = subjectsByCourseIdMap.get(subject.courseId) ?? [];
        existing.push(subject);
        subjectsByCourseIdMap.set(subject.courseId, existing);
      }
    }
    return subjectsByCourseIdMap;
  }, [subjects]);

  const subjectIdsByCourseId = useMemo(() => {
    const subjectIdsByCourseIdMap = new Map<number, Set<number>>();
    for (const subject of subjects) {
      if (typeof subject.courseId !== 'number') continue;
      if (typeof subject.id !== 'number') continue;
      const existing = subjectIdsByCourseIdMap.get(subject.courseId) ?? new Set<number>();
      existing.add(subject.id);
      subjectIdsByCourseIdMap.set(subject.courseId, existing);
    }
    return subjectIdsByCourseIdMap;
  }, [subjects]);

  const indexedContentFilter = useMemo(() => {
    return createIndexedTextFilter(contents, {
      getId: (c) => (typeof c.id === 'number' ? c.id : null),
      getSearchText: (c) => c.title,
      getCreatedAt: (c) => c.createdAt,
      getFacetValues: (c, id) =>
        typeof c.subjectId === 'number' ? [[id, 'subjectId', c.subjectId]] : [],
      ngramLength: 3,
    });
  }, [contents]);

  const filteredContents = useMemo(() => {
    return indexedContentFilter.filter({
      query: searchQuery,
      selectedFacets: { subjectId: selectedSubjectId },
    });
  }, [indexedContentFilter, searchQuery, selectedSubjectId]);

  const sortByCreatedAtDesc = useCallback(<T extends { createdAt?: string }>(items: T[]) => {
    return [...items].sort((a, b) => getCreatedAtTime(b.createdAt) - getCreatedAtTime(a.createdAt));
  }, [getCreatedAtTime]);

  const fetchAndCacheContents = useCallback(async (batchId: number) => {
    setLoading(true);
    setError(null);
    try {
      const contentsResponse = await ContentsService.getApiBatchesContents({ batchId, status: Content.status.ACTIVE });
      const fetched = (contentsResponse.data ?? []) as Content[];
      fetched.sort((a, b) =>
        (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0)
      );
      setContents(fetched);
      contentsByBatchIdRef.current.set(batchId, fetched);
    } catch (err) {
      console.error('Failed to load contents:', err);
      setError('Failed to load contents');
      setContents([]);
      contentsByBatchIdRef.current.set(batchId, []);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadContentsForBatch = useCallback(
    async (batchId: number) => {
      const cached = contentsByBatchIdRef.current.get(batchId);
      if (cached) {
        setError(null);
        setContents(cached);
        return;
      }

      await fetchAndCacheContents(batchId);
    },
    [fetchAndCacheContents]
  );

  const fetchSubjects = useCallback(async () => {
    if (!user?.id) return;
    const subjects = await SubjectsService.getApiSubjectsUser();
    setSubjects((subjects.data ?? []) as Subject[]);
  }, [user?.id]);

  const loadPageData = useCallback(async () => {
    if (!business?.id) return;
    setLoading(true);
    setError(null);
    try {
      const batchesRes = await BatchesService.getApiBatchesAll();
      setBatches(sortByCreatedAtDesc((batchesRes.data ?? []) as Batch[]));

      await fetchSubjects();
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load contents data');
    } finally {
      setLoading(false);
    }
  }, [business?.id, sortByCreatedAtDesc, fetchSubjects]);

  useEffect(() => {
    if (!isAuthenticated || !business?.id) return;
    loadPageData();
  }, [isAuthenticated, business?.id, loadPageData]);

  // subjects are loaded as part of loadPageData()

  useEffect(() => {
    if (!selectedBatchId && batches.length > 0) {
      const defaultBatch = batches[0];
      setSelectedBatchId(defaultBatch.id);
      return;
    }

    if (selectedBatchId) {
      loadContentsForBatch(selectedBatchId);
    } else {
      setContents([]);
    }
  }, [selectedBatchId, batches, loadContentsForBatch]);

  useEffect(() => {
    const clearSelectedSubject = () => {
      if (selectedSubjectId !== undefined) setSelectedSubjectId(undefined);
    };

    if (!selectedBatchId) {
      clearSelectedSubject();
      return;
    }

    const selectedBatchCourseId = batches.find(b => b.id === selectedBatchId)?.courseId;
    if (typeof selectedBatchCourseId !== 'number' || selectedSubjectId === undefined) {
      clearSelectedSubject();
      return;
    }

    const subjectIdsForCourse = subjectIdsByCourseId.get(selectedBatchCourseId);
    const isSubjectInCourse = subjectIdsForCourse ? subjectIdsForCourse.has(selectedSubjectId) : false;
    if (!isSubjectInCourse) clearSelectedSubject();
  }, [selectedBatchId, batches, selectedSubjectId, subjectIdsByCourseId]);


  const selectedBatch = useMemo(
    () => batches.find((b) => b.id === selectedBatchId),
    [batches, selectedBatchId]
  );

  const subjectsForSelectedBatch = useMemo(() => {
    const courseId = selectedBatch?.courseId;
    if (typeof courseId !== 'number') return [];
    return subjectsByCourseId.get(courseId) ?? [];
  }, [selectedBatch?.courseId, subjectsByCourseId]);

  const initialSubjectIdForModals = useMemo(() => {
    if (
      selectedSubjectId !== undefined &&
      subjectsForSelectedBatch.some((s) => s.id === selectedSubjectId)
    ) {
      return selectedSubjectId;
    }
    return subjectsForSelectedBatch[0]?.id;
  }, [selectedSubjectId, subjectsForSelectedBatch]);

  const handleAdd = useCallback(() => {
    setIsAddOpen(true);
  }, []);

  const handleView = useCallback(async (c: Content) => {
    try {
      const blob = await ContentsService.getApiContentsFile({ contentId: c.id! }).then(r => r as Blob);
      const url = URL.createObjectURL(blob);
      const newTab = window.open(url, '_blank');
      // Revoke later so the new tab has time to load the blob URL.
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      if (!newTab) {
        // Optional fallback if popup blocked
        window.location.href = url;
      }
    } catch (err) {
      console.error('Failed to open file:', err);
    }
  }, []);

  const handleEdit = useCallback((c: Content) => {
    if (isStudent) return;
    setSelectedContent(c);
    setIsEditOpen(true);
  }, [isStudent]);

  const handleDelete = useCallback((c: Content) => {
    if (isStudent) return;
    setSelectedContent(c);
    setIsDeleteOpen(true);
  }, [isStudent]);

  const confirmDelete = useCallback(async () => {
    if (!selectedContent?.id) return;
    try {
      await ContentsService.deleteApiContents({ contentId: selectedContent.id });
      if (selectedBatchId) await fetchAndCacheContents(selectedBatchId);
      toast.success('Content deleted successfully');
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error('Failed to delete content. Please try again.');
    } finally {
      setIsDeleteOpen(false);
      setSelectedContent(null);
    }
  }, [selectedContent, selectedBatchId, fetchAndCacheContents]);

  if (isLoading || !isInitialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="rounded-2xl bg-gradient-to-br from-slate-50 via-white to-blue-50 border border-slate-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide text-blue-700 bg-blue-100/70 px-2 py-1 rounded-full">
                <Layers3 className="h-3.5 w-3.5" />
                Content Library
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mt-3">Contents</h1>
              <p className="text-slate-600 mt-1">Manage uploaded content for your batches</p>
            </div>
            {!isStudent && (
              <Button
                onClick={handleAdd}
                className={`bg-blue-600 hover:bg-blue-700 ${!selectedBatchId ? 'opacity-60 cursor-not-allowed' : ''}`}
                disabled={!selectedBatchId}
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Content
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative flex-1 w-full sm:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg"
              placeholder="Search by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <ContentsFilterModal
              batches={batches}
              selectedBatchId={selectedBatchId}
              onBatchChange={setSelectedBatchId}
              subjectsForCourse={subjectsForSelectedBatch}
              selectedSubjectId={selectedSubjectId}
              onSubjectChange={setSelectedSubjectId}
            />
          </div>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700 text-center">{error}</div>
        ) : filteredContents.length === 0 ? (
          searchQuery ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900">No contents found</h3>
              <p className="text-gray-600 mt-2">No contents match your search query.</p>
            </div>
          ) : (
            <EmptyState
              title={isAdmin ? 'No contents found' : 'No Content Assigned Yet.'}
              description={
                isAdmin
                  ? (selectedBatchId
                    ? 'Add content to this batch to get started.'
                    : 'Select a batch to view contents.')
                  : 'You are not assigned to any batch. Please contact the administrator.'
              }
              action={
                isAdmin ? (
                  <Button onClick={handleAdd} className='bg-blue-600 hover:bg-blue-500'>
                    <Plus className="h-4 w-4 mr-2" />
                    Create content
                  </Button>
                ) : undefined
              }
            />
          )
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContents.map(c => (
              <ContentGridCard
                key={c.id}
                content={c}
                onView={handleView}
                onEdit={!isStudent ? handleEdit : undefined}
                onDelete={!isStudent ? handleDelete : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {!isStudent && isAddOpen && (
        <AddContentModal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          selectedBatchId={selectedBatchId}
          onBatchChange={setSelectedBatchId}
          batches={batches}
          subjects={subjectsForSelectedBatch}
          initialSubjectId={initialSubjectIdForModals}
          onCreated={() => selectedBatchId && fetchAndCacheContents(selectedBatchId)}
        />
      )}

      {!isStudent && isEditOpen && selectedContent && (
        <EditContentModal
          isOpen={isEditOpen}
          onClose={() => { setIsEditOpen(false); setSelectedContent(null); }}
          content={selectedContent}
          subjects={subjectsForSelectedBatch}
          onUpdated={() => selectedBatchId && fetchAndCacheContents(selectedBatchId)}
        />
      )}

      {!isStudent && isDeleteOpen && (
        <DeleteConfirmModal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={confirmDelete}
          title="Delete Content"
          message="Are you sure you want to delete this content? This action cannot be undone."
          itemName={selectedContent?.title ?? 'this content'}
        />
      )}
    </>
  );
}
