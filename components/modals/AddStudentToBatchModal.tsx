'use client';

import { useState, useEffect } from 'react';
import { X, Search, UserPlus } from 'lucide-react';
import { BatchUsersService, BusinessUsersService, AddUserToBatchRequest } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/useAuthStore';

interface AddStudentToBatchModalProps {
    isOpen: boolean;
    onClose: () => void;
    batchId: number;
    batchName?: string;
    onStudentAdded: () => void;
}

interface Student {
    id: number;
    name: string;
    email: string;
    userId: number;
}

export function AddStudentToBatchModal({
    isOpen,
    onClose,
    batchId,
    batchName,
    onStudentAdded,
}: AddStudentToBatchModalProps) {
    const { business } = useAuthStore();
    const [students, setStudents] = useState<Student[]>([]);
    const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [fetchingStudents, setFetchingStudents] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && business?.id) {
            fetchAvailableStudents();
        }
    }, [isOpen, business?.id]);

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

    const fetchAvailableStudents = async () => {
        if (!business?.id) return;

        setFetchingStudents(true);
        setError(null);

        try {
            // Get all students in the business
            const businessUsersResponse = await BusinessUsersService.getApiUsersBusinessUsers(
                business.id,
                'STUDENT'
            );

            const allStudents = (businessUsersResponse.data ?? []).map((bu) => ({
                id: bu.id!,
                name: bu.user?.name ?? 'Unknown',
                email: bu.user?.email ?? '',
                userId: bu.user?.id!,
            }));

            // Get students already in this batch
            const batchUsersResponse = await BatchUsersService.getApiBatchesUsers({
                batchId,
            });

            const enrolledUserIds = new Set(
                (batchUsersResponse.data ?? []).map((bu) => bu.user?.id).filter(Boolean)
            );

            // Filter out students already in the batch
            const availableStudents = allStudents.filter(
                (s) => !enrolledUserIds.has(s.userId)
            );

            setStudents(availableStudents);
            setFilteredStudents(availableStudents);
        } catch (err: any) {
            console.error('Error fetching students:', err);
            setError('Failed to load students');
        } finally {
            setFetchingStudents(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedStudentId) {
            setError('Please select a student');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const student = students.find((s) => s.id === selectedStudentId);
            if (!student) {
                setError('Student not found');
                return;
            }

            const request: AddUserToBatchRequest = {
                userId: student.userId,
                batchId,
            };

            await BatchUsersService.postApiBatchesAddUser({ requestBody: request });

            resetForm();
            onStudentAdded();
            onClose();
        } catch (err: any) {
            console.error('Error adding student to batch:', err);
            setError(err.body?.message || 'Failed to add student to batch');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setSearchQuery('');
        setSelectedStudentId(null);
        setError(null);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600">
                    <div>
                        <h2 className="text-xl font-semibold text-white">Add Student to Batch</h2>
                        {batchName && (
                            <p className="text-sm text-blue-100 mt-0.5">{batchName}</p>
                        )}
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-1 text-white/80 hover:text-white transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Search */}
                    <div>
                        <Label htmlFor="student-search" className="mb-1 block">
                            Search Students
                        </Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                            <Input
                                id="student-search"
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name or email..."
                                className="pl-10"
                                disabled={loading || fetchingStudents}
                            />
                        </div>
                    </div>

                    {/* Student List */}
                    <div>
                        <Label className="mb-2 block">
                            Available Students <span className="text-red-500">*</span>
                        </Label>
                        <div className="border rounded-lg max-h-64 overflow-y-auto">
                            {fetchingStudents ? (
                                <div className="p-4 text-center text-gray-500">
                                    Loading students...
                                </div>
                            ) : filteredStudents.length === 0 ? (
                                <div className="p-4 text-center text-gray-500">
                                    {searchQuery
                                        ? 'No students found matching your search'
                                        : 'No available students to add'}
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {filteredStudents.map((student) => (
                                        <label
                                            key={student.id}
                                            className={`flex items-center p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                                                selectedStudentId === student.id
                                                    ? 'bg-blue-50'
                                                    : ''
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="student"
                                                value={student.id}
                                                checked={selectedStudentId === student.id}
                                                onChange={() => setSelectedStudentId(student.id)}
                                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                disabled={loading}
                                            />
                                            <div className="ml-3 flex-1">
                                                <div className="font-medium text-gray-900">
                                                    {student.name}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {student.email}
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700"
                            disabled={loading || !selectedStudentId}
                        >
                            {loading ? (
                                <>
                                    <svg
                                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Add Student
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
