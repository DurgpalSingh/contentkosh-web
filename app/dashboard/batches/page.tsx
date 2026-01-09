'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { BatchesService, ExamsService, Batch, Course, Exam } from '@/lib/api';
import { Plus, Calendar, Search, Filter } from 'lucide-react';
import { BatchGridCard } from '@/components/dashboard/batches/BatchGridCard';
import { BatchesFilterModal } from '@/components/dashboard/batches/BatchesFilterModal';
import { AddBatchModal } from '@/components/modals/AddBatchModal';

// Extended batch type
interface ExtendedBatch extends Batch {
  courseId?: number;
  courseName?: string;
  examId?: number; // Add examId for filtering
  memberCount?: number;
}

export default function BatchesPage() {
  const { user, business, isAuthenticated, isLoading, isInitialized } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Data state
  const [exams, setExams] = useState<Exam[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [allBatches, setAllBatches] = useState<ExtendedBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExamIds, setSelectedExamIds] = useState<number[]>([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([]);

  // Modal states
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isAddBatchModalOpen, setIsAddBatchModalOpen] = useState(false);
  const [selectedCourseForAdd, setSelectedCourseForAdd] = useState<number | null>(null);

  // Initialize filters from URL if present
  useEffect(() => {
    const courseIdParam = searchParams.get('courseId');
    if (courseIdParam) {
      const courseId = parseInt(courseIdParam);
      if (!isNaN(courseId)) {
        setSelectedCourseIds([courseId]);
      }
    }
  }, [searchParams]);

  const fetchData = useCallback(async () => {
    if (!business?.id) return;

    try {
      setLoading(true);
      // 1. Fetch exams
      const examsResponse = await ExamsService.getExams(business.id);
      const fetchedExams = examsResponse.data || [];
      setExams(fetchedExams);

      // 2. Fetch courses from all exams and flatten
      const coursesPromises = fetchedExams
        .filter(exam => exam.id)
        .map(async exam => {
          try {
            const res = await ExamsService.getApiExamsWithCourses(exam.id!);
            return (res.data?.courses || []).map(c => ({ ...c, examId: exam.id })); // Inject examId
          } catch {
            return [];
          }
        });

      const coursesResults = await Promise.all(coursesPromises);
      const allCourses = coursesResults.flat();
      setCourses(allCourses);

      // 3. Fetch batches for all courses
      const batchesPromises = allCourses
        .filter(course => course.id)
        .map(async (course) => {
          try {
            const response = await BatchesService.getApiBatchesCourse(course.id!);
            const batches = response.data || [];

            // Enhance batches with course and exam context
            const richBatchesPromises = batches.map(async (batch) => {
              try {
                const usersResponse = await BatchesService.getApiBatchesWithUsers(batch.id!);
                const count = usersResponse.data?.batchUsers?.length || 0;
                return {
                  ...batch,
                  courseId: course.id,
                  courseName: course.name,
                  examId: course.examId, // Pass through examId
                  memberCount: count
                };
              } catch {
                return {
                  ...batch,
                  courseId: course.id,
                  courseName: course.name,
                  examId: course.examId,
                  memberCount: 0
                };
              }
            });

            return await Promise.all(richBatchesPromises);

          } catch (err) {
            console.warn(`Failed to fetch batches for course ${course.id}`, err);
            return [];
          }
        });

      const batchesArrays = await Promise.all(batchesPromises);
      const flatBatches = batchesArrays.flat();

      // Sort by creation date (newest first)
      flatBatches.sort((a, b) => {
        return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
      });

      setAllBatches(flatBatches);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching data:', err);
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

  // Derived state: Filtered batches
  const filteredBatches = useMemo(() => {
    return allBatches.filter(batch => {
      // Search filter
      const matchesSearch = batch.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        batch.codeName?.toLowerCase().includes(searchQuery.toLowerCase());

      // Exam filter
      // If exams selected, batch must belong to one of them
      const matchesExam = selectedExamIds.length === 0 ||
        (batch.examId && selectedExamIds.includes(batch.examId));

      // Course filter
      const matchesCourse = selectedCourseIds.length === 0 ||
        (batch.courseId && selectedCourseIds.includes(batch.courseId));

      return matchesSearch && matchesExam && matchesCourse;
    });
  }, [allBatches, searchQuery, selectedExamIds, selectedCourseIds]);

  // Filter Logic:
  // If user filters by Exam, we technically don't *need* to filter by Course if they haven't selected any courses.
  // But if they selected Exam A, and we show batches from Exam A.
  // If they ALSO selected Course B (which is under Exam B), then the interaction of ANDing them returns empty.
  // The Modal ensures that if you select Exam A, you ideally only see Courses from A to pick.
  // But if a user previously picked Course B, then switched to Exam A, we might have a conflict or just 0 results.
  // The Modal handles the selection UI. The Page handles the AND logic. This is fine.

  // Handlers
  const handleApplyFilters = (newExamIds: number[], newCourseIds: number[]) => {
    setSelectedExamIds(newExamIds);
    setSelectedCourseIds(newCourseIds);
  };

  const activeFiltersCount = selectedExamIds.length + selectedCourseIds.length;

  const handleAddBatchClick = () => {
    if (selectedCourseIds.length === 1) {
      setSelectedCourseForAdd(selectedCourseIds[0]);
      setIsAddBatchModalOpen(true);
    } else if (courses.length > 0) {
      setSelectedCourseForAdd(courses[0].id!);
      setIsAddBatchModalOpen(true);
    } else {
      alert("Please create a course first.");
    }
  };

  const handleViewStudents = (batch: Batch) => {
    router.push(`/dashboard/students?batchId=${batch.id}`);
  };

  const handleEditBatch = (batch: Batch) => {
    console.log("Edit batch", batch.id);
  };

  const handleDeleteBatch = (batch: Batch) => {
    console.log("Delete batch", batch.id);
  };

  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
      <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Batches</h1>
            <p className="text-gray-600 mt-1">Manage student batches and enrollment</p>
          </div>
          <button
            onClick={handleAddBatchClick}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Batch
          </button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm transition-colors"
              placeholder="Search batches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className={`flex items-center px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${activeFiltersCount > 0
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="ml-2 bg-blue-100 text-blue-800 py-0.5 px-2 rounded-full text-xs">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
            {error}
          </div>
        ) : filteredBatches.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-4">
              <Calendar className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No batches found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || activeFiltersCount > 0
                ? "Try adjusting your filters or search query."
                : "Get started by adding a new batch."}
            </p>
            {!searchQuery && activeFiltersCount === 0 && (
              <button
                onClick={handleAddBatchClick}
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Batch
              </button>
            )}
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

      {/* Filter Modal */}
      <BatchesFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        exams={exams}
        allCourses={courses}
        initialSelectedExamIds={selectedExamIds}
        initialSelectedCourseIds={selectedCourseIds}
        onApplyFilters={handleApplyFilters}
      />

      {/* Add Batch Modal */}
      {selectedCourseForAdd && isAddBatchModalOpen && (
        <AddBatchModal
          isOpen={isAddBatchModalOpen}
          onClose={() => {
            setIsAddBatchModalOpen(false);
            setSelectedCourseForAdd(null);
          }}
          courseId={selectedCourseForAdd}
          onBatchCreated={fetchData}
        />
      )}
    </>
  );
}
