'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { AddExamModal } from '@/components/modals/AddExamModal';
import { EditExamModal } from '@/components/modals/EditExamModal';
import { DeleteConfirmModal } from '@/components/modals/DeleteConfirmModal';
import { ExamsService, Exam } from '@/lib/api';
import { Plus, BookOpen } from 'lucide-react';
import { ExamGridCard } from '@/components/dashboard/exams/ExamGridCard';

export default function ExamsPage() {
    const { user, business, isAuthenticated, isLoading, isInitialized } = useAuthStore();
    const router = useRouter();

    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal states
    const [isAddExamModalOpen, setIsAddExamModalOpen] = useState(false);
    const [isEditExamModalOpen, setIsEditExamModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

    const fetchExams = useCallback(async () => {
        if (!business?.id || typeof business.id !== 'number') {
            console.warn('Cannot fetch exams: Invalid business ID', business);
            return;
        }

        try {
            setLoading(true);
            const response = await ExamsService.getApiBusinessExams(business.id);
            const examsList = response?.data || [];
            const sortedExams = [...examsList].sort(
                (a, b) =>
                    new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
            );
            setExams(sortedExams);
            setError(null);
        } catch (err: any) {
            console.error('Error fetching exams:', err);
            setError('Failed to load exams. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [business?.id]);

    useEffect(() => {
        if (isAuthenticated && business?.id) {
            fetchExams();
        }
    }, [isAuthenticated, business?.id, fetchExams]);

    const handleEditExam = (exam: Exam) => {
        setSelectedExam(exam);
        setIsEditExamModalOpen(true);
    };

    const handleDeleteExam = (exam: Exam) => {
        setSelectedExam(exam);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteExam = async () => {
        if (!selectedExam?.id || !business?.id) return;
        try {
            await ExamsService.deleteApiBusinessExams(business.id, selectedExam.id);
            await fetchExams();
            setIsDeleteModalOpen(false);
            setSelectedExam(null);
        } catch (err) {
            console.error('Error deleting exam:', err);
        }
    };

    const handleViewCourses = (exam: Exam) => {
        router.push(`/dashboard/courses?examId=${exam.id}`);
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
                        <h1 className="text-3xl font-bold text-gray-900">Exams</h1>
                        <p className="text-gray-600 mt-1">Manage your exams and their details</p>
                    </div>
                    <Button
                        onClick={() => setIsAddExamModalOpen(true)}
                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Add Exam
                    </Button>
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
                ) : exams.length === 0 ? (
                    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-4">
                            <BookOpen className="h-6 w-6 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No exams created</h3>
                        <p className="text-gray-500 mb-6">Get started by creating your first exam.</p>
                        <Button
                            onClick={() => setIsAddExamModalOpen(true)}
                            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Create Exam
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {exams.map((exam) => (
                            <ExamGridCard
                                key={exam.id}
                                exam={exam}
                                onViewCourses={handleViewCourses}
                                onEdit={handleEditExam}
                                onDelete={handleDeleteExam}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Modals */}
            {business?.id && isAddExamModalOpen && (
                <AddExamModal
                    isOpen={isAddExamModalOpen}
                    onClose={() => setIsAddExamModalOpen(false)}
                    businessId={business.id}
                    onExamCreated={fetchExams}
                />
            )}

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
        </>
    );
}