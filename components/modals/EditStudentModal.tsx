'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { BusinessUsersService, UpdateBusinessUserRequest } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

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

interface EditStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: StudentData;
    onStudentUpdated: () => void;
}

export function EditStudentModal({ isOpen, onClose, student, onStudentUpdated }: EditStudentModalProps) {
    const [isActive, setIsActive] = useState(student.isActive);
    const [role, setRole] = useState(student.role);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setIsActive(student.isActive);
            setRole(student.role);
            setError(null);
        }
    }, [isOpen, student]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const request: UpdateBusinessUserRequest = {
                role: role as 'STUDENT' | 'TEACHER' | 'ADMIN' | 'SUPERADMIN',
                isActive,
            };

            await BusinessUsersService.putApiUsersBusinessUsers(student.id, request);

            onStudentUpdated();
            onClose();
        } catch (err: unknown) {
            console.error('Error updating student:', err);
            const error = err as { body?: { message?: string } };
            setError(error.body?.message || 'Failed to update student');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setError(null);
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
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-500 to-green-600">
                    <h2 className="text-xl font-semibold text-white">Edit Student</h2>
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

                    {/* Student Info (Read-only) */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">{student.name}</h3>
                        <p className="text-sm text-gray-600">{student.email}</p>
                        {student.phone && (
                            <p className="text-sm text-gray-600">{student.phone}</p>
                        )}
                    </div>

                    {/* Role Selection */}
                    <div>
                        <Label htmlFor="role" className="mb-1 block">
                            Role <span className="text-red-500">*</span>
                        </Label>
                        <select
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            disabled={loading}
                        >
                            <option value="STUDENT">Student</option>
                            <option value="TEACHER">Teacher</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>

                    {/* Status Toggle */}
                    <div className="flex items-center space-x-2">
                        <input
                            id="isActive"
                            type="checkbox"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            disabled={loading}
                        />
                        <Label htmlFor="isActive" className="font-normal">
                            Active (can access the system)
                        </Label>
                    </div>

                    {/* Batch Information (Read-only) */}
                    {student.batches.length > 0 && (
                        <div>
                            <Label className="mb-2 block">Current Batch Enrollments</Label>
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                                {student.batches.map((batch, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                                    >
                                        <div>
                                            <span className="font-medium">{batch.batchName}</span>
                                            <span className="text-gray-500 ml-2">({batch.courseName})</span>
                                        </div>
                                        <span
                                            className={`px-2 py-1 text-xs rounded-full ${
                                                batch.isActive
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-600'
                                            }`}
                                        >
                                            {batch.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

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
                            className="bg-green-600 hover:bg-green-700"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Updating...
                                </>
                            ) : (
                                'Update Student'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}