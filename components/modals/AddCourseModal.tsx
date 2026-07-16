'use client';

import { useState, useEffect } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CoursesService, CreateCourseRequest, Exam } from '@/lib/api';
import { validateEntityName, validateDateRange } from '@/lib/validation';
import { toISODateTime } from '@/lib/utils';
import { DatePicker } from '../ui/date-picker';
import { toast } from 'sonner';
import { FileUploadArea } from '@/components/dashboard/contents/FileUploadArea';
import { PROFILE_IMAGE_UPLOAD_ACCEPT } from '@/lib/content-upload.config';
import { buildCourseFormData } from '@/lib/courses/courseThumbnail';

interface AddCourseModalProps {
    isOpen: boolean;
    onClose: () => void;
    exams: Exam[];
    defaultExamId?: number;
    onCourseCreated: () => void;
}

export function AddCourseModal({
    isOpen,
    onClose,
    exams,
    defaultExamId,
    onCourseCreated,
}: AddCourseModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [isActive, setIsActive] = useState(true);
    const [selectedExamId, setSelectedExamId] = useState<number | undefined>(defaultExamId ?? exams[0]?.id);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                handleClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    useEffect(() => {
        if (!thumbnailFile) {
            setThumbnailPreviewUrl(null);
            return;
        }

        const objectUrl = URL.createObjectURL(thumbnailFile);
        setThumbnailPreviewUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [thumbnailFile]);

    const resetForm = () => {
        setName('');
        setDescription('');
        setStartDate(undefined);
        setEndDate(undefined);
        setIsActive(true);
        setThumbnailFile(null);
        // Reset to default or first available, effectively handled by the useEffect on open
        if (defaultExamId) {
            setSelectedExamId(defaultExamId);
        } else if (exams.length > 0) {
            setSelectedExamId(exams[0].id);
        } else {
            setSelectedExamId(undefined);
        }
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedExamId) {
            setError('Please select an exam.');
            return;
        }

        const validationError = validateEntityName(name, 'Course name', 100);
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
            const request: CreateCourseRequest = {
                name: name.trim(),
                description: description.length ? description.trim() : description,
                startDate: toISODateTime(startDate),
                endDate: toISODateTime(endDate),
                status: isActive ? CreateCourseRequest.status.ACTIVE : CreateCourseRequest.status.INACTIVE,
                examId: selectedExamId,
            };

            await CoursesService.postApiExamsCourses(
                selectedExamId,
                buildCourseFormData(request, thumbnailFile),
            );

            handleClose();
            onCourseCreated();
            toast.success('Course created successfully');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error('Error creating course:', err);
            setError(err.body?.message || 'Failed to create course');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!isOpen) return null;

    const noExamsAvailable = exams.length === 0;

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
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
                    <h2 className="text-xl font-semibold text-white">Add New Course</h2>

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

                    {noExamsAvailable && (
                        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
                            No exams available. Please create an exam first.
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label
                            htmlFor="exam-select"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Exam <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="exam-select"
                            value={selectedExamId || ''}
                            onChange={(e) => setSelectedExamId(Number(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors focus-visible:ring-blue-500 focus-visible:ring-offset-1 bg-white"
                            disabled={loading || noExamsAvailable}
                        >
                            <option value="" disabled>Select an exam</option>
                            {exams.map((exam) => (
                                <option key={exam.id} value={exam.id}>
                                    {exam.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label
                            htmlFor="course-name"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Course Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="course-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Civil Services Foundation Course"
                            maxLength={100}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors focus-visible:ring-blue-500 focus-visible:ring-offset-1"
                            disabled={loading || noExamsAvailable}
                        />
                        <p className="mt-1 text-xs text-gray-500">{name.length}/100 characters</p>
                    </div>

                    <div className="space-y-1.5">
                        <label
                            htmlFor="course-description"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Description
                        </label>
                        <textarea
                            id="course-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description of the course..."
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none focus-visible:ring-blue-500 focus-visible:ring-offset-1"
                            disabled={loading || noExamsAvailable}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">
                                Start Date
                            </label>
                            <DatePicker
                                date={startDate}
                                setDate={setStartDate}
                                disabled={loading || noExamsAvailable}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">
                                End Date
                            </label>
                            <DatePicker
                                date={endDate}
                                setDate={setEndDate}
                                disabled={loading || noExamsAvailable}
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            id="course-active"
                            type="checkbox"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            disabled={loading || noExamsAvailable}
                        />
                        <label htmlFor="course-active" className="text-sm text-gray-700">
                            Active (visible to students)
                        </label>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <ImageIcon className="h-4 w-4 text-gray-500" />
                            Course Thumbnail
                        </div>
                        <FileUploadArea
                            accept={PROFILE_IMAGE_UPLOAD_ACCEPT}
                            value={thumbnailFile}
                            onChange={setThumbnailFile}
                            onError={(message) => {
                                if (message) {
                                    setError(message);
                                    toast.error(message);
                                } else {
                                    setError(null);
                                }
                            }}
                            acceptedLabel="JPG, PNG, or WebP"
                            previewUrl={thumbnailPreviewUrl}
                            previewAlt="Course thumbnail preview"
                            isUploading={loading && Boolean(thumbnailFile)}
                            disabled={loading || noExamsAvailable}
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
                            disabled={loading || noExamsAvailable}
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
                                'Create Course'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
