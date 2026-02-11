'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CoursesService, UpdateCourseRequest, Course } from '@/lib/api';
import { validateDateRange, validateEntityName, validateCourseName } from '@/lib/validation';
import { DatePicker } from '@/components/ui/date-picker';
import { toISODateTime } from '@/lib/utils';

interface EditCourseModalProps {
    isOpen: boolean;
    onClose: () => void;
    course: Course;
    examId: number;
    onCourseUpdated: () => void;
}

export function EditCourseModal({
    isOpen,
    onClose,
    course,
    examId,
    onCourseUpdated,
}: EditCourseModalProps) {
    const [name, setName] = useState(course.name || '');
    const [description, setDescription] = useState(course.description || '');
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [isActive, setIsActive] = useState(course.status === 'ACTIVE');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setName(course.name || '');
        setDescription(course.description || '');
        setStartDate(course.startDate ? new Date(course.startDate) : undefined);
        setEndDate(course.endDate ? new Date(course.endDate) : undefined);
        setIsActive(course.status === 'ACTIVE');
        setError(null);
    }, [isOpen, course]);

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

        const nameError = validateCourseName(name);
        if (nameError) {
            setError(nameError);
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

        if (!course.id) {
            setError('Course ID is missing');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const request: UpdateCourseRequest = {
                name: name.trim(),
                description: description.length ? description.trim() : description,
                startDate: toISODateTime(startDate),
                endDate: toISODateTime(endDate),
                status: isActive ? UpdateCourseRequest.status.ACTIVE : UpdateCourseRequest.status.INACTIVE,
            };

            await CoursesService.putApiExamsCourses(
                examId,
                course.id!,
                request,
            );

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
                        <Label htmlFor="edit-course-name">
                            Course Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="edit-course-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Civil Services Foundation Course"
                            maxLength={100}
                            disabled={loading}
                            className="focus-visible:ring-green-500 focus-visible:ring-offset-1"
                        />
                        <p className="text-xs text-gray-500">{name.length}/100 characters</p>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="edit-course-description">Description</Label>
                        <Textarea
                            id="edit-course-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description of the course..."
                            rows={3}
                            className="resize-none focus-visible:ring-green-500 focus-visible:ring-offset-1"
                            disabled={loading}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>Start Date</Label>
                            <DatePicker
                                date={startDate}
                                setDate={setStartDate}
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>End Date</Label>
                            <DatePicker
                                date={endDate}
                                setDate={setEndDate}
                                disabled={loading}
                            />
                        </div>
                    </div>

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
                            className="bg-green-600 hover:bg-green-700 text-white"
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