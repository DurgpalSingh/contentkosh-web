'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { CoursesService, UpdateCourseRequest, Course } from '@/lib/api';
import { validateEntityName } from '@/lib/validation';

interface EditCourseModalProps {
    isOpen: boolean;
    onClose: () => void;
    course: Course;
    examId: number;
    onCourseUpdated: () => void;
}

export function EditCourseModal({ isOpen, onClose, course, examId, onCourseUpdated }: EditCourseModalProps) {
    const [name, setName] = useState(course.name || '');
    const [description, setDescription] = useState(course.description || '');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isActive, setIsActive] = useState(course.isActive ?? true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Update form when course prop changes
    useEffect(() => {
        setName(course.name || '');
        setDescription(course.description || '');
        // Note: Since the API stores duration as text, we can't parse it back to dates
        // Start with empty dates for editing
        setStartDate('');
        setEndDate('');
        setIsActive(course.isActive ?? true);
        setError(null);
    }, [course]);

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

        const validationError = validateEntityName(name, 'Course name', 100);
        if (validationError) {
            setError(validationError);
            return;
        }

        if (!course.id) {
            setError('Course ID is missing');
            return;
        }

        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            setError('Start date must be before end date');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Compute duration string from dates if both provided
            let duration: string | undefined = course.duration; // Keep existing if no new dates
            if (startDate && endDate) {
                const start = new Date(startDate);
                const end = new Date(endDate);
                const months = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
                duration = months >= 12 ? `${Math.round(months / 12)} year(s)` : `${months} month(s)`;
            }

            const request: UpdateCourseRequest = {
                name: name.trim(),
                description: description.trim() || undefined,
                duration,
                isActive,
            };

            await CoursesService.putApiExamsCourses(examId, course.id, request);

            onCourseUpdated();
            onClose();
        } catch (err: any) {
            console.error('Error updating course:', err);
            setError(err.body?.message || 'Failed to update course');
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
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-500 to-green-600">
                    <h2 className="text-xl font-semibold text-white">Edit Course</h2>
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
                        <label htmlFor="edit-course-name" className="block text-sm font-medium text-gray-700 mb-1">
                            Course Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="edit-course-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Civil Services Foundation Course"
                            maxLength={100}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                            disabled={loading}
                        />
                        <p className="mt-1 text-xs text-gray-500">{name.length}/100 characters</p>
                    </div>

                    <div>
                        <label htmlFor="edit-course-description" className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            id="edit-course-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description of the course..."
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-none"
                            disabled={loading}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="edit-course-start-date" className="block text-sm font-medium text-gray-700 mb-1">
                                Start Date
                            </label>
                            <input
                                id="edit-course-start-date"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label htmlFor="edit-course-end-date" className="block text-sm font-medium text-gray-700 mb-1">
                                End Date
                            </label>
                            <input
                                id="edit-course-end-date"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                disabled={loading}
                            />
                        </div>
                    </div>
                    {course.duration && (
                        <p className="text-xs text-gray-500 mt-1">Current duration: {course.duration}</p>
                    )}

                    <div className="flex items-center">
                        <input
                            id="edit-course-active"
                            type="checkbox"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            disabled={loading}
                        />
                        <label htmlFor="edit-course-active" className="ml-2 text-sm text-gray-700">
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
                            className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
