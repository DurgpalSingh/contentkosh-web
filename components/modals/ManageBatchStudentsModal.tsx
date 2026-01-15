'use client';

import { useState, useEffect } from 'react';
import { X, UserPlus, UserMinus, Search, Users } from 'lucide-react';
import { BatchUsersService } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AddStudentToBatchModal } from './AddStudentToBatchModal';
import { RemoveStudentFromBatchModal } from './RemoveStudentFromBatchModal';

interface ManageBatchStudentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    batchId: number;
    batchName?: string;
}

interface BatchStudent {
    id: number;
    userId: number;
    name: string;
    email: string;
    isActive: boolean;
    createdAt?: string;
}

export function ManageBatchStudentsModal({
    isOpen,
    onClose,
    batchId,
    batchName,
}: ManageBatchStudentsModalProps) {
    const [students, setStudents] = useState<BatchStudent[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<BatchStudent[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<BatchStudent | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchBatchStudents();
        }
    }, [isOpen, batchId]);

    useEffect(() => {
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            setFilteredStudents(
                students.filter(
                    (s) =>
                        s.name.toLowerCase().includes(query) ||
                        s.email.toLowerCase().includes(query)
                )
            );
        } else {
            setFilteredStudents(students);
        }
    }, [searchQuery, students]);

    const fetchBatchStudents = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await BatchUsersService.getApiBatchesUsers({ batchId });

            const batchStudents: BatchStudent[] = (response.data ?? []).map((bu) => ({
                id: bu.id!,
                userId: bu.user?.id!,
                name: bu.user?.name ?? 'Unknown',
                email: bu.user?.email ?? '',
                isActive: bu.isActive ?? true,
                createdAt: bu.createdAt,
            }));

            setStudents(batchStudents);
            setFilteredStudents(batchStudents);
        } catch (err: any) {
            console.error('Error fetching batch students:', err);
            setError('Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveClick = (student: BatchStudent) => {
        setSelectedStudent(student);
        setIsRemoveModalOpen(true);
    };

    const handleClose = () => {
        setSearchQuery('');
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={handleClose}
                />

                {/* Modal */}
                <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden max-h-[90vh] flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-500 to-purple-600">
                        <div>
                            <h2 className="text-xl font-semibold text-white">
                                Manage Batch Students
                            </h2>
                            {batchName && (
                                <p className="text-sm text-purple-100 mt-0.5">{batchName}</p>
                            )}
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-1 text-white/80 hover:text-white transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {/* Toolbar */}
                        <div className="flex gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                <Input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search students..."
                                    className="pl-10"
                                />
                            </div>
                            <Button
                                onClick={() => setIsAddModalOpen(true)}
                                className="bg-purple-600 hover:bg-purple-700"
                            >
                                <UserPlus className="h-4 w-4 mr-2" />
                                Add Student
                            </Button>
                        </div>

                        {/* Student List */}
                        {loading ? (
                            <div className="text-center py-12 text-gray-500">
                                Loading students...
                            </div>
                        ) : filteredStudents.length === 0 ? (
                            <div className="text-center py-12">
                                <Users className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                                <p className="text-gray-500">
                                    {searchQuery
                                        ? 'No students found matching your search'
                                        : 'No students enrolled in this batch'}
                                </p>
                                {!searchQuery && (
                                    <Button
                                        onClick={() => setIsAddModalOpen(true)}
                                        className="mt-4 bg-purple-600 hover:bg-purple-700"
                                    >
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Add First Student
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="border rounded-lg divide-y">
                                {filteredStudents.map((student) => (
                                    <div
                                        key={student.id}
                                        className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-medium text-gray-900">
                                                    {student.name}
                                                </h3>
                                                {!student.isActive && (
                                                    <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                                                        Inactive
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500">{student.email}</p>
                                            {student.createdAt && (
                                                <p className="text-xs text-gray-400 mt-1">
                                                    Enrolled:{' '}
                                                    {new Date(student.createdAt).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                        <Button
                                            variant="secondary"
                                            onClick={() => handleRemoveClick(student)}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <UserMinus className="h-4 w-4 mr-2" />
                                            Remove
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Summary */}
                        {!loading && students.length > 0 && (
                            <div className="text-sm text-gray-500 text-center pt-2">
                                Total: {students.length} student{students.length !== 1 ? 's' : ''}
                                {searchQuery && filteredStudents.length !== students.length && (
                                    <span>
                                        {' '}
                                        (showing {filteredStudents.length})
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end px-6 py-4 border-t border-gray-200 bg-gray-50">
                        <Button variant="secondary" onClick={handleClose}>
                            Close
                        </Button>
                    </div>
                </div>
            </div>

            {/* Sub-modals */}
            <AddStudentToBatchModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                batchId={batchId}
                batchName={batchName}
                onStudentAdded={fetchBatchStudents}
            />

            {selectedStudent && (
                <RemoveStudentFromBatchModal
                    isOpen={isRemoveModalOpen}
                    onClose={() => {
                        setIsRemoveModalOpen(false);
                        setSelectedStudent(null);
                    }}
                    batchId={batchId}
                    userId={selectedStudent.userId}
                    studentName={selectedStudent.name}
                    batchName={batchName}
                    onStudentRemoved={fetchBatchStudents}
                />
            )}
        </>
    );
}
