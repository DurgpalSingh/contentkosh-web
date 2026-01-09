'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { CoursesService, UpdateCourseRequest, Course } from '@/lib/api';
import { validateEntityName } from '@/lib/validation';
import { DatePicker } from '@/components/ui/date-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

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
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [isActive, setIsActive] = useState(course.status === "ACTIVE");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Update form when course prop changes
    useEffect(() => {
        setName(course.name || '');
        setDescription(course.description || '');
        // Note: Since the API stores duration as text, we can't easily parse it back to dates if they aren't stored separately.
        // Assuming for now we just want to allow setting new dates.
        setStartDate(undefined);
        setEndDate(undefined);
        setIsActive(course.status === "ACTIVE");
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

        // Basic validation
        if (!name) {
            setError('Course name is required');
            return;
        }
        if (name.length > 100) {
            setError('Course name cannot exceed 100 characters');
            return;
        }
        if (!course.id) {
            setError('Course ID is missing');
            return;
        }
        if (startDate && endDate && startDate > endDate) {
            setError('Start date must be before end date');
            return;
        }


        setLoading(true);
        setError(null);

        try {
            // Compute duration string from dates if both provided
            let duration: string | undefined = course.duration; // Keep existing if no new dates
            if (startDate && endDate) {
                const months = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
                duration = months >= 12 ? `${Math.round(months / 12)} year(s)` : `${months} month(s)`;
            }

            const request: UpdateCourseRequest = {
                name: name.trim(),
                description: description.length ? description.trim() : description,
                duration,
                status: isActive ? "ACTIVE" : "INACTIVE",
            };

            await CoursesService.putApiExamsCourses({ examId, courseId: course.id!, requestBody: request });

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
                        <Label htmlFor="edit-course-name" className="mb-1 block">
                            Course Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="edit-course-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Civil Services Foundation Course"
                            maxLength={100}
                            className="focus-visible:ring-green-500"
                            disabled={loading}
                        />
                        <p className="mt-1 text-xs text-gray-500">{name.length}/100 characters</p>
                    </div>

                    <div>
                        <Label htmlFor="edit-course-description" className="mb-1 block">
                            Description
                        </Label>
                        <Textarea
                            id="edit-course-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description of the course..."
                            rows={3}
                            className="resize-none focus-visible:ring-green-500"
                            disabled={loading}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="mb-1 block">
                                Start Date
                            </Label>
                            <DatePicker
                                date={startDate}
                                setDate={setStartDate}
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <Label className="mb-1 block">
                                End Date
                            </Label>
                            <DatePicker
                                date={endDate}
                                setDate={setEndDate}
                                disabled={loading}
                            />
                        </div>
                    </div>
                    {course.duration && (
                        <p className="text-xs text-gray-500 mt-1">Current duration: {course.duration}</p>
                    )}

                    <div className="flex items-center space-x-2">
                        <input
                            id="edit-course-active"
                            type="checkbox"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            disabled={loading}
                        />
                        <Label htmlFor="edit-course-active" className="font-normal">
                            Active (visible to students)
                        </Label>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
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
