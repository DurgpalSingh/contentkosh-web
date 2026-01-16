'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { AddCourseModal } from '@/components/modals/AddCourseModal';
import { EditCourseModal } from '@/components/modals/EditCourseModal';
import { DeleteConfirmModal } from '@/components/modals/DeleteConfirmModal';

import { ExamsService, CoursesService, Exam, Course, Subject } from '@/lib/api';
import { Plus, BookOpen, Search } from 'lucide-react';
import { CourseGridCard } from '@/components/dashboard/courses/CourseGridCard';
import { CourseFilter } from '@/components/dashboard/courses/CourseFilter';

interface ExtendedCourse extends Course {
  examName?: string;
  examId?: number;
  subjects?: Subject[];
}

export default function CoursesPage() {
  const { user, business, isAuthenticated, isLoading, isInitialized } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [exams, setExams] = useState<Exam[]>([]);
  const [courses, setCourses] = useState<ExtendedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExamId, setSelectedExamId] = useState<number | undefined>(undefined);

  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [selectedExamForAdd, setSelectedExamForAdd] = useState<number | null>(null);

  const [isEditCourseModalOpen, setIsEditCourseModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<ExtendedCourse | null>(null);

  const [isDeleteCourseModalOpen, setIsDeleteCourseModalOpen] = useState(false);

  // Fetch list of exams (once on mount)
  const fetchExams = useCallback(async () => {
    if (!business?.id) return;

    try {
      setLoading(true);
      setError(null);

      const examsResponse = await ExamsService.getApiBusinessExams({
        businessId: business.id,
      });

      const fetchedExams = examsResponse.data || [];
      setExams(fetchedExams);

      // Determine initial selected exam
      let initialExamId: number | undefined;

      const examIdParam = searchParams.get('examId');
      if (examIdParam) {
        const parsed = parseInt(examIdParam, 10);
        if (!isNaN(parsed) && fetchedExams.some((e) => e.id === parsed)) {
          initialExamId = parsed;
        }
      }

      // Default to first exam if no valid param
      if (initialExamId === undefined && fetchedExams.length > 0) {
        initialExamId = fetchedExams[0].id!;
      }

      setSelectedExamId(initialExamId);
    } catch (err: any) {
      console.error('Error fetching exams:', err);
      setError('Failed to load exams. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [business?.id, searchParams]);

  // Fetch courses for selected exam
  const fetchCourses = useCallback(async (examId: number) => {
    if (!examId) return;

    try {
      setLoading(true);
      setError(null);

      const coursesResponse = await CoursesService.getApiExamsCourses({
        examId,
        include: 'subjects', 
      });

      const fetchedCourses = (coursesResponse.data || []) as Course[];

      const extendedCourses: ExtendedCourse[] = fetchedCourses.map((course) => ({
        ...course,
        examId,
        examName: exams.find((e) => e.id === examId)?.name,
      }));

      // Sort newest first
      extendedCourses.sort(
        (a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
      );

      setCourses(extendedCourses);
    } catch (err: any) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [exams]);

  // Initial exams load
  useEffect(() => {
    if (isAuthenticated && business?.id) {
      fetchExams();
    }
  }, [isAuthenticated, business?.id, fetchExams]);

  // Load courses when selected exam changes
  useEffect(() => {
    if (selectedExamId !== undefined) {
      fetchCourses(selectedExamId);
      // Optional: Update URL to keep selected exam in query params
      // router.replace(`?examId=${selectedExamId}`, { scroll: false });
    }
  }, [selectedExamId, fetchCourses]);

  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) return courses;

    const lowerQuery = searchQuery.toLowerCase();
    return courses.filter(
      (course) =>
        course.name?.toLowerCase().includes(lowerQuery) ||
        course.description?.toLowerCase().includes(lowerQuery)
    );
  }, [courses, searchQuery]);

  const handleAddCourseClick = () => {
    if (exams.length === 0) {
      alert('Please create an exam first.');
      return;
    }
    setSelectedExamForAdd(selectedExamId ?? exams[0].id!);
    setIsAddCourseModalOpen(true);
  };

  const handleViewBatches = (course: Course) => {
    router.push(`/dashboard/batches?courseId=${course.id}`);
  };

  const handleViewSubjects = (course: ExtendedCourse) => {
    if (!course.examId) return;
    router.push(`/dashboard/courses/${course.id}/subjects?examId=${course.examId}`);
  };

  const handleEditCourse = (course: ExtendedCourse) => {
    setSelectedCourse(course);
    setIsEditCourseModalOpen(true);
  };

  const handleDeleteCourse = (course: ExtendedCourse) => {
    setSelectedCourse(course);
    setIsDeleteCourseModalOpen(true);
  };

  const confirmDeleteCourse = async () => {
    if (!selectedCourse?.id || !selectedCourse.examId) return;

    try {
      await CoursesService.deleteApiExamsCourses({
        examId: selectedCourse.examId,
        courseId: selectedCourse.id,
      });
      // Refresh current exam's courses
      if (selectedExamId) fetchCourses(selectedExamId);
    } catch (err) {
      console.error('Error deleting course:', err);
    } finally {
      setIsDeleteCourseModalOpen(false);
      setSelectedCourse(null);
    }
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
            <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
            <p className="text-gray-600 mt-1">
              Manage your courses, view subjects and batches
            </p>
          </div>
          <Button
            onClick={handleAddCourseClick}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Course
          </Button>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative flex-1 w-full sm:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-sm transition-colors"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <CourseFilter
            exams={exams}
            selectedExamId={selectedExamId}
            onSelectionChange={setSelectedExamId}
          />
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700 text-center">
            {error}
          </div>
        ) : exams.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-4">
              <BookOpen className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No exams found</h3>
            <p className="text-gray-500 mb-6">Create your first exam to start adding courses.</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-4">
              <BookOpen className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery
                ? 'No courses match your search query.'
                : 'This exam has no courses yet.'}
            </p>
            {!searchQuery && (
              <Button
                onClick={handleAddCourseClick}
                variant="outline"
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Course
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCourses.map((course) => (
              <CourseGridCard
                key={course.id}
                course={course}
                examName={course.examName}
                onViewBatches={handleViewBatches}
                onViewSubjects={handleViewSubjects}
                onEdit={handleEditCourse}
                onDelete={handleDeleteCourse}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {isAddCourseModalOpen && selectedExamForAdd && (
        <AddCourseModal
          isOpen={isAddCourseModalOpen}
          onClose={() => {
            setIsAddCourseModalOpen(false);
            setSelectedExamForAdd(null);
          }}
          examId={selectedExamForAdd}
          onCourseCreated={() => selectedExamId && fetchCourses(selectedExamId)}
        />
      )}

      {isEditCourseModalOpen && selectedCourse && selectedCourse.examId && (
        <EditCourseModal
          isOpen={isEditCourseModalOpen}
          onClose={() => {
            setIsEditCourseModalOpen(false);
            setSelectedCourse(null);
          }}
          course={selectedCourse}
          examId={selectedCourse.examId}
          onCourseUpdated={() => selectedExamId && fetchCourses(selectedExamId)}
        />
      )}

      {isDeleteCourseModalOpen && (
        <DeleteConfirmModal
          isOpen={isDeleteCourseModalOpen}
          onClose={() => {
            setIsDeleteCourseModalOpen(false);
            setSelectedCourse(null);
          }}
          onConfirm={confirmDeleteCourse}
          title="Delete Course"
          message="Are you sure you want to delete this course? This will also delete all subjects under it. This action cannot be undone."
          itemName={selectedCourse?.name ?? 'this course'}
        />
      )}
    </>
  );
}