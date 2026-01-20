'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
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
    batches: Array<Batch>;
}

export default function StudentsPage() {
    const { business, isAuthenticated, isLoading, isInitialized } = useAuthStore();
    const searchParams = useSearchParams();
    const batchIdFromUrl = searchParams.get('batchId');

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
            // 1. Fetch exams → courses
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

            // 2. Fetch batches WITH batchUsers
            const batchRequests = courses.map((course) =>
                BatchesService.getApiBatchesCourse({
                    courseId: course.id!,
                    include: 'batchUsers',
                }).then((res) =>
                    (res.data ?? []).map((batch) => ({
                        ...batch,
                        courseId: course.id!,
                        examId: course.examId,
                        courseName: course.name,
                    }))
                )
            );

            const batchResponses = await Promise.all(batchRequests);
            const allBatches: ExtendedBatch[] = batchResponses.flat();
            setBatches(allBatches);

            // 3. Fetch all students (business users)
            const studentsResponse =
                await BusinessUsersService.getApiUsersBusinessUsers(
                    business.id,
                    'STUDENT'
                );

            const businessUsers = studentsResponse.data ?? [];

            // 4. Create a map of students
            const studentMap = new Map<number, StudentData>();

            for (const user of businessUsers) {
                if (!user?.id) continue;

                studentMap.set(user.id, {
                    id: user.id,
                    userId: user.id,
                    name: user.name ?? 'Unknown',
                    email: user.email ?? '',
                    phone: user.mobile ?? 'Not Provided',
                    isActive: user.status === 'ACTIVE',
                    role: user.role ?? 'STUDENT',
                    createdAt: user.createdAt,
                    batches: [],
                });
            }

            // 5. Attach batches to students using batchUsers
            for (const batch of allBatches) {
                for (const batchUser of batch.batchUsers ?? []) {
                    if (!batchUser.userId) continue;
                    const student = studentMap.get(batchUser.userId);
                    if (!student) continue;

                    student.batches.push({
                        batchId: batch.id!,
                        batchName: batch.displayName ?? 'Unknown Batch',
                        batchCode: batch.codeName ?? '',
                        courseName: batch.courseName ?? 'Unknown Course',
                        enrolledAt: batchUser.createdAt ?? '',
                        isActive: batchUser.isActive ?? true,
                        feeStatus: 'Paid',
                    });
                }
            }

            // 6. Final list
            setStudents(Array.from(studentMap.values()));
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

    // Auto-filter by batch from URL params
    useEffect(() => {
        if (batchIdFromUrl && batches.length > 0) {
            const targetBatch = batches.find(batch => batch.id === parseInt(batchIdFromUrl));
            if (targetBatch) {
                setSelectedBatch(targetBatch.displayName || 'Unknown Batch');
            }
        }
    }, [batchIdFromUrl, batches]);

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
            // If student has batches, show confirmation for which batch to remove from
            if (selectedStudent.batches.length > 1) {
                console.log('This student is in multiple batches. Use the Edit option to remove from specific batches.');
                setIsDeleteModalOpen(false);
                setSelectedStudent(null);
                return;
            }

            if (selectedStudent.batches.length === 1) {
                // Remove from the single batch
                await BatchUsersService.postApiBatchesRemoveUser({
                    userId: selectedStudent.userId,
                    batchId: selectedStudent.batches[0].batchId,
                });
            }

            await fetchData();
            setIsDeleteModalOpen(false);
            setSelectedStudent(null);
        } catch (err) {
            console.error('Error removing student from batch:', err);
            alert('Failed to remove student from batch');
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
                    batches={batches}
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
                            allBatches={batches}
                            onStudentUpdated={fetchData}
                        />}

                        {isDeleteModalOpen && <DeleteConfirmModal
                            isOpen={isDeleteModalOpen}
                            onClose={() => {
                                setIsDeleteModalOpen(false);
                                setSelectedStudent(null);
                            }}
                            onConfirm={confirmDeleteStudent}
                            title="Remove Student from Batch"
                            message="Are you sure you want to remove this student from their batch(es)?"
                            itemName={selectedStudent.name}
                        />}
                    </div>
                )}
            </div>
        </div>
    );
}