'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { ExamsService, CreateExamRequest } from '@/lib/api';
import { validateEntityName, validateDateRange } from '@/lib/validation';
import { toISODateTime } from '@/lib/utils';
import { DatePicker } from '../ui/date-picker';

interface AddExamModalProps {
    isOpen: boolean;
    onClose: () => void;
    businessId: number;
    onExamCreated: () => void;
}

export function AddExamModal({ isOpen, onClose, businessId, onExamCreated }: AddExamModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [code, setCode] = useState('');
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
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

            await ExamsService.postApiBusinessExams({ businessId, requestBody: request });

            // Reset form and notify parent
            resetForm();
            onExamCreated();
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
                    <button
                        onClick={handleClose}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
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
                        <label htmlFor="exam-name" className="block text-sm font-medium text-gray-700 mb-1">
                            Exam Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="exam-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., UPSC Civil Services"
                            maxLength={50}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            disabled={loading}
                            required
                        />
                        <p className="mt-1 text-xs text-gray-500">{name.length}/50 characters</p>
                    </div>

                    <div>
                        <label htmlFor="code-name" className="block text-sm font-medium text-gray-700 mb-1">
                            Code Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="code-name"
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="e.g., UPSC"
                            maxLength={20}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            disabled={loading}
                            required
                        />
                        <p className="mt-1 text-xs text-gray-500">{code.length}/20 characters</p>
                    </div>

                    <div>
                        <label htmlFor="exam-description" className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            id="exam-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description of the exam..."
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                            disabled={loading}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="exam-start-date" className="block text-sm font-medium text-gray-700 mb-1">
                                Start date
                            </label>
                            <DatePicker date={startDate} setDate={setStartDate} disabled={loading} />
                        </div>
                        <div>
                            <label htmlFor="exam-end-date" className="block text-sm font-medium text-gray-700 mb-1">
                                End date
                            </label>
                            <DatePicker date={endDate} setDate={setEndDate} disabled={loading} />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
                                'Create Exam'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
