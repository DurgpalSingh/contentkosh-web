'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
    ExamsService,
    BatchesService,
    BatchUsersService,
    BusinessUsersService,
} from '@/lib/api';
import type { Exam, Course, Batch } from '@/lib/api';

// Components
import { StudentsHeader } from '@/components/dashboard/students/StudentsHeader';
import { StudentsFilterModal } from '@/components/dashboard/students/StudentsFilterModal';
import { StudentsList } from '@/components/dashboard/students/StudentsList';

// Modals
import { AddNewStudentModal } from '@/components/modals/AddNewStudentModal';
import { StudentDetailsModal } from '@/components/modals/StudentDetailsModal';
import { EditStudentModal } from '@/components/modals/EditStudentModal';
import { DeleteConfirmModal } from '@/components/modals/DeleteConfirmModal';

interface ExtendedBatch extends Batch {
    courseId?: number;
    examId?: number;
    courseName?: string;
}

interface StudentData {
    id: number;
    userId: number;
    name: string;
    email: string;
    phone?: string;
    isActive: boolean;
    role: string;
    createdAt?: string;
    batches: Array<{
        batchId: number;
        batchName: string;
        batchCode: string;
        courseName: string;
        enrolledAt: string;
        isActive: boolean;
        feeStatus: 'Paid' | 'Pending' | 'Partial' | 'Overdue';
    }>;
}

export default function StudentsPage() {
    const { business, isAuthenticated, isLoading, isInitialized } = useAuthStore();

    const [students, setStudents] = useState<StudentData[]>([]);
    const [batches, setBatches] = useState<ExtendedBatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBatch, setSelectedBatch] = useState<string>('All Batches');
    const [selectedStatus, setSelectedStatus] = useState<string>('All Status');
    const [expandedStudent, setExpandedStudent] = useState<number | null>(null);

    const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);

    const fetchData = useCallback(async () => {
        if (!business?.id) return;

        setLoading(true);
        setError(null);

        try {
            const examsResponse = await ExamsService.getApiBusinessExams({
                businessId: business.id,
                include: 'courses',
            });

            const exams: Exam[] = examsResponse.data ?? [];
            const courses: Course[] = exams.flatMap((exam) =>
                (exam.courses ?? []).map((course) => ({
                    ...course,
                    examId: exam.id,
                    examName: exam.name,
                }))
            );

            const batchRequests = courses.map((course) =>
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

            const batchResponses = await Promise.all(batchRequests);
            const allBatches = batchResponses.flat();
            setBatches(allBatches);

            const studentsResponse = await BusinessUsersService.getApiUsersBusinessUsers(
                business.id,
                'STUDENT'
            );

            console.log(studentsResponse.data);

            const businessUsers = studentsResponse.data ?? [];

            const studentsWithBatches = await Promise.all(
                businessUsers.map(async (businessUser) => {
                    const userId = businessUser.user?.id;
                    if (!userId) return null;

                    const userBatchesResponse = await BatchUsersService.getApiBatchesUser({
                        userId,
                    });
                    console.log("users details", userBatchesResponse.data);

                    const userBatches = (userBatchesResponse.data ?? []).map((batchUser) => {
                        const batch = allBatches.find((b) => b.id === batchUser.batch?.id);
                        return {
                            batchId: batchUser.batch?.id ?? 0,
                            batchName: batchUser.batch?.displayName ?? 'Unknown Batch',
                            batchCode: batchUser.batch?.codeName ?? '',
                            courseName: batch?.courseName ?? 'Unknown Course',
                            enrolledAt: batchUser.createdAt ?? '',
                            isActive: batchUser.isActive ?? true,
                            feeStatus: 'Paid' as const,
                        };
                    });

                    return {
                        id: businessUser.id!,
                        userId: businessUser.user?.id ?? 0,
                        name: businessUser.user?.name ?? 'Unknown',
                        email: businessUser.user?.email ?? '',
                        phone: '+91 98765 43210',
                        isActive: businessUser.isActive ?? true,
                        role: businessUser.role ?? 'STUDENT',
                        createdAt: businessUser.createdAt,
                        batches: userBatches,
                    };
                })
            );

            const validStudents = studentsWithBatches.filter(Boolean) as StudentData[];
            setStudents(validStudents);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load students');
        } finally {
            setLoading(false);
        }
    }, [business?.id]);

    useEffect(() => {
        if (isAuthenticated && business?.id) {
            fetchData();
        }
    }, [isAuthenticated, business?.id, fetchData]);

    const filteredStudents = students.filter((student) => {
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesName = student.name.toLowerCase().includes(query);
            const matchesEmail = student.email.toLowerCase().includes(query);
            const matchesBatch = student.batches.some(
                (batch) =>
                    batch.batchName.toLowerCase().includes(query) ||
                    batch.batchCode.toLowerCase().includes(query)
            );
            if (!matchesName && !matchesEmail && !matchesBatch) return false;
        }

        if (selectedBatch !== 'All Batches') {
            const hasSelectedBatch = student.batches.some(
                (batch) => batch.batchName === selectedBatch
            );
            if (!hasSelectedBatch) return false;
        }

        if (selectedStatus !== 'All Status') {
            if (selectedStatus === 'Active' && !student.isActive) return false;
            if (selectedStatus === 'Inactive' && student.isActive) return false;
        }

        return true;
    });

    const handleStudentClick = (studentId: number) => {
        setExpandedStudent(expandedStudent === studentId ? null : studentId);
    };

    const handleViewDetails = (student: StudentData) => {
        setSelectedStudent(student);
        setIsDetailsModalOpen(true);
    };

    const handleEditStudent = (student: StudentData) => {
        setSelectedStudent(student);
        setIsEditModalOpen(true);
    };

    const handleDeleteStudent = (student: StudentData) => {
        setSelectedStudent(student);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteStudent = async () => {
        if (!selectedStudent) return;
        
        try {
            await BusinessUsersService.deleteApiUsersBusinessUsers(selectedStudent.id);
            await fetchData();
            setIsDeleteModalOpen(false);
            setSelectedStudent(null);
        } catch (err) {
            console.error('Error deleting student:', err);
            alert('Failed to delete student');
        }
    };

    if (!isInitialized || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!isAuthenticated) return null;

    const batchOptions = ['All Batches', ...Array.from(new Set(batches.map(b => b.displayName || 'Unnamed Batch')))];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto p-6">
                <StudentsHeader
                    totalStudents={filteredStudents.length}
                    onAddStudent={() => setIsAddStudentModalOpen(true)}
                />

                <StudentsFilterModal
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    selectedBatch={selectedBatch}
                    onBatchChange={setSelectedBatch}
                    selectedStatus={selectedStatus}
                    onStatusChange={setSelectedStatus}
                    batchOptions={batchOptions}
                />

                <StudentsList
                    students={filteredStudents}
                    loading={loading}
                    error={error}
                    expandedStudent={expandedStudent}
                    onStudentClick={handleStudentClick}
                    onViewDetails={handleViewDetails}
                    onEditStudent={handleEditStudent}
                    onDeleteStudent={handleDeleteStudent}
                />

                <AddNewStudentModal
                    isOpen={isAddStudentModalOpen}
                    onClose={() => setIsAddStudentModalOpen(false)}
                    onStudentAdded={fetchData}
                />

                {selectedStudent && (
                    <div>
                        {isDetailsModalOpen && <StudentDetailsModal
                            isOpen={isDetailsModalOpen}
                            onClose={() => {
                                setIsDetailsModalOpen(false);
                                setSelectedStudent(null);
                            }}
                            student={selectedStudent}
                        />}

                       {isEditModalOpen && <EditStudentModal
                            isOpen={isEditModalOpen}
                            onClose={() => {
                                setIsEditModalOpen(false);
                                setSelectedStudent(null);
                            }}
                            student={selectedStudent}
                            onStudentUpdated={fetchData}
                        />}

                        {isDeleteModalOpen&& <DeleteConfirmModal
                            isOpen={isDeleteModalOpen}
                            onClose={() => {
                                setIsDeleteModalOpen(false);
                                setSelectedStudent(null);
                            }}
                            onConfirm={confirmDeleteStudent}
                            title="Delete Student"
                            message="Are you sure you want to delete this student? This will remove them from all batches."
                            itemName={selectedStudent.name}
                        />}
                    </div>
                )}
            </div>
        </div>
    );
}