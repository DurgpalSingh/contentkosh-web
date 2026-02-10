'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ExamsService, CreateExamRequest } from '@/lib/api';
import { validateEntityName, validateDateRange } from '@/lib/validation';
import { toISODateTime } from '@/lib/utils';

interface AddExamModalProps {
    isOpen: boolean;
    onClose: () => void;
    businessId: number;
    onExamCreated: () => void;
}

export function AddExamModal({
    isOpen,
    onClose,
    businessId,
    onExamCreated,
}: AddExamModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [code, setCode] = useState('');
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const resetForm = () => {
        setName('');
        setDescription('');
        setCode('');
        setStartDate(undefined);
        setEndDate(undefined);
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationError = validateEntityName(name, 'Exam name');
        if (validationError) {
            setError(validationError);
            return;
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);

            if (start < today) {
                setError('Start Date cannot be in the past');
                return;
            }
        }

        const dateError = validateDateRange(
            toISODateTime(startDate) || '',
            toISODateTime(endDate) || ''
        );
        if (dateError) {
            setError(dateError);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const request: CreateExamRequest = {
                name: name.trim(),
                description: description.trim() || undefined,
                code: code.trim() || undefined,
                startDate: toISODateTime(startDate),
                endDate: toISODateTime(endDate),
                businessId,
            };

            await ExamsService.postApiBusinessExams(businessId, request);

            resetForm();
            onExamCreated();
            toast.success('Exam created successfully');
            onClose();
        } catch (err: any) {
            console.error('Error creating exam:', err);
            setError(err.body?.message || 'Failed to create exam');
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
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Add New Exam</h2>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100"
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
                            htmlFor="exam-name"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Exam Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="exam-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., UPSC Civil Services"
                            maxLength={50}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors focus-visible:ring-blue-500 focus-visible:ring-offset-1"
                            disabled={loading}
                        />
                        <p className="mt-1 text-xs text-gray-500">{name.length}/50 characters</p>
                    </div>

                    <div className="space-y-1.5">
                        <label
                            htmlFor="code-name"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Code Name
                        </label>
                        <input
                            id="code-name"
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="e.g., UPSC"
                            maxLength={20}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors focus-visible:ring-blue-500 focus-visible:ring-offset-1"
                            disabled={loading}
                        />
                        <p className="mt-1 text-xs text-gray-500">{code.length}/20 characters</p>
                    </div>

                    <div className="space-y-1.5">
                        <label
                            htmlFor="exam-description"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Description
                        </label>
                        <textarea
                            id="exam-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description of the exam..."
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none focus-visible:ring-blue-500 focus-visible:ring-offset-1"
                            disabled={loading}
                        />
                    </div>


                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
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
                                    Creating...
                                </>
                            ) : (
                                'Create Exam'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}