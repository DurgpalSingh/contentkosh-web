'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ExamsService, BatchesService, CoursesService, UsersService } from '@/lib/api';
import { Exam, Course, Batch, BatchUser, BatchWithUsers } from '@/lib/api';
import { Users, Filter, Search, GraduationCap } from 'lucide-react';
import { StudentGridCard } from '@/components/dashboard/students/StudentGridCard';
import { StudentsFilterModal } from '@/components/dashboard/students/StudentsFilterModal';

interface AggregatedStudent {
    id: number;
    name: string;
    email: string;
    createdAt?: string;
    enrolledBatches: ExtendedBatch[];
}

interface ExtendedBatch extends Batch {
    courseId?: number;
    examId?: number;
}

export default function StudentsPage() {
    const { user, business, isAuthenticated, isLoading, isInitialized, initializeAuth } = useAuthStore();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Data State
    const [exams, setExams] = useState<Exam[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [batches, setBatches] = useState<ExtendedBatch[]>([]);
    const [allStudents, setAllStudents] = useState<AggregatedStudent[]>([]);

    // UI State
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Filter State
    const [selectedExamIds, setSelectedExamIds] = useState<number[]>([]);
    const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([]);
    const [selectedBatchIds, setSelectedBatchIds] = useState<number[]>([]);

    // Initial Data Fetch
    useEffect(() => {
        const fetchData = async () => {
            if (!business?.id || typeof business.id !== 'number') return;

            try {
                setLoading(true);
                console.log('Fetching initial data for students page...');

                // 1. Fetch Exams with Courses and Batches included
                const examsResponse = await ExamsService.getApiBusinessExams(business.id, 'courses.batches');
                const fetchedExams = examsResponse.data || [];
                setExams(fetchedExams);

                // 2. Extract all courses
                const allFetchedCourses = fetchedExams.flatMap(exam =>
                    (exam.courses as Course[]) || []
                );
                setCourses(allFetchedCourses);

                // 3. Extract all batches from courses
                const allFetchedBatches: ExtendedBatch[] = allFetchedCourses.flatMap(course => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const courseBatches = ((course as any).batches as Batch[]) || [];
                    return courseBatches.map(batch => ({
                        ...batch,
                        courseId: course.id,
                        examId: course.examId
                    }));
                });
                setBatches(allFetchedBatches);

                let allBusinessUsers = [];
                try {
                    const usersResponse = await UsersService.getApiBusinessUsers(business.id);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    allBusinessUsers = (usersResponse.data as any[]) || [];
                } catch (userErr) {
                    console.error('Failed to fetch business users:', userErr);
                }

                // 5. Aggregate Data
                const studentMap = new Map<number, AggregatedStudent>();

                // Initialize map with all filtered business users
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                allBusinessUsers.forEach((bUser: any) => {
                    const userData = bUser.user;
                    if (userData && userData.id) {

                        if (!studentMap.has(userData.id)) {
                            studentMap.set(userData.id, {
                                id: userData.id,
                                name: userData.name || 'Unknown',
                                email: userData.email || '',
                                createdAt: bUser.createdAt,
                                enrolledBatches: []
                            });
                        }
                    }
                });

                // Attempt to link batch information if possible. 
                // Without getApiBatchesWithUsers, we can't easily know which student is in which batch
                // UNLESS the 'getApiBusinessUsers' returns that info (it currently doesn't seem to based on my repo check).
                // So for now, we will display the LIST of students, but the 'enrolledBatches' might be empty
                // until we implement a proper backend endpoint for 'students with batches'.

                /* 
                   LIMITATION: The current backend implementation of getUsersByBusiness
                   returns User details but DOES NOT include batch enrollments.
                   So the 'Batches' column in the Students table will be empty.
                   However, at least the students will LIST now.
                */


                setAllStudents(Array.from(studentMap.values()));

                // Check URL params for initial filters
                const batchIdParam = searchParams.get('batchId');
                if (batchIdParam) {
                    const batchId = parseInt(batchIdParam);
                    if (!isNaN(batchId)) {
                        setSelectedBatchIds([batchId]);
                        // Also try to set parent course and exam filters if possible
                        const batch = allFetchedBatches.find(b => b.id === batchId);
                        if (batch?.courseId) {
                            setSelectedCourseIds([batch.courseId]);
                            const course = allFetchedCourses.find(c => c.id === batch.courseId);
                            if (course?.examId) {
                                setSelectedExamIds([course.examId]);
                            }
                        }
                    }
                }

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (err: any) {
                console.error('Error fetching student data:', err);
                setError('Failed to load students data');
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated && business?.id) {
            fetchData();
        }
    }, [isAuthenticated, business?.id, searchParams]);


    // Filtering Logic
    const filteredStudents = useMemo(() => {
        return allStudents.filter(student => {
            // 1. Search Query
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                const matchesName = student.name.toLowerCase().includes(q);
                const matchesEmail = student.email.toLowerCase().includes(q);
                if (!matchesName && !matchesEmail) return false;
            }

            // 2. Batch Filters (Most specific)
            if (selectedBatchIds.length > 0) {
                const inSelectedBatch = student.enrolledBatches.some(b => selectedBatchIds.includes(b.id!));
                if (!inSelectedBatch) return false;
            }

            // 3. Course Filters (If batch not selected, or in addition)
            // Logic: If I select Course A, I want students enrolled in ANY batch of Course A.
            if (selectedCourseIds.length > 0) {
                const inSelectedCourse = student.enrolledBatches.some(b => b.courseId && selectedCourseIds.includes(b.courseId));
                if (!inSelectedCourse) return false;
            }

            // 4. Exam Filters
            if (selectedExamIds.length > 0) {
                // We need to know which exam the batch belongs to.
                // We can derive this from the courses list.
                const inSelectedExam = student.enrolledBatches.some(b => {
                    const course = courses.find(c => c.id === b.courseId);
                    return course?.examId && selectedExamIds.includes(course.examId);
                });
                if (!inSelectedExam) return false;
            }

            return true;
        });
    }, [allStudents, searchQuery, selectedBatchIds, selectedCourseIds, selectedExamIds, courses]);


    if (!isInitialized || isLoading) {
        return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
    }
    if (!isAuthenticated || !user) return null;

    const activeFilterCount = selectedExamIds.length + selectedCourseIds.length + selectedBatchIds.length;

    return (
        <>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Students</h1>
                        <p className="text-slate-600">Manage students across all batches</p>
                    </div>
                    <div className="flex space-x-3">
                        {/* Optional: Export button or Add Student (if applicable globally) */}
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search students by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>
                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className={`flex items-center px-4 py-2 border rounded-lg font-medium transition-colors ${activeFilterCount > 0
                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                            : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                            }`}
                    >
                        <Filter className="h-4 w-4 mr-2" />
                        Filters
                        {activeFilterCount > 0 && (
                            <span className="ml-2 bg-blue-200 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                                {activeFilterCount}
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
                    <div className="bg-red-50 p-4 rounded-lg text-red-700">{error}</div>
                ) : filteredStudents.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-4">
                            <GraduationCap className="h-6 w-6 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 mb-2">No students found</h3>
                        <p className="text-slate-500 max-w-sm mx-auto">
                            {searchQuery || activeFilterCount > 0
                                ? "Try adjusting your search or filters to find what you're looking for."
                                : "Students enrolled in batches will appear here automatically."}
                        </p>
                        {(searchQuery || activeFilterCount > 0) && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedExamIds([]);
                                    setSelectedCourseIds([]);
                                    setSelectedBatchIds([]);
                                }}
                                className="mt-4 text-blue-600 font-medium hover:text-blue-800"
                            >
                                Clear all filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredStudents.map(student => (
                            <StudentGridCard key={student.id} student={student} />
                        ))}
                    </div>
                )}

                {/* Filter Modal */}
                <StudentsFilterModal
                    isOpen={isFilterOpen}
                    onClose={() => setIsFilterOpen(false)}
                    exams={exams}
                    allCourses={courses}
                    allBatches={batches}
                    initialSelectedExamIds={selectedExamIds}
                    initialSelectedCourseIds={selectedCourseIds}
                    initialSelectedBatchIds={selectedBatchIds}
                    onApplyFilters={(eIds, cIds, bIds) => {
                        setSelectedExamIds(eIds);
                        setSelectedCourseIds(cIds);
                        setSelectedBatchIds(bIds);
                    }}
                />
            </div>
        </>
    );
}
