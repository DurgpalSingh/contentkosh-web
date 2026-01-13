'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { BatchesService, CreateBatchRequest, Subject } from '@/lib/api';
import { validateRequired } from '@/lib/validation';
import { DatePicker } from '@/components/ui/date-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { batchSchema } from '@/lib/schemas';

interface AddBatchModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseId: number;
    subjects?: Subject[]; // Inherited subjects from the course
    onBatchCreated: () => void;
}

export function AddBatchModal({ isOpen, onClose, courseId, subjects = [], onBatchCreated }: AddBatchModalProps) {
    const [codeName, setCodeName] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [isActive, setIsActive] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    // Reset form to initial state
    const resetForm = () => {
        setCodeName('');
        setDisplayName('');
        setStartDate(undefined);
        setEndDate(undefined);
        setIsActive(true);
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Zod validation
        const result = batchSchema.safeParse({
            codeName,
            displayName,
            startDate,
            endDate
        });

        if (!result.success) {
            setError(result.error.issues[0].message); // Fix: issues instead of errors
            return;
        }

        const data = result.data;

        setLoading(true);
        setError(null);

        try {
            // Ensure dates are in ISO format for the backend
            const isoStartDate = data.startDate.toISOString();
            const isoEndDate = data.endDate.toISOString();

            const request: CreateBatchRequest = {
                codeName: data.codeName,
                displayName: data.displayName,
                startDate: isoStartDate,
                endDate: isoEndDate,
                isActive,
                courseId,
            };

            await BatchesService.postApiBatches({ requestBody: request });

            // Reset form and notify parent
            resetForm();
            onBatchCreated();
            onClose();
        } catch (err: any) {
            console.error('Error creating batch:', err);
            setError(err.body?.message || 'Failed to create batch');
        } finally {
            setLoading(false);
        }
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
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-500 to-purple-600">
                    <h2 className="text-xl font-semibold text-white">Add New Batch</h2>
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

                    <div>
                        <Label htmlFor="batch-code-name" className="mb-1 block">
                            Code Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="batch-code-name"
                            type="text"
                            value={codeName}
                            onChange={(e) => setCodeName(e.target.value)}
                            placeholder="e.g., BATCH-2024-A"
                            className="focus-visible:ring-purple-500"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <Label htmlFor="batch-display-name" className="mb-1 block">
                            Display Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="batch-display-name"
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="e.g., January 2024 Batch"
                            className="focus-visible:ring-purple-500"
                            disabled={loading}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="mb-1 block">
                                Start Date <span className="text-red-500">*</span>
                            </Label>
                            <DatePicker
                                date={startDate}
                                setDate={setStartDate}
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <Label className="mb-1 block">
                                End Date <span className="text-red-500">*</span>
                            </Label>
                            <DatePicker
                                date={endDate}
                                setDate={setEndDate}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            id="batch-active"
                            type="checkbox"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                            disabled={loading}
                        />
                        <Label htmlFor="batch-active" className="font-normal">
                            Active (visible to students)
                        </Label>
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
                            className="bg-purple-600 hover:bg-purple-700"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Creating...
                                </>
                            ) : (
                                'Create Batch'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
