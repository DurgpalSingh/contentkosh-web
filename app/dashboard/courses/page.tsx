'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ExamsService, CoursesService, SubjectsService } from '@/lib/api';
import { Exam, Course, Subject, ExamWithCourses, CourseWithSubjects } from '@/lib/api';
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
  const { user, business, isAuthenticated, isLoading, isInitialized, initializeAuth } = useAuthStore();
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [expandedExams, setExpandedExams] = useState<Set<number>>(new Set());
  const [expandedCourses, setExpandedCourses] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    const fetchExams = async () => {
      if (!business?.id) {
        setError('Business information not available');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching exams for business:', business.id);
        // Since there's no direct API to get all exams for a business,
        // we'll create a mock structure for now
        // TODO: Replace with actual API call when available
        const mockExams: Exam[] = [
          {
            id: 1,
            name: 'UPSC Civil Services',
            description: 'Union Public Service Commission Civil Services Examination',
            isActive: true,
            businessId: business.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            courses: [
              {
                id: 1,
                name: 'Preliminary Course',
                description: 'UPSC Preliminary Examination Preparation',
                duration: '6 months',
                isActive: true,
                examId: 1,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                subjects: [
                  {
                    id: 1,
                    name: 'General Studies Paper I',
                    description: 'History, Geography, Polity, Economy',
                    isActive: true,
                    courseId: 1,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  },
                  {
                    id: 2,
                    name: 'General Studies Paper II',
                    description: 'CSAT - Comprehension, Logical Reasoning',
                    isActive: true,
                    courseId: 1,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  }
                ]
              },
              {
                id: 2,
                name: 'Mains Course',
                description: 'UPSC Mains Examination Preparation',
                duration: '12 months',
                isActive: true,
                examId: 1,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                subjects: [
                  {
                    id: 3,
                    name: 'Essay',
                    description: 'Essay Writing Practice',
                    isActive: true,
                    courseId: 2,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  },
                  {
                    id: 4,
                    name: 'General Studies I',
                    description: 'Indian Heritage and Culture, History',
                    isActive: true,
                    courseId: 2,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  }
                ]
              }
            ]
          },
          {
            id: 2,
            name: 'NEET',
            description: 'National Eligibility cum Entrance Test',
            isActive: true,
            businessId: business.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            courses: [
              {
                id: 3,
                name: 'Physics Course',
                description: 'NEET Physics Preparation',
                duration: '8 months',
                isActive: true,
                examId: 2,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                subjects: [
                  {
                    id: 5,
                    name: 'Mechanics',
                    description: 'Classical Mechanics',
                    isActive: true,
                    courseId: 3,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  }
                ]
              }
            ]
          }
        ];
        
        setExams(mockExams);
        console.log('Mock exams loaded:', mockExams);
      } catch (err: any) {
        console.error('Error fetching exams:', err);
        setError(err.body?.message || 'Failed to fetch exams');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      if (business?.id) {
        fetchExams();
      } else {
        setLoading(false);
        // Optional: Set an error or info message if business is required
        // setError('No business profile found. Please contact support.');
      }
    }
  }, [isAuthenticated, business?.id]);

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
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
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
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
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
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function ExamCard({ 
  exam, 
  isExpanded, 
  onToggle, 
  expandedCourses, 
  onToggleCourse 
}: { 
  exam: Exam;
  isExpanded: boolean;
  onToggle: () => void;
  expandedCourses: Set<number>;
  onToggleCourse: (courseId: number) => void;
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
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  exam.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {exam.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="text-gray-400 hover:text-gray-600 p-1">
              <Edit className="h-4 w-4" />
            </button>
            <button className="text-gray-400 hover:text-red-600 p-1">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="px-6 py-4">
            <div className="space-y-3">
              {exam.courses?.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isExpanded={expandedCourses.has(course.id!)}
                  onToggle={() => onToggleCourse(course.id!)}
                />
              ))}
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
  onToggle 
}: { 
  course: Course;
  isExpanded: boolean;
  onToggle: () => void;
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
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  course.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {course.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button className="text-gray-400 hover:text-gray-600 p-1">
              <Edit className="h-3 w-3" />
            </button>
            <button className="text-gray-400 hover:text-red-600 p-1">
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="px-4 py-3">
            <div className="space-y-2">
              {course.subjects?.map((subject) => (
                <SubjectCard key={subject.id} subject={subject} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SubjectCard({ subject }: { subject: Subject }) {
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
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                subject.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {subject.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button className="text-gray-400 hover:text-gray-600 p-1">
            <Edit className="h-3 w-3" />
          </button>
          <button className="text-gray-400 hover:text-red-600 p-1">
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
