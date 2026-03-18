'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BatchesService, UpdateBatchRequest, Batch } from '@/lib/api';
import { validateRequired, validateDateRange } from '@/lib/validation';
import { toISODateTime } from '@/lib/utils';
import { toast } from 'sonner';

interface EditBatchModalProps {
    isOpen: boolean;
    onClose: () => void;
    batch: Batch;
    onBatchUpdated: () => void;
}

export function EditBatchModal({
    isOpen,
    onClose,
    batch,
    onBatchUpdated,
}: EditBatchModalProps) {
    const [codeName, setCodeName] = useState(batch.codeName || '');
    const [displayName, setDisplayName] = useState(batch.displayName || '');
    const [startDate, setStartDate] = useState(batch.startDate?.split('T')[0] || '');
    const [endDate, setEndDate] = useState(batch.endDate?.split('T')[0] || '');
    const [isActive, setIsActive] = useState(batch.isActive ?? true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setCodeName(batch.codeName || '');
        setDisplayName(batch.displayName || '');
        setStartDate(batch.startDate?.split('T')[0] || '');
        setEndDate(batch.endDate?.split('T')[0] || '');
        setIsActive(batch.isActive ?? true);
        setError(null);
    }, [batch]);

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

            await BatchesService.putApiBatches(
                batch.id!,
                request,
            );

            onBatchUpdated();
            onClose();
            toast.success('Batch updated successfully');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error('Error updating batch:', err);
            setError(err.body?.message || 'Failed to update batch');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-y-auto max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
                    <h2 className="text-xl font-semibold text-white">Edit Batch</h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="text-white/80 hover:text-white hover:bg-white/20"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label
                            htmlFor="edit-batch-code-name"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Code Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="edit-batch-code-name"
                            type="text"
                            value={codeName}
                            onChange={(e) => setCodeName(e.target.value)}
                            placeholder="e.g., BATCH-2024-A"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors focus-visible:ring-blue-500 focus-visible:ring-offset-1"
                            disabled={loading}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label
                            htmlFor="edit-batch-display-name"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Display Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="edit-batch-display-name"
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="e.g., January 2024 Batch"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors focus-visible:ring-blue-500 focus-visible:ring-offset-1"
                            disabled={loading}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label
                                htmlFor="edit-batch-start-date"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Start Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="edit-batch-start-date"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors focus-visible:ring-blue-500 focus-visible:ring-offset-1"
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label
                                htmlFor="edit-batch-end-date"
                                className="block text-sm font-medium text-gray-700"
                            >
                                End Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="edit-batch-end-date"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors focus-visible:ring-blue-500 focus-visible:ring-offset-1"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            id="edit-batch-active"
                            type="checkbox"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            disabled={loading}
                        />
                        <label htmlFor="edit-batch-active" className="text-sm text-gray-700">
                            Active (visible to students)
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
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
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
