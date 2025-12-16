'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { AddExamModal } from '@/components/modals/AddExamModal';
import { EditExamModal } from '@/components/modals/EditExamModal';
import { AddCourseModal } from '@/components/modals/AddCourseModal';
import { EditCourseModal } from '@/components/modals/EditCourseModal';
import { AddBatchModal } from '@/components/modals/AddBatchModal';
import { EditBatchModal } from '@/components/modals/EditBatchModal';
import { AddSubjectModal } from '@/components/modals/AddSubjectModal';
import { EditSubjectModal } from '@/components/modals/EditSubjectModal';
import { DeleteConfirmModal } from '@/components/modals/DeleteConfirmModal';
import { ExamsService, CoursesService, SubjectsService, BatchesService } from '@/lib/api';
import { Exam, Course, Subject, Batch, ExamWithCourses, CourseWithSubjects } from '@/lib/api';
import {
  BookOpen,
  GraduationCap,
  FileText,
  Plus,
  ChevronDown,
  ChevronRight,
  Calendar,
  Clock,
  Users,
  Edit,
  Trash2
} from 'lucide-react';

export default function CoursesPage() {
  const { user, business, isAuthenticated, isLoading, isInitialized, initializeAuth, logout } = useAuthStore();

  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [expandedExams, setExpandedExams] = useState<Set<number>>(new Set());
  const [expandedCourses, setExpandedCourses] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddExamModalOpen, setIsAddExamModalOpen] = useState(false);
  const [isEditExamModalOpen, setIsEditExamModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

  // Course modal states
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [isEditCourseModalOpen, setIsEditCourseModalOpen] = useState(false);
  const [isDeleteCourseModalOpen, setIsDeleteCourseModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedExamForCourse, setSelectedExamForCourse] = useState<number | null>(null);

  // Batch modal states
  const [isAddBatchModalOpen, setIsAddBatchModalOpen] = useState(false);
  const [isEditBatchModalOpen, setIsEditBatchModalOpen] = useState(false);
  const [isDeleteBatchModalOpen, setIsDeleteBatchModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [selectedCourseForBatch, setSelectedCourseForBatch] = useState<Course | null>(null);

  // Subject modal states
  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false);
  const [isEditSubjectModalOpen, setIsEditSubjectModalOpen] = useState(false);
  const [isDeleteSubjectModalOpen, setIsDeleteSubjectModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedCourseForSubject, setSelectedCourseForSubject] = useState<Course | null>(null);
  const [selectedExamForSubject, setSelectedExamForSubject] = useState<number | null>(null);

  useEffect(() => {
    if (!isInitialized) {
      console.log('Initializing auth...');
      initializeAuth();
    }
  }, [initializeAuth, isInitialized]);

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      console.log('Redirecting to login - not authenticated');
      router.push('/login');
    }
  }, [isAuthenticated, isInitialized, router]);

  const fetchExams = useCallback(async () => {
    if (!business?.id) {
      setError('Business information not available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching exams for business:', business.id);

      // Fetch all exams for this business
      const response = await ExamsService.getApiExams(business.id);
      console.log('Exams response:', response);

      // For each exam, fetch its courses with subjects
      const examsWithCourses: Exam[] = [];
      for (const exam of response.data || []) {
        if (exam.id) {
          try {
            const examWithCoursesResponse = await ExamsService.getApiExamsWithCourses(exam.id);
            if (examWithCoursesResponse.data) {
              // For each course, fetch its subjects
              const coursesWithSubjects: Course[] = [];
              for (const course of examWithCoursesResponse.data.courses || []) {
                if (course.id && exam.id) {
                  try {
                    const courseWithSubjectsResponse = await CoursesService.getApiExamsCoursesWithSubjects(exam.id, course.id);
                    // Fetch batches for the course
                    let batches: Batch[] = [];
                    try {
                      const batchesResponse = await BatchesService.getApiBatchesCourse(course.id);
                      batches = batchesResponse.data || [];
                    } catch (err) {
                      console.error(`Failed to fetch batches for course ${course.id}`, err);
                    }

                    coursesWithSubjects.push({
                      ...course,
                      subjects: courseWithSubjectsResponse.data?.subjects || [],
                      batches: batches
                    });
                  } catch {
                    coursesWithSubjects.push(course);
                  }
                } else {
                  coursesWithSubjects.push(course);
                }
              }
              examsWithCourses.push({
                ...examWithCoursesResponse.data,
                courses: coursesWithSubjects
              });
            } else {
              examsWithCourses.push(exam);
            }
          } catch {
            examsWithCourses.push(exam);
          }
        }
      }

      setExams(examsWithCourses);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching exams:', err);

      // Handle authentication errors - log out and redirect to login
      if (err.status === 401 || err.body?.message?.toLowerCase().includes('token')) {
        console.log('Authentication error detected, logging out...');
        await logout();
        router.push('/login');
        return;
      }

      setError(err.body?.message || 'Failed to fetch exams');
    } finally {
      setLoading(false);
    }
  }, [business?.id]);


  useEffect(() => {
    if (isAuthenticated && business?.id) {
      fetchExams();
    }
  }, [isAuthenticated, business?.id, fetchExams]);


  const toggleExam = (examId: number) => {
    const newExpanded = new Set(expandedExams);
    if (newExpanded.has(examId)) {
      newExpanded.delete(examId);
    } else {
      newExpanded.add(examId);
    }
    setExpandedExams(newExpanded);
  };

  const toggleCourse = (courseId: number) => {
    const newExpanded = new Set(expandedCourses);
    if (newExpanded.has(courseId)) {
      newExpanded.delete(courseId);
    } else {
      newExpanded.add(courseId);
    }
    setExpandedCourses(newExpanded);
  };

  const handleEditExam = (exam: Exam) => {
    setSelectedExam(exam);
    setIsEditExamModalOpen(true);
  };

  const handleDeleteExam = (exam: Exam) => {
    setSelectedExam(exam);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteExam = async () => {
    if (!selectedExam?.id) return;
    await ExamsService.deleteApiExams(selectedExam.id);
    await fetchExams();
  };

  // Course handlers
  const handleAddCourse = (examId: number) => {
    setSelectedExamForCourse(examId);
    setIsAddCourseModalOpen(true);
  };

  const handleEditCourse = (course: Course, examId: number) => {
    setSelectedCourse(course);
    setSelectedExamForCourse(examId);
    setIsEditCourseModalOpen(true);
  };

  const handleDeleteCourse = (course: Course, examId: number) => {
    setSelectedCourse(course);
    setSelectedExamForCourse(examId);
    setIsDeleteCourseModalOpen(true);
  };

  const confirmDeleteCourse = async () => {
    if (!selectedCourse?.id || !selectedExamForCourse) return;
    await CoursesService.deleteApiExamsCourses(selectedExamForCourse, selectedCourse.id);
    await fetchExams();
  };

  // Batch handlers
  const handleAddBatch = (course: Course, examId: number) => {
    setSelectedCourseForBatch(course);
    setIsAddBatchModalOpen(true);
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
    await BatchesService.deleteApiBatches(selectedBatch.id);
    await fetchExams();
  };

  // Subject handlers
  const handleAddSubject = (course: Course, examId: number) => {
    setSelectedCourseForSubject(course);
    setSelectedExamForSubject(examId);
    setIsAddSubjectModalOpen(true);
  };

  const handleEditSubject = (subject: Subject, course: Course, examId: number) => {
    setSelectedSubject(subject);
    setSelectedCourseForSubject(course);
    setSelectedExamForSubject(examId);
    setIsEditSubjectModalOpen(true);
  };

  const handleDeleteSubject = (subject: Subject, course: Course, examId: number) => {
    setSelectedSubject(subject);
    setSelectedCourseForSubject(course);
    setSelectedExamForSubject(examId);
    setIsDeleteSubjectModalOpen(true);
  };

  const confirmDeleteSubject = async () => {
    if (!selectedSubject?.id || !selectedCourseForSubject?.id || !selectedExamForSubject) return;
    await SubjectsService.deleteApiExamsCoursesSubjects(selectedExamForSubject, selectedCourseForSubject.id, selectedSubject.id);
    await fetchExams();
  };

  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
            <p className="text-gray-600">Manage exams, courses, and subjects</p>
          </div>
          <div className="flex space-x-3">

            <button
              onClick={() => setIsAddExamModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Exam
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="text-red-600 mr-3">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </div>
          </div>
        ) : exams.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
            <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No exams found</h3>
            <p className="text-gray-600 mb-4">Create your first exam to get started.</p>

            <button
              onClick={() => setIsAddExamModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add First Exam
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {exams.map((exam) => (
              <ExamCard
                key={exam.id}
                exam={exam}
                isExpanded={expandedExams.has(exam.id!)}
                onToggle={() => toggleExam(exam.id!)}
                expandedCourses={expandedCourses}
                onToggleCourse={toggleCourse}
                onEdit={() => handleEditExam(exam)}
                onDelete={() => handleDeleteExam(exam)}
                onAddCourse={() => handleAddCourse(exam.id!)}
                onEditCourse={(course) => handleEditCourse(course, exam.id!)}
                onDeleteCourse={(course) => handleDeleteCourse(course, exam.id!)}
                onAddBatch={(course) => handleAddBatch(course, exam.id!)}
                onEditBatch={handleEditBatch}
                onDeleteBatch={handleDeleteBatch}
                onAddSubject={(course) => handleAddSubject(course, exam.id!)}
                onEditSubject={(subject, course) => handleEditSubject(subject, course, exam.id!)}
                onDeleteSubject={(subject, course) => handleDeleteSubject(subject, course, exam.id!)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Exam Modal */}
      {/* Add Exam Modal */}
      {business?.id && isAddExamModalOpen && (
        <AddExamModal
          isOpen={isAddExamModalOpen}
          onClose={() => setIsAddExamModalOpen(false)}
          businessId={business.id}
          onExamCreated={fetchExams}
        />
      )}

      {/* Edit Exam Modal */}
      {selectedExam && isEditExamModalOpen && (
        <EditExamModal
          isOpen={isEditExamModalOpen}
          onClose={() => {
            setIsEditExamModalOpen(false);
            setSelectedExam(null);
          }}
          exam={selectedExam}
          onExamUpdated={fetchExams}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedExam(null);
          }}
          onConfirm={confirmDeleteExam}
          title="Delete Exam"
          message="Are you sure you want to delete this exam? This action cannot be undone."
          itemName={selectedExam?.name}
        />
      )}

      {/* Add Course Modal */}
      {selectedExamForCourse && isAddCourseModalOpen && (
        <AddCourseModal
          isOpen={isAddCourseModalOpen}
          onClose={() => {
            setIsAddCourseModalOpen(false);
            setSelectedExamForCourse(null);
          }}
          examId={selectedExamForCourse}
          onCourseCreated={fetchExams}
        />
      )}

      {/* Edit Course Modal */}
      {selectedCourse && selectedExamForCourse && isEditCourseModalOpen && (
        <EditCourseModal
          isOpen={isEditCourseModalOpen}
          onClose={() => {
            setIsEditCourseModalOpen(false);
            setSelectedCourse(null);
            setSelectedExamForCourse(null);
          }}
          course={selectedCourse}
          examId={selectedExamForCourse}
          onCourseUpdated={fetchExams}
        />
      )}

      {/* Delete Course Confirmation Modal */}
      {isDeleteCourseModalOpen && (
        <DeleteConfirmModal
          isOpen={isDeleteCourseModalOpen}
          onClose={() => {
            setIsDeleteCourseModalOpen(false);
            setSelectedCourse(null);
            setSelectedExamForCourse(null);
          }}
          onConfirm={confirmDeleteCourse}
          title="Delete Course"
          message="Are you sure you want to delete this course? This will also delete all subjects under it. This action cannot be undone."
          itemName={selectedCourse?.name}
        />
      )}

      {/* Add Batch Modal */}
      {selectedCourseForBatch && isAddBatchModalOpen && (
        <AddBatchModal
          isOpen={isAddBatchModalOpen}
          onClose={() => {
            setIsAddBatchModalOpen(false);
            setSelectedCourseForBatch(null);
          }}
          courseId={selectedCourseForBatch.id!}
          subjects={selectedCourseForBatch.subjects}
          onBatchCreated={fetchExams}
        />
      )}

      {/* Edit Batch Modal */}
      {selectedBatch && isEditBatchModalOpen && (
        <EditBatchModal
          isOpen={isEditBatchModalOpen}
          onClose={() => {
            setIsEditBatchModalOpen(false);
            setSelectedBatch(null);
          }}
          batch={selectedBatch}
          onBatchUpdated={fetchExams}
        />
      )}

      {/* Delete Batch Confirmation Modal */}
      {isDeleteBatchModalOpen && (
        <DeleteConfirmModal
          isOpen={isDeleteBatchModalOpen}
          onClose={() => {
            setIsDeleteBatchModalOpen(false);
            setSelectedBatch(null);
          }}
          onConfirm={confirmDeleteBatch}
          title="Delete Batch"
          message="Are you sure you want to delete this batch? This will remove all student enrollments in this batch. This action cannot be undone."
          itemName={selectedBatch?.displayName}
        />
      )}

      {/* Add Subject Modal */}
      {selectedCourseForSubject && selectedExamForSubject && isAddSubjectModalOpen && (
        <AddSubjectModal
          isOpen={isAddSubjectModalOpen}
          onClose={() => {
            setIsAddSubjectModalOpen(false);
            setSelectedCourseForSubject(null);
            setSelectedExamForSubject(null);
          }}
          examId={selectedExamForSubject}
          courseId={selectedCourseForSubject.id!}
          onSubjectCreated={fetchExams}
        />
      )}

      {/* Edit Subject Modal */}
      {selectedSubject && selectedCourseForSubject && selectedExamForSubject && isEditSubjectModalOpen && (
        <EditSubjectModal
          isOpen={isEditSubjectModalOpen}
          onClose={() => {
            setIsEditSubjectModalOpen(false);
            setSelectedSubject(null);
            setSelectedCourseForSubject(null);
            setSelectedExamForSubject(null);
          }}
          examId={selectedExamForSubject}
          courseId={selectedCourseForSubject.id!}
          subject={selectedSubject}
          onSubjectUpdated={fetchExams}
        />
      )}

      {/* Delete Subject Confirmation Modal */}
      {isDeleteSubjectModalOpen && (
        <DeleteConfirmModal
          isOpen={isDeleteSubjectModalOpen}
          onClose={() => {
            setIsDeleteSubjectModalOpen(false);
            setSelectedSubject(null);
            setSelectedCourseForSubject(null);
            setSelectedExamForSubject(null);
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

function ExamCard({
  exam,
  isExpanded,
  onToggle,
  expandedCourses,
  onToggleCourse,
  onEdit,
  onDelete,
  onAddCourse,
  onEditCourse,
  onDeleteCourse,
  onAddBatch,
  onEditBatch,
  onDeleteBatch,
  onAddSubject,
  onEditSubject,
  onDeleteSubject
}: {
  exam: Exam;
  isExpanded: boolean;
  onToggle: () => void;
  expandedCourses: Set<number>;
  onToggleCourse: (courseId: number) => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddCourse: () => void;
  onEditCourse: (course: Course) => void;
  onDeleteCourse: (course: Course) => void;
  onAddBatch: (course: Course) => void;
  onEditBatch: (batch: Batch) => void;
  onDeleteBatch: (batch: Batch) => void;
  onAddSubject: (course: Course) => void;
  onEditSubject: (subject: Subject, course: Course) => void;
  onDeleteSubject: (subject: Subject, course: Course) => void;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">

      <div
        className="px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              {isExpanded ? (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-400" />
              )}
            </div>
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-medium text-gray-900">{exam.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{exam.description}</p>
              <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-1" />
                  <span>{exam.courses?.length || 0} courses</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>

                    {exam.createdAt
                      ? new Date(exam.createdAt).toLocaleDateString()
                      : 'Unknown date'
                    }
                  </span>
                </div>

                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${exam.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
                  }`}>
                  {exam.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">

            <button
              className="text-gray-400 hover:text-gray-600 p-1"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Edit className="h-4 w-4" />
            </button>

            <button
              className="text-gray-400 hover:text-red-600 p-1"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Courses</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddCourse();
                }}
                className="text-sm text-green-600 hover:text-green-700 flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Course
              </button>
            </div>
            <div className="space-y-3">
              {exam.courses && exam.courses.length > 0 ? (
                exam.courses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    isExpanded={expandedCourses.has(course.id!)}
                    onToggle={() => onToggleCourse(course.id!)}
                    onEdit={() => onEditCourse(course)}
                    onDelete={() => onDeleteCourse(course)}
                    onAddBatch={() => onAddBatch(course)}
                    onEditBatch={onEditBatch}
                    onDeleteBatch={onDeleteBatch}
                    onAddSubject={() => onAddSubject(course)}
                    onEditSubject={(subject) => onEditSubject(subject, course)}
                    onDeleteSubject={(subject) => onDeleteSubject(subject, course)}
                  />
                ))
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm">
                  No courses yet. Click "Add Course" to create one.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CourseCard({
  course,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  onAddBatch,
  onEditBatch,
  onDeleteBatch,
  onAddSubject,
  onEditSubject,
  onDeleteSubject
}: {
  course: Course;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddBatch: () => void;
  onEditBatch: (batch: Batch) => void;
  onDeleteBatch: (batch: Batch) => void;
  onAddSubject: () => void;
  onEditSubject: (subject: Subject) => void;
  onDeleteSubject: (subject: Subject) => void;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg">

      <div
        className="px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-400" />
              )}
            </div>
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900">{course.name}</h4>
              <p className="text-xs text-gray-600 mt-1">{course.description}</p>
              <div className="flex items-center mt-1 space-x-3 text-xs text-gray-500">
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center">
                  <FileText className="h-3 w-3 mr-1" />
                  <span>{course.subjects?.length || 0} subjects</span>
                </div>

                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${course.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
                  }`}>
                  {course.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button
              className="text-gray-400 hover:text-gray-600 p-1"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Edit className="h-3 w-3" />
            </button>
            <button
              className="text-gray-400 hover:text-red-600 p-1"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="px-4 py-3 space-y-4">
            {/* Subjects Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Subjects</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddSubject();
                  }}
                  className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Subject
                </button>
              </div>
              {course.subjects && course.subjects.length > 0 ? (
                <div className="space-y-2">
                  {course.subjects.map((subject) => (
                    <SubjectCard
                      key={subject.id}
                      subject={subject}
                      onEdit={() => onEditSubject(subject)}
                      onDelete={() => onDeleteSubject(subject)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-2 text-gray-400 text-xs bg-white rounded border border-dashed border-gray-300">
                  No subjects yet
                </div>
              )}
            </div>

            {/* Batches Section */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Batches</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddBatch();
                  }}
                  className="text-xs text-purple-600 hover:text-purple-700 flex items-center"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Batch
                </button>
              </div>
              <div className="mt-2 space-y-2">
                {course.batches && course.batches.length > 0 ? (
                  course.batches.map((batch: Batch) => (
                    <BatchCard
                      key={batch.id}
                      batch={batch}
                      onEdit={() => onEditBatch(batch)}
                      onDelete={() => onDeleteBatch(batch)}
                    />
                  ))
                ) : (
                  <div className="text-center py-3 text-gray-400 text-xs bg-white rounded border border-dashed border-gray-300">
                    No batches yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SubjectCard({
  subject,
  onEdit,
  onDelete
}: {
  subject: Subject;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="h-6 w-6 rounded-lg bg-purple-100 flex items-center justify-center">
              <FileText className="h-3 w-3 text-purple-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h5 className="text-sm font-medium text-gray-900">{subject.name}</h5>
            <p className="text-xs text-gray-600 mt-1">{subject.description}</p>
            <div className="flex items-center mt-1">

              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${subject.isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
                }`}>
                {subject.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button
            className="text-gray-400 hover:text-gray-600 p-1"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <Edit className="h-3 w-3" />
          </button>
          <button
            className="text-gray-400 hover:text-red-600 p-1"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

function BatchCard({
  batch,
  onEdit,
  onDelete
}: {
  batch: Batch;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="h-6 w-6 rounded-lg bg-purple-100 flex items-center justify-center">
              <Users className="h-3 w-3 text-purple-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h5 className="text-sm font-medium text-gray-900">{batch.displayName}</h5>
            <p className="text-xs text-gray-500 mt-0.5">{batch.codeName}</p>
            <div className="flex items-center mt-1 space-x-2 text-xs text-gray-500">
              <span className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {formatDate(batch.startDate)} - {formatDate(batch.endDate)}
              </span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${batch.isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
                }`}>
                {batch.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button
            className="text-gray-400 hover:text-gray-600 p-1"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <Edit className="h-3 w-3" />
          </button>
          <button
            className="text-gray-400 hover:text-red-600 p-1"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

