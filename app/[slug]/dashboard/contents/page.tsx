'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';

import { useAuthStore } from '@/store/useAuthStore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter, Layers3, FolderOpen } from 'lucide-react';
import { AddContentModal } from '@/components/modals/AddContentModal';
import { EditContentModal } from '@/components/modals/EditContentModal';
import { DeleteConfirmModal } from '@/components/modals/DeleteConfirmModal';
import { ContentsService, ExamsService, BatchesService, Content, Exam, Course, Batch } from '@/lib/api';
import { ContentGridCard } from '@/components/dashboard/contents/ContentGridCard';
import { ContentsFilterModal } from '@/components/dashboard/contents/ContentsFilterModal';

interface ExtendedBatch extends Batch {
  courseId?: number;
  courseName?: string;
  examId?: number;
}

export default function ContentsPage() {
  const { user, business, isAuthenticated, isLoading, isInitialized } = useAuthStore();

  const [exams, setExams] = useState<Exam[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [rawBatches, setRawBatches] = useState<Batch[]>([]);

  const [selectedExamIds, setSelectedExamIds] = useState<number[]>([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<number | undefined>(undefined);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const [contents, setContents] = useState<Content[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [contentsLoading, setContentsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const isStudent = user?.role === 'STUDENT';
  const isRestricted = user?.role === 'TEACHER' || user?.role === 'STUDENT';

  const courseById = useMemo(() => {
    return new Map(courses.filter(c => c.id).map(c => [c.id!, c]));
  }, [courses]);

  const allBatches = useMemo<ExtendedBatch[]>(() => {
    return rawBatches.map((b) => {
      const course = b.courseId ? courseById.get(b.courseId) : undefined;
      return {
        ...b,
        courseId: b.courseId,
        courseName: course?.name,
        examId: course?.examId,
      };
    });
  }, [rawBatches, courseById]);

  const filteredContents = useMemo(() => {
    if (!searchQuery.trim()) return contents;
    const q = searchQuery.toLowerCase();
    return contents.filter(c => c.title?.toLowerCase().includes(q));
  }, [contents, searchQuery]);

  const extractCoursesFromExams = useCallback((examList: Exam[]) => {
    return examList
      .flatMap((exam) => (exam.courses ?? []).map((course) => ({ ...course, examId: exam.id, examName: exam.name })))
      .sort((a, b) => (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0));
  }, []);

  const fetchContents = useCallback(async (batchId: number) => {
    setContentsLoading(true);
    setError(null);
    try {
      const res = await ContentsService.getApiBatchesContents({ batchId });
      const fetched = (res.data ?? []) as Content[];
      fetched.sort((a, b) =>
        (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0)
      );
      setContents(fetched);
    } catch (err) {
      console.error('Failed to load contents:', err);
      setError('Failed to load contents');
      setContents([]);
    } finally {
      setContentsLoading(false);
    }
  }, []);

  const loadPageData = useCallback(async () => {
    if (!business?.id) return;
    setPageLoading(true);
    setError(null);
    try {
      const [examsRes, batchesRes] = await Promise.all([
        ExamsService.getApiBusinessExams(business.id, 'courses'),
        BatchesService.getApiBatchesAll(),
      ]);

      const fetchedExams = (examsRes.data ?? []) as Exam[];
      const allCourses = extractCoursesFromExams(fetchedExams);
      const fetchedBatches = ((batchesRes.data ?? []) as Batch[]).sort((a, b) =>
        (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0)
      );

      if (isRestricted) {
        const courseIdSet = new Set<number>();
        fetchedBatches.forEach(b => {
          if (typeof b.courseId === 'number') courseIdSet.add(b.courseId);
        });

        const filteredCourses = allCourses.filter(c => c.id && courseIdSet.has(c.id));
        const examIdSet = new Set<number>();
        filteredCourses.forEach(c => {
          if (typeof c.examId === 'number') examIdSet.add(c.examId);
        });
        const filteredExams = fetchedExams.filter(e => e.id && examIdSet.has(e.id));

        setExams(filteredExams);
        setCourses(filteredCourses);
      } else {
        setExams(fetchedExams);
        setCourses(allCourses);
      }
      setRawBatches(fetchedBatches);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load contents data');
    } finally {
      setPageLoading(false);
    }
  }, [business?.id, extractCoursesFromExams, isRestricted]);

  useEffect(() => {
    if (!isAuthenticated || !business?.id) return;
    loadPageData();
  }, [isAuthenticated, business?.id, loadPageData]);

  useEffect(() => {
    if (!selectedBatchId && allBatches.length > 0) {
      const first = allBatches[0];
      setSelectedBatchId(first.id);
      return;
    }

    if (selectedBatchId) {
      fetchContents(selectedBatchId);
    } else {
      setContents([]);
    }
  }, [selectedBatchId, allBatches, fetchContents]);

  const handleAdd = useCallback(() => {
    setIsAddOpen(true);
  }, []);

  const handleView = useCallback(async (c: Content) => {
    try {
      const blob = await ContentsService.getApiContentsFile({ contentId: c.id! }).then(r => r as Blob);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
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
      if (selectedBatchId) await fetchContents(selectedBatchId);
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Delete failed');
    } finally {
      setIsDeleteOpen(false);
      setSelectedContent(null);
    }
  }, [selectedContent, selectedBatchId, fetchContents]);

  if (isLoading || !isInitialized || pageLoading) {
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
            <input
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Search contents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsFilterModalOpen(true)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-sm font-medium text-gray-700"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {(selectedExamIds.length > 0 || selectedCourseIds.length > 0 || selectedBatchId) && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 rounded-full">
                  {selectedExamIds.length + selectedCourseIds.length + (selectedBatchId ? 1 : 0)}
                </span>
              )}
            </button>
          </div>
        </div>

        {contentsLoading ? (
          <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700 text-center">{error}</div>
        ) : filteredContents.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">No contents found</h3>
            <p className="text-gray-600 mt-2">Add content to this batch to get started</p>
          </div>
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
          batches={allBatches}
          onCreated={() => selectedBatchId && fetchContents(selectedBatchId)}
        />
      )}

      {isFilterModalOpen && (
        <ContentsFilterModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          exams={exams}
          courses={courses}
          batches={allBatches}
          selectedExamIds={selectedExamIds}
          selectedCourseIds={selectedCourseIds}
          selectedBatchId={selectedBatchId}
          onApply={(examIds, courseIds, batchId) => {
            setSelectedExamIds(examIds);
            if (batchId) setSelectedBatchId(batchId);
            setSelectedCourseIds(courseIds);
          }}
        />
      )}
      {!isStudent && isEditOpen && selectedContent && (
        <EditContentModal
          isOpen={isEditOpen}
          onClose={() => { setIsEditOpen(false); setSelectedContent(null); }}
          content={selectedContent}
          batches={allBatches}
          onUpdated={() => selectedBatchId && fetchContents(selectedBatchId)}
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
