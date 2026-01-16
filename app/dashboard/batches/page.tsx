'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { BatchesService, ExamsService, Batch, Course, Exam } from '@/lib/api';
import { Plus, Calendar, Search, Filter } from 'lucide-react';
import { BatchGridCard } from '@/components/dashboard/batches/BatchGridCard';
import { BatchesFilterModal } from '@/components/dashboard/batches/BatchesFilterModal';
import { AddBatchModal } from '@/components/modals/AddBatchModal';
import { EditBatchModal } from '@/components/modals/EditBatchModal';
import { DeleteConfirmModal } from '@/components/modals/DeleteConfirmModal';

/* ===================== TYPES ===================== */

interface ExtendedBatch extends Batch {
  courseId?: number;
  courseName?: string;
  examId?: number;
  memberCount?: number;
}

export default function BatchesPage() {
  const { business, isAuthenticated, isLoading, isInitialized } =
    useAuthStore();

  const router = useRouter();
  const searchParams = useSearchParams();

  /* ---------- STATE ---------- */

  const [exams, setExams] = useState<Exam[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [allBatches, setAllBatches] = useState<ExtendedBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExamIds, setSelectedExamIds] = useState<number[]>([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([]);

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isAddBatchModalOpen, setIsAddBatchModalOpen] = useState(false);
  const [isEditBatchModalOpen, setIsEditBatchModalOpen] = useState(false);
  const [isDeleteBatchModalOpen, setIsDeleteBatchModalOpen] = useState(false);

  const [selectedCourseForAdd, setSelectedCourseForAdd] = useState<number | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);

  /* ---------- INIT FROM URL ---------- */

  useEffect(() => {
    const courseIdParam = searchParams.get('courseId');
    if (courseIdParam) {
      const id = Number(courseIdParam);
      if (!isNaN(id)) setSelectedCourseIds([id]);
    }
  }, [searchParams]);

  /* ---------- FETCH DATA ---------- */

  const fetchExamsAndCourses = async (businessId: number) => {
    const response = await ExamsService.getApiBusinessExams({
      businessId,
      include: 'courses',
    });

    const exams: Exam[] = response.data ?? [];

    const courses: Course[] = exams.flatMap((exam) =>
      (exam.courses ?? []).map((course) => ({
        ...course,
        examId: exam.id,
        examName: exam.name,
      }))
    );

    courses.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });

    return { exams, courses };
  };

  const fetchBatchesForCourses = async (
    courses: Course[]
  ): Promise<ExtendedBatch[]> => {
    const requests = courses
      .filter((course) => course.id)
      .map((course) =>
        BatchesService.getApiBatchesCourse({ courseId: course.id! })
          .then((res) =>
            (res.data ?? []).map((batch) => ({
              ...batch,
              courseId: course.id,
              courseName: course.name,
              examId: course.examId,
            }))
          )
          .catch(() => [])
      );

    const results = await Promise.all(requests);
    return results.flat();
  };

  const enrichBatchesWithMemberCount = async (
    batches: ExtendedBatch[]
  ): Promise<ExtendedBatch[]> => {
    const requests = batches.map((batch) =>
      BatchesService.getApiBatchesWithUsers({ id: batch.id! })
        .then((res) => ({
          ...batch,
          memberCount: res.data?.length ?? 0,
        }))
        .catch(() => ({
          ...batch,
          memberCount: 0,
        }))
    );

    return Promise.all(requests);
  };

  const fetchData = useCallback(async () => {
    if (!business?.id) return;

    setLoading(true);
    setError(null);

    try {
      const { exams, courses } = await fetchExamsAndCourses(business.id);
      setExams(exams);
      setCourses(courses);

      const rawBatches = await fetchBatchesForCourses(courses);
      const enriched = await enrichBatchesWithMemberCount(rawBatches);

      enriched.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });

      setAllBatches(enriched);
    } catch (err) {
      console.error(err);
      setError('Failed to load batches. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [business?.id]);

  useEffect(() => {
    if (isAuthenticated && business?.id) {
      fetchData();
    }
  }, [isAuthenticated, business?.id, fetchData]);

  /* ---------- FILTERED DATA ---------- */

  const filteredBatches = useMemo(() => {
    return allBatches.filter((batch) => {
      const matchesSearch =
        batch.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        batch.codeName?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesExam =
        selectedExamIds.length === 0 ||
        (batch.examId && selectedExamIds.includes(batch.examId));

      const matchesCourse =
        selectedCourseIds.length === 0 ||
        (batch.courseId && selectedCourseIds.includes(batch.courseId));

      return matchesSearch && matchesExam && matchesCourse;
    });
  }, [allBatches, searchQuery, selectedExamIds, selectedCourseIds]);

  const activeFiltersCount =
    selectedExamIds.length + selectedCourseIds.length;

  /* ---------- HANDLERS ---------- */

  const handleAddBatchClick = () => {
    if (selectedCourseIds.length === 1) {
      setSelectedCourseForAdd(selectedCourseIds[0]);
    } else if (courses.length > 0) {
      setSelectedCourseForAdd(courses[0].id!);
    } else {
      alert('Please create a course first.');
      return;
    }
    setIsAddBatchModalOpen(true);
  };

  const handleViewStudents = (batch: Batch) => {
    router.push(`/dashboard/students?batchId=${batch.id}`);
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
    await BatchesService.deleteApiBatches({ id: selectedBatch.id });
    setIsDeleteBatchModalOpen(false);
    setSelectedBatch(null);
    fetchData();
  };

  /* ---------- LOADING ---------- */

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
            <p className="text-gray-600 mt-1">
              Manage student batches and enrollment
            </p>
          </div>
          <Button
            onClick={handleAddBatchClick}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Batch
          </Button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              className="w-full pl-10 pr-3 py-2 border rounded-lg"
              placeholder="Search batches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            onClick={() => setIsFilterModalOpen(true)}
            className="flex items-center px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 text-gray-700"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="ml-2 text-xs bg-blue-100 px-2 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSpinner size="lg" />
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : filteredBatches.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-10 w-10 text-gray-400" />
            <p className="mt-4 text-gray-500">No batches found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBatches.map((batch) => (
              <BatchGridCard
                key={batch.id}
                batch={batch}
                courseName={batch.courseName}
                memberCount={batch.memberCount}
                onViewStudents={handleViewStudents}
                onEdit={handleEditBatch}
                onDelete={handleDeleteBatch}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <BatchesFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        exams={exams}
        allCourses={courses}
        initialSelectedExamIds={selectedExamIds}
        initialSelectedCourseIds={selectedCourseIds}
        onApplyFilters={(e, c) => {
          setSelectedExamIds(e);
          setSelectedCourseIds(c);
        }}
      />

      {selectedCourseForAdd && isAddBatchModalOpen && (
        <AddBatchModal
          isOpen={isAddBatchModalOpen}
          courseId={selectedCourseForAdd}
          onClose={() => {
            setIsAddBatchModalOpen(false);
            setSelectedCourseForAdd(null);
          }}
          onBatchCreated={fetchData}
        />
      )}

      {selectedBatch && isEditBatchModalOpen && (
        <EditBatchModal
          isOpen={isEditBatchModalOpen}
          batch={selectedBatch}
          onClose={() => {
            setIsEditBatchModalOpen(false);
            setSelectedBatch(null);
          }}
          onBatchUpdated={fetchData}
        />
      )}

      {isDeleteBatchModalOpen && (
        <DeleteConfirmModal
          isOpen={isDeleteBatchModalOpen}
          onClose={() => setIsDeleteBatchModalOpen(false)}
          onConfirm={confirmDeleteBatch}
          title="Delete Batch"
          message="Are you sure you want to delete this batch?"
          itemName={selectedBatch?.codeName}
        />
      )}
    </>
  );
}