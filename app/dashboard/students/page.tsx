'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
    ExamsService,
    BatchesService,
    BatchUsersService,
} from '@/lib/api';
import type { Exam, Course, Batch } from '@/lib/api';
import { Filter, Search, GraduationCap, UserPlus, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { StudentsFilterModal } from '@/components/dashboard/students/StudentsFilterModal';
import { AddStudentToBatchModal } from '@/components/modals/AddStudentToBatchModal';
import { RemoveStudentFromBatchModal } from '@/components/modals/RemoveStudentFromBatchModal';
import { Button } from '@/components/ui/button';

/* -------------------- Types -------------------- */

interface ExtendedBatch extends Batch {
    courseId?: number;
    examId?: number;
    courseName?: string;
}

interface BatchStudent {
    id: number; // BatchUser ID
    userId: number;
    name: string;
    email: string;
    isActive: boolean;
    createdAt?: string;
}

interface BatchSection {
    batch: ExtendedBatch;
    students: BatchStudent[];
    isExpanded: boolean;
}

/* -------------------- Page -------------------- */

export default function StudentsPage() {
    const { user, business, isAuthenticated, isLoading, isInitialized } =
        useAuthStore();
    const searchParams = useSearchParams();

    // Data
    const [exams, setExams] = useState<Exam[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [batches, setBatches] = useState<ExtendedBatch[]>([]);
    const [batchSections, setBatchSections] = useState<BatchSection[]>([]);

    // UI
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Filters
    const [selectedExamIds, setSelectedExamIds] = useState<number[]>([]);
    const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([]);
    const [selectedBatchIds, setSelectedBatchIds] = useState<number[]>([]);

    // Modals
    const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
    const [isRemoveStudentModalOpen, setIsRemoveStudentModalOpen] = useState(false);
    const [selectedBatchForAdd, setSelectedBatchForAdd] = useState<ExtendedBatch | null>(null);
    const [selectedStudentForRemove, setSelectedStudentForRemove] = useState<{
        batch: ExtendedBatch;
        student: BatchStudent;
    } | null>(null);

    /* -------------------- Data Fetch -------------------- */

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

    async function fetchBatchesForCourses(
        courses: Course[]
    ): Promise<ExtendedBatch[]> {
        const requests = courses
            .filter((c) => c.id)
            .map((course) =>
                BatchesService.getApiBatchesCourse({ courseId: course.id! }).then(
                    (res) =>
                        (res.data ?? []).map((batch) => ({
                            ...batch,
                            courseId: course.id,
                            examId: course.examId,
                            courseName: course.name,
                        }))
                )
            );

        const responses = await Promise.all(requests);
        return responses.flat();
    }

    async function fetchStudentsForBatch(batchId: number): Promise<BatchStudent[]> {
        const response = await BatchUsersService.getApiBatchesUsers({ batchId });
        
        return (response.data ?? []).map((bu) => ({
            id: bu.id!,
            userId: bu.user?.id ?? 0,
            name: bu.user?.name ?? 'Unknown',
            email: bu.user?.email ?? '',
            isActive: bu.isActive ?? true,
            createdAt: bu.createdAt,
        }));
    }

    const fetchData = useCallback(async () => {
        if (!business?.id) return;

        setLoading(true);
        setError(null);

        try {
            const { exams, courses } = await fetchExamsAndCourses(business.id);
            setExams(exams);
            setCourses(courses);

            const batches = await fetchBatchesForCourses(courses);
            setBatches(batches);

            // Fetch students for each batch
            const sectionsPromises = batches.map(async (batch) => {
                const students = await fetchStudentsForBatch(batch.id!);
                return {
                    batch,
                    students,
                    isExpanded: true, // Expand all by default
                };
            });

            const sections = await Promise.all(sectionsPromises);
            setBatchSections(sections);
        } catch (err) {
            console.error(err);
            setError('Failed to load students');
        } finally {
            setLoading(false);
        }
    }, [business?.id]);


    useEffect(() => {
        if (!isAuthenticated || !business?.id) return;
        
        fetchData();
        
        // Check if batchId is in URL params
        const batchIdParam = searchParams.get('batchId');
        if (batchIdParam) {
            const batchId = Number(batchIdParam);
            if (!isNaN(batchId)) {
                setSelectedBatchIds([batchId]);
            }
        }
    }, [isAuthenticated, business?.id, searchParams, fetchData]);

    /* -------------------- Handlers -------------------- */

    const toggleSection = (batchId: number) => {
        setBatchSections((prev) =>
            prev.map((section) =>
                section.batch.id === batchId
                    ? { ...section, isExpanded: !section.isExpanded }
                    : section
            )
        );
    };

    const handleAddStudent = (batch: ExtendedBatch) => {
        setSelectedBatchForAdd(batch);
        setIsAddStudentModalOpen(true);
    };

    const handleRemoveStudent = (batch: ExtendedBatch, student: BatchStudent) => {
        setSelectedStudentForRemove({ batch, student });
        setIsRemoveStudentModalOpen(true);
    };

    const handleToggleStudentStatus = async (
        batchId: number,
        userId: number,
        currentStatus: boolean
    ) => {
        try {
            await BatchUsersService.putApiBatchesUsers({
                batchId,
                userId,
                requestBody: { isActive: !currentStatus },
            });
            
            // Refresh the specific batch section
            const students = await fetchStudentsForBatch(batchId);
            setBatchSections((prev) =>
                prev.map((section) =>
                    section.batch.id === batchId
                        ? { ...section, students }
                        : section
                )
            );
        } catch (err) {
            console.error('Error updating student status:', err);
            const error = err as { body?: { message?: string } };
            alert(error.body?.message || 'Failed to update student status');
        }
    };

    const onStudentAdded = async () => {
        if (selectedBatchForAdd?.id) {
            const students = await fetchStudentsForBatch(selectedBatchForAdd.id);
            setBatchSections((prev) =>
                prev.map((section) =>
                    section.batch.id === selectedBatchForAdd.id
                        ? { ...section, students }
                        : section
                )
            );
        }
    };

    const onStudentRemoved = async () => {
        if (selectedStudentForRemove?.batch.id) {
            const students = await fetchStudentsForBatch(selectedStudentForRemove.batch.id);
            setBatchSections((prev) =>
                prev.map((section) =>
                    section.batch.id === selectedStudentForRemove.batch.id
                        ? { ...section, students }
                        : section
                )
            );
        }
    };

    /* -------------------- Filtering -------------------- */

    const filteredSections = batchSections.filter((section) => {
        const batch = section.batch;

        // Filter by exam
        if (
            selectedExamIds.length > 0 &&
            (!batch.examId || !selectedExamIds.includes(batch.examId))
        ) {
            return false;
        }

        // Filter by course
        if (
            selectedCourseIds.length > 0 &&
            (!batch.courseId || !selectedCourseIds.includes(batch.courseId))
        ) {
            return false;
        }

        // Filter by batch
        if (
            selectedBatchIds.length > 0 &&
            !selectedBatchIds.includes(batch.id!)
        ) {
            return false;
        }

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const batchMatches =
                batch.displayName?.toLowerCase().includes(query) ||
                batch.codeName?.toLowerCase().includes(query);

            const studentMatches = section.students.some(
                (s) =>
                    s.name.toLowerCase().includes(query) ||
                    s.email.toLowerCase().includes(query)
            );

            return batchMatches || studentMatches;
        }

        return true;
    });

    const totalStudents = filteredSections.reduce(
        (sum, section) => sum + section.students.length,
        0
    );

    /* -------------------- Render -------------------- */

    if (!isInitialized || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!isAuthenticated || !user) return null;

    const activeFilterCount =
        selectedExamIds.length +
        selectedCourseIds.length +
        selectedBatchIds.length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Students</h1>
                    <p className="text-gray-600 mt-1">
                        Manage student enrollments by batch
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                        {totalStudents}
                    </div>
                    <div className="text-sm text-gray-500">Total Students</div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                    <input
                        className="w-full pl-10 py-2 border rounded-lg"
                        placeholder="Search batches or students..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <button
                    onClick={() => setIsFilterOpen(true)}
                    className="flex items-center px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                    <Filter className="inline h-4 w-4 mr-2" />
                    Filters
                    {activeFilterCount > 0 && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
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
                <div className="text-center py-12">
                    <div className="text-red-600">{error}</div>
                </div>
            ) : filteredSections.length === 0 ? (
                <div className="text-center py-12">
                    <GraduationCap className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-gray-500 text-lg">No batches found</p>
                    <p className="text-gray-400 text-sm mt-1">
                        {searchQuery || activeFilterCount > 0
                            ? 'Try adjusting your filters'
                            : 'Create a batch to get started'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredSections.map((section) => (
                        <BatchStudentSection
                            key={section.batch.id}
                            section={section}
                            searchQuery={searchQuery}
                            onToggle={() => toggleSection(section.batch.id!)}
                            onAddStudent={() => handleAddStudent(section.batch)}
                            onRemoveStudent={(student) =>
                                handleRemoveStudent(section.batch, student)
                            }
                            onToggleStatus={(userId, currentStatus) =>
                                handleToggleStudentStatus(
                                    section.batch.id!,
                                    userId,
                                    currentStatus
                                )
                            }
                        />
                    ))}
                </div>
            )}

            {/* Modals */}
            <StudentsFilterModal
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                exams={exams}
                allCourses={courses}
                allBatches={batches}
                initialSelectedExamIds={selectedExamIds}
                initialSelectedCourseIds={selectedCourseIds}
                initialSelectedBatchIds={selectedBatchIds}
                onApplyFilters={(e, c, b) => {
                    setSelectedExamIds(e);
                    setSelectedCourseIds(c);
                    setSelectedBatchIds(b);
                }}
            />

            {selectedBatchForAdd && (
                <AddStudentToBatchModal
                    isOpen={isAddStudentModalOpen}
                    onClose={() => {
                        setIsAddStudentModalOpen(false);
                        setSelectedBatchForAdd(null);
                    }}
                    batchId={selectedBatchForAdd.id!}
                    batchName={selectedBatchForAdd.displayName}
                    onStudentAdded={onStudentAdded}
                />
            )}

            {selectedStudentForRemove && (
                <RemoveStudentFromBatchModal
                    isOpen={isRemoveStudentModalOpen}
                    onClose={() => {
                        setIsRemoveStudentModalOpen(false);
                        setSelectedStudentForRemove(null);
                    }}
                    batchId={selectedStudentForRemove.batch.id!}
                    userId={selectedStudentForRemove.student.userId}
                    studentName={selectedStudentForRemove.student.name}
                    batchName={selectedStudentForRemove.batch.displayName}
                    onStudentRemoved={onStudentRemoved}
                />
            )}
        </div>
    );
}

/* -------------------- Batch Section Component -------------------- */

interface BatchStudentSectionProps {
    section: BatchSection;
    searchQuery: string;
    onToggle: () => void;
    onAddStudent: () => void;
    onRemoveStudent: (student: BatchStudent) => void;
    onToggleStatus: (userId: number, currentStatus: boolean) => void;
}

function BatchStudentSection({
    section,
    searchQuery,
    onToggle,
    onAddStudent,
    onRemoveStudent,
    onToggleStatus,
}: BatchStudentSectionProps) {
    const { batch, students, isExpanded } = section;

    const filteredStudents = searchQuery
        ? students.filter(
              (s) =>
                  s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  s.email.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : students;

    return (
        <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
            {/* Section Header */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4 flex-1">
                        <button
                            onClick={onToggle}
                            className="p-1 hover:bg-white/50 rounded transition-colors"
                        >
                            {isExpanded ? (
                                <ChevronUp className="h-5 w-5 text-gray-600" />
                            ) : (
                                <ChevronDown className="h-5 w-5 text-gray-600" />
                            )}
                        </button>

                        <div className="flex-1">
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {batch.displayName || 'Unnamed Batch'}
                                </h3>
                                <span className="text-sm font-mono text-gray-500 bg-white px-2 py-0.5 rounded">
                                    {batch.codeName}
                                </span>
                                {batch.courseName && (
                                    <span className="text-sm text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                        {batch.courseName}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                <div className="flex items-center">
                                    <Users className="h-4 w-4 mr-1" />
                                    <span>
                                        {students.length} student{students.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                                {batch.startDate && batch.endDate && (
                                    <span className="text-xs">
                                        {new Date(batch.startDate).toLocaleDateString()} -{' '}
                                        {new Date(batch.endDate).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={onAddStudent}
                        className="bg-purple-600 hover:bg-purple-700"
                        size="sm"
                    >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Student
                    </Button>
                </div>
            </div>

            {/* Students List */}
            {isExpanded && (
                <div className="divide-y">
                    {filteredStudents.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                            <p>
                                {searchQuery
                                    ? 'No students match your search'
                                    : 'No students enrolled in this batch'}
                            </p>
                            {!searchQuery && (
                                <Button
                                    onClick={onAddStudent}
                                    className="mt-3 bg-purple-600 hover:bg-purple-700"
                                    size="sm"
                                >
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Add First Student
                                </Button>
                            )}
                        </div>
                    ) : (
                        filteredStudents.map((student) => (
                            <StudentRow
                                key={student.id}
                                student={student}
                                onRemove={() => onRemoveStudent(student)}
                                onToggleStatus={() =>
                                    onToggleStatus(student.userId, student.isActive)
                                }
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

/* -------------------- Student Row Component -------------------- */

interface StudentRowProps {
    student: BatchStudent;
    onRemove: () => void;
    onToggleStatus: () => void;
}

function StudentRow({ student, onRemove, onToggleStatus }: StudentRowProps) {
    return (
        <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-4 flex-1">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-semibold">
                    {student.name.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900">{student.name}</h4>
                        <span
                            className={`px-2 py-0.5 text-xs rounded-full ${
                                student.isActive
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-600'
                            }`}
                        >
                            {student.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-sm text-gray-500">
                        <span>{student.email}</span>
                        {student.createdAt && (
                            <span className="text-xs">
                                Enrolled: {new Date(student.createdAt).toLocaleDateString()}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button
                    onClick={onToggleStatus}
                    variant="secondary"
                    size="sm"
                    className={
                        student.isActive
                            ? 'text-gray-600 hover:text-gray-700'
                            : 'text-green-600 hover:text-green-700'
                    }
                >
                    {student.isActive ? 'Deactivate' : 'Activate'}
                </Button>
                <Button
                    onClick={onRemove}
                    variant="secondary"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                    Remove
                </Button>
            </div>
        </div>
    );
}
