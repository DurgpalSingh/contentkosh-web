'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { AddCourseModal } from '@/components/modals/AddCourseModal';
import { EditCourseModal } from '@/components/modals/EditCourseModal';
import { DeleteConfirmModal } from '@/components/modals/DeleteConfirmModal';
import { AddSubjectModal } from '@/components/modals/AddSubjectModal';
import { EditSubjectModal } from '@/components/modals/EditSubjectModal';
import { SubjectsListModal } from '@/components/modals/SubjectsListModal';
import { ExamsService, CoursesService, SubjectsService, Exam, Course, Subject } from '@/lib/api';
import { Plus, BookOpen, Search } from 'lucide-react';
import { CourseGridCard } from '@/components/dashboard/courses/CourseGridCard';
import { CourseFilter } from '@/components/dashboard/courses/CourseFilter';

// Extended course type to include exam name for display
interface ExtendedCourse extends Course {
  examName?: string;
  subjects?: Subject[]; // Ensure subjects is strongly typed
}

// Helpers
const enrichCourseWithSubjects = async (course: Course, examId: number): Promise<Course> => {
  try {
    const response = await CoursesService.getApiExamsCoursesWithSubjects(examId, course.id!);
    return { ...course, subjects: response.data?.subjects || [] };
  } catch (err) {
    console.warn(`Failed to fetch subjects for course ${course.id}`, err);
    return course;
  }
};

export default function CoursesPage() {
  const { user, business, isAuthenticated, isLoading, isInitialized } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Data state
  const [exams, setExams] = useState<Exam[]>([]);
  const [allCourses, setAllCourses] = useState<ExtendedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExamIds, setSelectedExamIds] = useState<number[]>([]);

  // Modal states
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [selectedExamForAdd, setSelectedExamForAdd] = useState<number | null>(null);

  const [isEditCourseModalOpen, setIsEditCourseModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<ExtendedCourse | null>(null);

  const [isDeleteCourseModalOpen, setIsDeleteCourseModalOpen] = useState(false);

  // Subject Modal states
  const [isSubjectsListModalOpen, setIsSubjectsListModalOpen] = useState(false);
  const [selectedCourseForSubjects, setSelectedCourseForSubjects] = useState<ExtendedCourse | null>(null);

  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false);
  const [isEditSubjectModalOpen, setIsEditSubjectModalOpen] = useState(false);
  const [isDeleteSubjectModalOpen, setIsDeleteSubjectModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  // Initialize filters from URL if present
  useEffect(() => {
    const examIdParam = searchParams.get('examId');
    if (examIdParam) {
      const examId = parseInt(examIdParam);
      if (!isNaN(examId)) {
        setSelectedExamIds([examId]);
      }
    }
  }, [searchParams]);

  const fetchData = useCallback(async () => {
    if (!business?.id) return;

    try {
      setLoading(true);
      // Fetch all exams first
      const examsResponse = await ExamsService.getExams(business.id);
      const fetchedExams = examsResponse.data || [];
      setExams(fetchedExams);

      // Fetch courses for all exams (flattening the list)
      const coursesPromises = fetchedExams.map(async (exam) => {
        if (!exam.id) return [];
        try {
          const response = await ExamsService.getApiExamsWithCourses(exam.id);
          const rawCourses = response.data?.courses || [];

          // Enrich courses with subjects
          // We do this in parallel for all courses of this exam
          const enrichedCourses = await Promise.all(
            rawCourses.map(course => enrichCourseWithSubjects(course, exam.id!))
          );

          // Inject examId and examName into each course
          return enrichedCourses.map(course => ({
            ...course,
            examId: exam.id,
            examName: exam.name
          })) as ExtendedCourse[];
        } catch (err) {
          console.warn(`Failed to fetch courses for exam ${exam.id}`, err);
          return [];
        }
      });

      const coursesArrays = await Promise.all(coursesPromises);
      const flatCourses = coursesArrays.flat();

      // Sort by creation date (newest first)
      flatCourses.sort((a, b) => {
        return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
      });

      setAllCourses(flatCourses);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError('Failed to load courses. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [business?.id]);

  useEffect(() => {
    if (isAuthenticated && business?.id) {
      fetchData();
    }
  }, [isAuthenticated, business?.id, fetchData]);

  // Derived state: Filtered courses
  const filteredCourses = useMemo(() => {
    return allCourses.filter(course => {
      // Search filter
      const matchesSearch = course.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchQuery.toLowerCase());

      // Exam filter
      const matchesExam = selectedExamIds.length === 0 ||
        (course.examId && selectedExamIds.includes(course.examId));

      return matchesSearch && matchesExam;
    });
  }, [allCourses, searchQuery, selectedExamIds]);

  // Handlers
  const handleAddCourseClick = () => {
    if (selectedExamIds.length === 1) {
      setSelectedExamForAdd(selectedExamIds[0]);
      setIsAddCourseModalOpen(true);
    } else if (exams.length > 0) {
      setSelectedExamForAdd(exams[0].id!);
      setIsAddCourseModalOpen(true);
    } else {
      alert("Please create an exam first.");
    }
  };

  const handleViewBatches = (course: Course) => {
    router.push(`/dashboard/batches?courseId=${course.id}`);
  };

  const handleViewSubjects = (course: ExtendedCourse) => {
    setSelectedCourseForSubjects(course);
    setIsSubjectsListModalOpen(true);
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
      await CoursesService.deleteApiExamsCourses(selectedCourse.examId, selectedCourse.id);
      await fetchData();
      setIsDeleteCourseModalOpen(false);
      setSelectedCourse(null);
    } catch (err) {
      console.error('Error deleting course:', err);
    }
  };

  // Subject Handlers
  const handleAddSubject = () => {
    // Add subject logic (open add subject modal)
    // Note: We need Course ID and Exam ID.
    // selectedCourseForSubjects should be set when list modal is open.
    setIsAddSubjectModalOpen(true);
  };

  const handleEditSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsEditSubjectModalOpen(true);
  };

  const handleDeleteSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsDeleteSubjectModalOpen(true);
  };

  const confirmDeleteSubject = async () => {
    if (!selectedSubject?.id || !selectedCourseForSubjects?.id || !selectedCourseForSubjects.examId) return;
    try {
      await SubjectsService.deleteApiExamsCoursesSubjects(
        selectedCourseForSubjects.examId,
        selectedCourseForSubjects.id!,
        selectedSubject.id
      );
      await fetchData(); // Refresh data to update counts
      // Also need to update the local 'selectedCourseForSubjects' to refract changes in the modal immediately?
      // Actually fetchData updates 'allCourses'. We need to update 'selectedCourseForSubjects' 
      // or close/reopen modal, or better: rely on fetchData and useEffect to sync?
      // Simplest: just close modal for now or refetch and manually update local state.
      // Let's refetch and find the updated course object to update modal if open.

      setIsDeleteSubjectModalOpen(false);
      setSelectedSubject(null);

      // Hacky re-sync: find the course in new data or just rely on next render if we structured it well.
      // But 'selectedCourseForSubjects' is a snapshot.
      // Better approach: Close list modal or implement finer grained updates.
      // For now, let's close the list modal to force refresh when reopened? Or try to update it.
      // Let's restart fetch and hopefully update current view.

    } catch (err) {
      console.error('Error deleting subject:', err);
    }
  };

  // Effect to sync selectedCourseForSubjects with updated data
  useEffect(() => {
    if (selectedCourseForSubjects && allCourses.length > 0) {
      const updatedCourse = allCourses.find(c => c.id === selectedCourseForSubjects.id);
      if (updatedCourse) {
        setSelectedCourseForSubjects(updatedCourse);
      }
    }
  }, [allCourses]); // When data refreshes, update the modal's data source if found

  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
            <p className="text-gray-600 mt-1">Manage your courses, view subjects and batches</p>
          </div>
          <button
            onClick={handleAddCourseClick}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Course
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
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <CourseFilter
            exams={exams}
            selectedExamIds={selectedExamIds}
            onSelectionChange={setSelectedExamIds}
          />
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
        ) : filteredCourses.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-4">
              <BookOpen className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || selectedExamIds.length > 0
                ? "Try adjusting your filters or search query."
                : "Get started by adding a new course."}
            </p>
            {!searchQuery && selectedExamIds.length === 0 && (
              <button
                onClick={handleAddCourseClick}
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Course
              </button>
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

      {/* Add Course Modal */}
      {selectedExamForAdd && isAddCourseModalOpen && (
        <AddCourseModal
          isOpen={isAddCourseModalOpen}
          onClose={() => {
            setIsAddCourseModalOpen(false);
            setSelectedExamForAdd(null);
          }}
          examId={selectedExamForAdd}
          onCourseCreated={fetchData}
        />
      )}

      {/* Edit Course Modal */}
      {selectedCourse && selectedCourse.examId && isEditCourseModalOpen && (
        <EditCourseModal
          isOpen={isEditCourseModalOpen}
          onClose={() => {
            setIsEditCourseModalOpen(false);
            setSelectedCourse(null);
          }}
          course={selectedCourse}
          examId={selectedCourse.examId}
          onCourseUpdated={fetchData}
        />
      )}

      {/* Delete Course Confirmation Modal */}
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
          itemName={selectedCourse?.name}
        />
      )}

      {/* Subjects List Modal */}
      {selectedCourseForSubjects && isSubjectsListModalOpen && (
        <SubjectsListModal
          isOpen={isSubjectsListModalOpen}
          onClose={() => {
            setIsSubjectsListModalOpen(false);
            setSelectedCourseForSubjects(null);
          }}
          course={selectedCourseForSubjects}
          onAddSubject={handleAddSubject}
          onEditSubject={handleEditSubject}
          onDeleteSubject={handleDeleteSubject}
        />
      )}

      {/* Add Subject Modal */}
      {isAddSubjectModalOpen && selectedCourseForSubjects && selectedCourseForSubjects.examId && (
        <AddSubjectModal
          isOpen={isAddSubjectModalOpen}
          onClose={() => setIsAddSubjectModalOpen(false)}
          examId={selectedCourseForSubjects.examId!}
          courseId={selectedCourseForSubjects.id!}
          onSubjectCreated={fetchData}
        />
      )}

      {/* Edit Subject Modal */}
      {isEditSubjectModalOpen && selectedSubject && selectedCourseForSubjects && selectedCourseForSubjects.examId && (
        <EditSubjectModal
          isOpen={isEditSubjectModalOpen}
          onClose={() => {
            setIsEditSubjectModalOpen(false);
            setSelectedSubject(null);
          }}
          examId={selectedCourseForSubjects.examId!}
          courseId={selectedCourseForSubjects.id!}
          subject={selectedSubject}
          onSubjectUpdated={fetchData}
        />
      )}

      {/* Delete Subject Confirmation Modal */}
      {isDeleteSubjectModalOpen && selectedSubject && (
        <DeleteConfirmModal
          isOpen={isDeleteSubjectModalOpen}
          onClose={() => {
            setIsDeleteSubjectModalOpen(false);
            setSelectedSubject(null);
          }}
          onConfirm={confirmDeleteSubject}
          title="Delete Subject"
          message="Are you sure you want to delete this subject? This action cannot be undone."
          itemName={selectedSubject?.name}
        />
      )}

    </DashboardLayout>
  );
}
