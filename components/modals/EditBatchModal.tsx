'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { BatchesService, UpdateBatchRequest, Batch } from '@/lib/api';
import { validateRequired, validateDateRange } from '@/lib/validation';
import { toISODateTime } from '@/lib/utils';

interface EditBatchModalProps {
    isOpen: boolean;
    onClose: () => void;
    batch: Batch;
    onBatchUpdated: () => void;
}

export function EditBatchModal({ isOpen, onClose, batch, onBatchUpdated }: EditBatchModalProps) {
    const [codeName, setCodeName] = useState(batch.codeName || '');
    const [displayName, setDisplayName] = useState(batch.displayName || '');
    const [startDate, setStartDate] = useState(batch.startDate?.split('T')[0] || '');
    const [endDate, setEndDate] = useState(batch.endDate?.split('T')[0] || '');
    const [isActive, setIsActive] = useState(batch.isActive ?? true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Update form when batch prop changes
    useEffect(() => {
        setCodeName(batch.codeName || '');
        setDisplayName(batch.displayName || '');
        setStartDate(batch.startDate?.split('T')[0] || '');
        setEndDate(batch.endDate?.split('T')[0] || '');
        setIsActive(batch.isActive ?? true);
        setError(null);
    }, [batch]);

    // Close modal on Escape key press
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationError =
            validateRequired(codeName, 'Batch code name') ||
            validateRequired(displayName, 'Display name') ||
            validateRequired(startDate, 'Start date') ||
            validateRequired(endDate, 'End date') ||
            validateDateRange(startDate, endDate) ||
            (!batch.id ? 'Batch ID is missing' : null);

        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const request: UpdateBatchRequest = {
                codeName: codeName.trim(),
                displayName: displayName.trim(),
                startDate: toISODateTime(startDate),
                endDate: toISODateTime(endDate),
                isActive,
            };

            await BatchesService.putApiBatches({ id: batch.id!, requestBody: request });

            onBatchUpdated();
            onClose();
        } catch (err: any) {
            console.error('Error updating batch:', err);
            setError(err.body?.message || 'Failed to update batch');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-500 to-purple-600">
                    <h2 className="text-xl font-semibold text-white">Edit Batch</h2>
                    <button
                        onClick={onClose}
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

                    <div>
                        <label htmlFor="edit-batch-code-name" className="block text-sm font-medium text-gray-700 mb-1">
                            Code Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="edit-batch-code-name"
                            type="text"
                            value={codeName}
                            onChange={(e) => setCodeName(e.target.value)}
                            placeholder="e.g., BATCH-2024-A"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label htmlFor="edit-batch-display-name" className="block text-sm font-medium text-gray-700 mb-1">
                            Display Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="edit-batch-display-name"
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="e.g., January 2024 Batch"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                            disabled={loading}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="edit-batch-start-date" className="block text-sm font-medium text-gray-700 mb-1">
                                Start Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="edit-batch-start-date"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label htmlFor="edit-batch-end-date" className="block text-sm font-medium text-gray-700 mb-1">
                                End Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="edit-batch-end-date"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="flex items-center">
                        <input
                            id="edit-batch-active"
                            type="checkbox"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                            disabled={loading}
                        />
                        <label htmlFor="edit-batch-active" className="ml-2 text-sm text-gray-700">
                            Active (visible to students)
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
