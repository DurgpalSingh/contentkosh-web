'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { ExamsService, UpdateExamRequest, Exam } from '@/lib/api';
import { validateEntityName } from '@/lib/validation';

interface EditExamModalProps {
    isOpen: boolean;
    onClose: () => void;
    exam: Exam;
    onExamUpdated: () => void;
}

export function EditExamModal({ isOpen, onClose, exam, onExamUpdated }: EditExamModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Populate form with exam data when modal opens
    useEffect(() => {
        if (isOpen && exam) {
            setName(exam.name || '');
            setDescription(exam.description || '');
            setIsActive(exam.isActive ?? true);
        }
    }, [isOpen, exam]);

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

        const validationError = validateEntityName(name, 'Exam name');
        if (validationError) {
            setError(validationError);
            return;
        }

        if (!exam.id) {
            setError('Invalid exam');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const request: UpdateExamRequest = {
                name: name.trim(),
                description: description.trim() || undefined,
                isActive,
            };

            await ExamsService.putApiBusinessExams({ businessId: exam.businessId, id: exam.id, requestBody: request });

            // Notify parent and close
            onExamUpdated();
            onClose();
        } catch (err: any) {
            console.error('Error updating exam:', err);
            setError(err.body?.message || 'Failed to update exam');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setError(null);
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
                    <h2 className="text-xl font-semibold text-gray-900">Edit Exam</h2>
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
                        <label htmlFor="edit-exam-name" className="block text-sm font-medium text-gray-700 mb-1">
                            Exam Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="edit-exam-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., UPSC Civil Services"
                            maxLength={50}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            disabled={loading}
                        />
                        <p className="mt-1 text-xs text-gray-500">{name.length}/50 characters</p>
                    </div>

                    <div>
                        <label htmlFor="edit-exam-description" className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            id="edit-exam-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description of the exam..."
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                            disabled={loading}
                        />
                    </div>

                    <div className="flex items-center">
                        <input
                            id="edit-exam-active"
                            type="checkbox"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            disabled={loading}
                        />
                        <label htmlFor="edit-exam-active" className="ml-2 text-sm text-gray-700">
                            Active (visible to students)
                        </label>
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
