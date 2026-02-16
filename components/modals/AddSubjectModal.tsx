'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SubjectsService, CreateSubjectRequest } from '@/lib/api';
import { validateEntityName } from '@/lib/validation';

interface AddSubjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    examId: number;
    courseId: number;
    onSubjectCreated: () => void;
}

export function AddSubjectModal({
    isOpen,
    onClose,
    examId,
    courseId,
    onSubjectCreated,
}: AddSubjectModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isActive, setIsActive] = useState(true);
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
        setIsActive(true);
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationError = validateEntityName(name, 'Subject name', 100);
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const request: CreateSubjectRequest = {
                name: name.trim(),
                description: description.trim() || undefined,
                status: isActive ? CreateSubjectRequest.status.ACTIVE : CreateSubjectRequest.status.INACTIVE,
                courseId,
            };

            await SubjectsService.postApiExamsCoursesSubjects(examId, courseId, request);

            resetForm();
            onSubjectCreated();
            onClose();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error('Error creating subject:', err);
            setError(err.body?.message || 'Failed to create subject');
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
            <div
                className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
                role="dialog"
                aria-modal="true"
                aria-labelledby="add-subject-title"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-500 to-indigo-600">
                    <h2 id="add-subject-title" className="text-xl font-semibold text-white">
                        Add New Subject
                    </h2>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleClose}
                        className="text-white/80 hover:text-white hover:bg-white/20"
                        aria-label="Close add subject modal"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div
                            role="alert"
                            aria-live="assertive"
                            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
                        >
                            {error}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label
                            htmlFor="subject-name"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Subject Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="subject-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Indian History, Mathematics"
                            maxLength={100}
                            required
                            aria-required="true"
                            aria-describedby="subject-name-help"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors focus-visible:ring-indigo-500 focus-visible:ring-offset-1"
                            disabled={loading}
                        />
                        <p id="subject-name-help" className="mt-1 text-xs text-gray-500">
                            {name.length}/100 characters
                        </p>
                    </div>

                    <div className="space-y-1.5">
                        <label
                            htmlFor="subject-description"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Description
                        </label>
                        <textarea
                            id="subject-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description of the subject..."
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none focus-visible:ring-indigo-500 focus-visible:ring-offset-1"
                            disabled={loading}
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            id="subject-active"
                            type="checkbox"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            disabled={loading}
                        />
                        <label htmlFor="subject-active" className="text-sm text-gray-700">
                            Active (visible to students)
                        </label>
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
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
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
                                'Create Subject'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}