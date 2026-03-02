'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BatchesService, Course, CreateBatchRequest } from '@/lib/api';
import { DatePicker } from '@/components/ui/date-picker';
import { batchSchema } from '@/lib/schemas';

interface AddBatchModalProps {
    isOpen: boolean;
    onClose: () => void;
    courses: Course[];
    initialCourseId?: number;
    onBatchCreated: () => void;
}

export function AddBatchModal({
    isOpen,
    onClose,
    courses,
    initialCourseId,
    onBatchCreated,
}: AddBatchModalProps) {
    const [codeName, setCodeName] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [selectedCourseId, setSelectedCourseId] = useState<number>(0);
    const [isActive, setIsActive] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) return;

        const nextCourseId = initialCourseId ?? courses[0]?.id;

        if (nextCourseId != null) {
            setSelectedCourseId(nextCourseId);
        }

        if (nextCourseId) {
            setSelectedCourseId(nextCourseId);
        }
    }, [isOpen, initialCourseId, courses]);

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
        setCodeName('');
        setDisplayName('');
        setStartDate(undefined);
        setEndDate(undefined);
        setIsActive(true);
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const result = batchSchema.safeParse({
            codeName,
            displayName,
            startDate,
            endDate,
        });

        if (!result.success) {
            setError(result.error.issues[0]?.message || 'Validation failed');
            return;
        }

        const data = result.data;
        if (!selectedCourseId) {
            setError('Please select a course');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const request: CreateBatchRequest = {
                codeName: data.codeName,
                displayName: data.displayName,
                startDate: data.startDate.toISOString(),
                endDate: data.endDate.toISOString(),
                isActive,
                courseId: selectedCourseId,
            };

            await BatchesService.postApiBatches(request);

            resetForm();
            onBatchCreated();
            onClose();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    const noCoursesAvailable = courses.length === 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-y-auto max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-500 to-purple-600">
                    <h2 className="text-xl font-semibold text-white">Add New Batch</h2>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleClose}
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

                    {noCoursesAvailable && (
                        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
                            You first need to create a course.
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <Label htmlFor="batch-course">
                            Course <span className="text-red-500">*</span>
                        </Label>
                        <select
                            id="batch-course"
                            value={selectedCourseId || ''}
                            onChange={(e) => setSelectedCourseId(Number(e.target.value))}
                            disabled={loading || noCoursesAvailable}
                            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {courses.length === 0 && <option value="">No courses available</option>}
                            {courses.map((course) => (
                                <option key={course.id} value={course.id}>
                                    {course.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="batch-code-name">
                            Code Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="batch-code-name"
                            value={codeName}
                            onChange={(e) => setCodeName(e.target.value)}
                            placeholder="e.g., BATCH-2024-A"
                            disabled={loading}
                            className="focus-visible:ring-purple-500 focus-visible:ring-offset-1"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="batch-display-name">
                            Display Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="batch-display-name"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="e.g., January 2024 Batch"
                            disabled={loading}
                            className="focus-visible:ring-purple-500 focus-visible:ring-offset-1"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label>
                                Start Date <span className="text-red-500">*</span>
                            </Label>
                            <DatePicker
                                date={startDate}
                                setDate={setStartDate}
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label>
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
                            variant="outline"
                            onClick={handleClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                            disabled={loading || noCoursesAvailable}
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
                                'Create Batch'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}