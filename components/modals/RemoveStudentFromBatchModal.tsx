'use client';

import { useState } from 'react';
import { X, UserMinus } from 'lucide-react';
import { BatchUsersService, RemoveUserFromBatchRequest } from '@/lib/api';
import { Button } from '@/components/ui/button';

interface RemoveStudentFromBatchModalProps {
    isOpen: boolean;
    onClose: () => void;
    batchId: number;
    userId: number;
    studentName?: string;
    batchName?: string;
    onStudentRemoved: () => void;
}

export function RemoveStudentFromBatchModal({
    isOpen,
    onClose,
    batchId,
    userId,
    studentName,
    batchName,
    onStudentRemoved,
}: RemoveStudentFromBatchModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleConfirm = async () => {
        setLoading(true);
        setError(null);

        try {
            const request: RemoveUserFromBatchRequest = {
                userId,
                batchId,
            };

            await BatchUsersService.postApiBatchesRemoveUser(request);

            onStudentRemoved();
            onClose();
        } catch (err: any) {
            console.error('Error removing student from batch:', err);
            setError(err.body?.message || 'Failed to remove student from batch');
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
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-red-500 to-red-600">
                    <h2 className="text-xl font-semibold text-white">Remove Student</h2>
                    <button
                        onClick={handleClose}
                        className="p-1 text-white/80 hover:text-white transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                            <UserMinus className="h-6 w-6 text-red-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Remove Student from Batch?
                        </h3>
                        <p className="text-sm text-gray-500">
                            Are you sure you want to remove{' '}
                            <span className="font-semibold text-gray-700">
                                {studentName || 'this student'}
                            </span>
                            {batchName && (
                                <>
                                    {' '}
                                    from{' '}
                                    <span className="font-semibold text-gray-700">
                                        {batchName}
                                    </span>
                                </>
                            )}
                            ? This action cannot be undone.
                        </p>
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
                            type="button"
                            onClick={handleConfirm}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={loading}
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
                                    Removing...
                                </>
                            ) : (
                                <>
                                    <UserMinus className="h-4 w-4 mr-2" />
                                    Remove Student
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
