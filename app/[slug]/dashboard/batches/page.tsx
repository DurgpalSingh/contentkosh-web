'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { BatchesService, ExamsService, Batch, BatchWithUsers, Course, Exam } from '@/lib/api';
import { Plus, Calendar, Search, Filter } from 'lucide-react';
import { BatchGridCard } from '@/components/dashboard/batches/BatchGridCard';
import { BatchesFilterModal } from '@/components/dashboard/batches/BatchesFilterModal';
import { AddBatchModal } from '@/components/modals/AddBatchModal';
import { EditBatchModal } from '@/components/modals/EditBatchModal';
import { DeleteConfirmModal } from '@/components/modals/DeleteConfirmModal';
import { USER_ROLES } from '@/lib/constants';

interface ExtendedBatch extends Batch {
  courseId?: number;
  courseName?: string;
  examId?: number;
  memberCount?: number;
}

export default function BatchesPage() {
  const { user, business, isAuthenticated, isLoading, isInitialized } = useAuthStore();
  const isAdmin = user?.role === USER_ROLES.ADMIN;
  const router = useRouter();
  const searchParams = useSearchParams();

  /* ---------- STATE ---------- */

  const [exams, setExams] = useState<Exam[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<ExtendedBatch[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExamIds, setSelectedExamIds] = useState<number[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | undefined>(undefined);

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isAddBatchModalOpen, setIsAddBatchModalOpen] = useState(false);
  const [selectedCourseForAdd, setSelectedCourseForAdd] = useState<number | null>(null);

  const [isEditBatchModalOpen, setIsEditBatchModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [isDeleteBatchModalOpen, setIsDeleteBatchModalOpen] = useState(false);




  // Load exams + all courses once
  const fetchExamsAndCourses = useCallback(async () => {
    if (!business?.id || typeof business.id !== 'number') {
      console.warn('Cannot fetch exams/courses: Invalid business ID');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Fetch Exams WITH courses included
      const res = await ExamsService.getApiBusinessExams(business.id, 'courses');
      const fetchedExams = res.data ?? [];
      setExams(fetchedExams);

      // 2. Create optimized lookup map for exams
      // const examMap = new Map(fetchedExams.map(e => [e.id, e])); // If needed for other lookups

      // 3. Flatten and standardize courses
      const allCourses: Course[] = fetchedExams.flatMap((exam) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const examCourses = ((exam as any).courses as Course[]) || [];
        return examCourses.map((course) => ({
          ...course,
          examId: exam.id,
          examName: exam.name,
        }));
      }).sort((a, b) => {
        const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tB - tA;
      });

      setCourses(allCourses);

      // Set initial selected course
      let initialCourseId: number | undefined;
      const courseIdParam = searchParams.get('courseId');
      if (courseIdParam) {
        const id = Number(courseIdParam);
        if (!isNaN(id) && allCourses.some((c) => c.id === id)) {
          initialCourseId = id;
        }
      }

      // Default to first course if no valid param
      if (initialCourseId === undefined && allCourses.length > 0) {
        initialCourseId = allCourses[0].id!;
      }

      setSelectedCourseId(initialCourseId);
    } catch (err) {
      console.error('Failed to load exams/courses:', err);
      setError('Failed to load courses and exams');
    } finally {
      setLoading(false);
    }
  }, [business?.id, searchParams]);

  // Load batches only for currently selected course
  const fetchBatches = useCallback(async (courseId: number) => {
    const selectedCourse = courses.find((c) => c.id === courseId);
    if (!selectedCourse) return;

    try {
      setLoading(true);
      setError(null);

      const res = await BatchesService.getApiBatchesCourse(courseId, undefined, 'batchUsers');

      // Optimize: Avoid find inside map if possible, but here we just use the known selectedCourse
      const extended: ExtendedBatch[] = (res.data ?? []).map((batch: BatchWithUsers) => ({
        ...batch,
        memberCount: batch?.batchUsers?.length ?? 0,
        courseId,
        courseName: selectedCourse.name,
        examId: selectedCourse.examId,
      }));

      extended.sort((a, b) => {
        const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tB - tA;
      });

      setBatches(extended);
    } catch (err) {
      console.error('Failed to load batches:', err);
      setError('Failed to load batches');
    } finally {
      setLoading(false);
    }
  }, [courses]);

  useEffect(() => {
    if (isAuthenticated && business?.id) {
      fetchExamsAndCourses();
    }
  }, [isAuthenticated, business?.id, fetchExamsAndCourses]);

  useEffect(() => {
    if (selectedCourseId !== undefined) {
      fetchBatches(selectedCourseId);
    }
  }, [selectedCourseId, fetchBatches]);

  /* ---------- FILTERED DATA ---------- */

  const filteredBatches = useMemo(() => {
    return batches.filter((batch) => {
      const matchesSearch =
        (batch.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          batch.codeName?.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesExam =
        selectedExamIds.length === 0 ||
        (batch.examId && selectedExamIds.includes(batch.examId));

      return matchesSearch && matchesExam;
    });
  }, [batches, searchQuery, selectedExamIds]);

  /* ---------- HANDLERS ---------- */

  const handleAddBatchClick = () => {
    setSelectedCourseForAdd(selectedCourseId ?? (courses.length > 0 ? courses[0].id! : null));
    setIsAddBatchModalOpen(true);
  };

  const handleViewDetails = (batch: Batch) => {
    if (!business?.slug) return;
    router.push(`/${business.slug}/dashboard/batches/details?id=${batch.id}`);
  };

  const handleEditBatch = (batch: Batch) => {
    setSelectedBatch(batch);
    setIsEditBatchModalOpen(true);
  };

  const handleDeleteBatch = (batch: Batch) => {
    setSelectedBatch(batch);
    setIsDeleteBatchModalOpen(true);
  };

  const confirmDeleteBatch = async () => {
    if (!selectedBatch?.id) return;
    try {
      await BatchesService.deleteApiBatches(selectedBatch.id);
      if (selectedCourseId) fetchBatches(selectedCourseId);
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setIsDeleteBatchModalOpen(false);
      setSelectedBatch(null);
    }
  };

  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  /* ---------- UI ---------- */

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Batches</h1>
            <p className="text-gray-600 mt-1">Manage student batches and enrollment</p>
          </div>
          {isAdmin && (
            <Button onClick={handleAddBatchClick} className='bg-blue-600 hover:bg-blue-500'>
              <Plus className="h-5 w-5 mr-2" />
              Add Batch
            </Button>
          )}
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search batches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            onClick={() => setIsFilterModalOpen(true)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-gray-700"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {selectedCourseId && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 rounded-full">
                {selectedExamIds.length + (selectedCourseId !== undefined ? 1 : 0)}
              </span>
            )}
          </Button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700 text-center">
            {error}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No courses found</h3>
            <p className="text-gray-600 mt-2">Create a course first to manage batches</p>
          </div>
        ) : filteredBatches.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No batches found</h3>
            <p className="text-gray-600 mt-2">
              {searchQuery
                ? 'Try adjusting your search'
                : 'This course has no batches yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBatches.map((batch) => (
              <BatchGridCard
                key={batch.id}
                batch={batch}
                courseName={batch.courseName}
                memberCount={batch.memberCount}
                onViewDetails={handleViewDetails}
                onEdit={handleEditBatch}
                onDelete={handleDeleteBatch}
              />
            ))}
          </div>
        )}
      </div>

      {/* Filter Modal */}
      <BatchesFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        exams={exams}
        courses={courses}
        selectedExamIds={selectedExamIds}
        selectedCourseId={selectedCourseId}
        onApply={(examIds, courseId) => {
          setSelectedExamIds(examIds);
          if (courseId !== undefined) {
            setSelectedCourseId(courseId);
          }
        }}
      />

      {/* Add Batch Modal */}
      {selectedCourseForAdd && isAddBatchModalOpen && (
        <AddBatchModal
          isOpen={isAddBatchModalOpen}
          courses={courses}
          initialCourseId={selectedCourseForAdd ?? undefined}
          onClose={() => {
            setIsAddBatchModalOpen(false);
            setSelectedCourseForAdd(null);
          }}
          onBatchCreated={() => selectedCourseId && fetchBatches(selectedCourseId)}
        />
      )}

      {/* Edit Batch Modal */}
      {selectedBatch && isEditBatchModalOpen && (
        <EditBatchModal
          isOpen={isEditBatchModalOpen}
          batch={selectedBatch}
          onClose={() => {
            setIsEditBatchModalOpen(false);
            setSelectedBatch(null);
          }}
          onBatchUpdated={() => selectedCourseId && fetchBatches(selectedCourseId)}
        />
      )}

      {/* Delete Confirmation */}
      {isDeleteBatchModalOpen && (
        <DeleteConfirmModal
          isOpen={isDeleteBatchModalOpen}
          onClose={() => {
            setIsDeleteBatchModalOpen(false);
            setSelectedBatch(null);
          }}
          onConfirm={confirmDeleteBatch}
          title="Delete Batch"
          message="Are you sure you want to delete this batch?"
          itemName={selectedBatch?.codeName ?? 'this batch'}
        />
      )}
    </>
  );
}