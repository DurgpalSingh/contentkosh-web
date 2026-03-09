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
import { USER_ROLES } from '@/lib/constants';
import { EmptyState } from '@/components/common/EmptyState';
import { toast } from 'sonner';

interface ExtendedCourse extends Course {
  examName?: string;
  examId?: number;
  subjects?: Subject[];
}

const calculateCourseStatus = (startDate: string | undefined, endDate: string | undefined): Course.status => {
  if (!startDate || !endDate) {
    return Course.status.ACTIVE; 
  }

  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now > end || now < start) {
    return Course.status.INACTIVE;
  } else {
    return Course.status.ACTIVE;
  }
};

export default function CoursesPage() {
  const { user, business, isAuthenticated, isLoading, isInitialized } = useAuthStore();
  const router = useRouter();
  const isAdmin = user?.role === USER_ROLES.ADMIN;
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
    if (!business?.id || typeof business.id !== 'number') {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const examsResponse = await ExamsService.getApiBusinessExams(business.id);

      const fetchedExams = examsResponse.data || [];
      setExams(fetchedExams);
    } catch (err) {
      console.error('Error fetching exams:', err);
      setError('Failed to load exams. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [business?.id]);

  // Fetch courses for selected exam
  const fetchCourses = useCallback(async (examId: number) => {
    if (!examId) return;

    try {
      if (typeof examId !== 'number') {
        console.warn('Invalid examId passed to fetchCourses:', examId);
        return;
      }

      setLoading(true);
      setError(null);

      const coursesResponse = await CoursesService.getApiExamsCourses(
        examId,
        { include: 'subjects' }
      );

      const fetchedCourses = (coursesResponse.data || []) as Course[];

      // Create a map for faster lookup: ID -> Name
      const examMap = new Map(exams.map(e => [e.id!, e.name!]));

      const extendedCourses: ExtendedCourse[] = fetchedCourses.map((course) => ({
        ...course,
        examId,
        examName: examMap.get(examId),
        status: course.status === Course.status.INACTIVE? course.status: calculateCourseStatus(course.startDate, course.endDate),
      }));

      // Sort newest first
      extendedCourses.sort((a, b) => {
        const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tB - tA;
      });

      setCourses(extendedCourses);
    } catch (err) {
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

  // Initial selection from URL or default
  useEffect(() => {
    if (exams.length > 0 && selectedExamId === undefined) {
      let initialExamId: number | undefined;
      const examIdParam = searchParams.get('examId');

      if (examIdParam) {
        const parsed = parseInt(examIdParam, 10);
        if (!isNaN(parsed) && exams.some((e) => e.id === parsed)) {
          initialExamId = parsed;
        }
      }

      // Default to first exam if no valid param
      if (initialExamId === undefined) {
        initialExamId = exams[0].id as number;
      }

      setSelectedExamId(initialExamId);
    }
  }, [exams, searchParams, selectedExamId]);

  // Load courses when selected exam changes and update URL
  useEffect(() => {
    if (selectedExamId !== undefined) {
      fetchCourses(selectedExamId);

      // Update URL to keep selected exam in query params
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      const value = selectedExamId.toString();

      if (current.get('examId') !== value) {
        current.set('examId', value);
        const search = current.toString();
        const query = search ? `?${search}` : '';
        router.push(`${window.location.pathname}${query}`);
      }
    }
  }, [selectedExamId, fetchCourses, router, searchParams]);

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
    // We allow opening even with 0 exams so the modal can show the "No exams" message
    setSelectedExamForAdd(selectedExamId ?? (exams.length > 0 ? exams[0].id! : null));
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
      await CoursesService.deleteApiExamsCourses(
        selectedCourse.examId,
        selectedCourse.id,
      );
      // Refresh current exam's courses
      if (selectedExamId) fetchCourses(selectedExamId);
      toast.success('Course deleted successfully');
    } catch (err) {
      console.error('Error deleting course:', err);
      toast.error('Failed to delete course. Please try again.');
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
          {isAdmin && (
            <Button
              onClick={handleAddCourseClick}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Course
            </Button>
          )}
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
          <EmptyState
            title='No exams found'
            description={
              isAdmin
                ? 'Create your first exam to start adding courses.'
                : 'You are not assigned to any batch. Please contact the administrator.'
            }
            action={
              isAdmin ? (
                <Button
                  onClick={handleAddCourseClick}
                  variant="outline"
                  className="mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Course
                </Button>
              ) : undefined
            }
          />
        ) : filteredCourses.length === 0 ? (
          searchQuery ? (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-4">
                <BookOpen className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-500 mb-6">No courses match your search query.</p>
            </div>
          ) : (
            <EmptyState
              title='No courses found'
              description={
                isAdmin
                  ? 'This exam has no courses yet.'
                  : 'You are not assigned to any batch. Please contact the administrator.'
              }
              action={
                isAdmin ? (
                  <Button
                    onClick={handleAddCourseClick}
                    variant="outline"
                    className="mt-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Course
                  </Button>
                ) : undefined
              }
            />
          )
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
      {isAddCourseModalOpen && (
        <AddCourseModal
          isOpen={isAddCourseModalOpen}
          onClose={() => {
            setIsAddCourseModalOpen(false);
            setSelectedExamForAdd(null);
          }}
          exams={exams}
          defaultExamId={selectedExamForAdd ?? undefined}
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
