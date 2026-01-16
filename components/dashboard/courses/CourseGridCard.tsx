'use client';

import { useState } from 'react';
import {
    Clock,
    MoreVertical,
    Edit,
    Trash2,
    Calendar,
    FileText,
    Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Course } from '@/lib/api';

interface CourseGridCardProps {
    course: Course;
    examName?: string;
    onViewBatches: (course: Course) => void;
    onViewSubjects: (course: Course) => void;
    onEdit?: (course: Course) => void;
    onDelete?: (course: Course) => void;
}

export function CourseGridCard({
    course,
    examName,
    onViewBatches,
    onViewSubjects,
    onEdit,
    onDelete,
}: CourseGridCardProps) {
    const [showMenu, setShowMenu] = useState(false);

    const formatDate = (date?: string | Date | null) => {
        if (!date) return null;
        const d = new Date(date);
        return isNaN(d.getTime()) ? null : d.toLocaleDateString();
    };

    const startDate = formatDate(course.startDate);
    const endDate = formatDate(course.endDate);

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col h-full">
            <div className="p-5 flex-1">
                {/* Header */}
                <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                        {examName && (
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 mb-2 inline-block line-clamp-1">
                                {examName}
                            </span>
                        )}
                        <h3
                            className="text-lg font-semibold text-slate-900 line-clamp-2"
                            title={course.name}
                        >
                            {course.name}
                        </h3>
                    </div>

                    {/* Menu */}
                    <div className="relative ml-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowMenu(!showMenu);
                            }}
                        >
                            <MoreVertical className="h-5 w-5" />
                        </Button>

                        {showMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowMenu(false)}
                                />
                                <div className="absolute right-0 mt-1 w-32 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1">
                                    {onEdit && (
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowMenu(false);
                                                onEdit(course);
                                            }}
                                        >
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit
                                        </Button>
                                    )}

                                    {onDelete && (
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowMenu(false);
                                                onDelete(course);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                        </Button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-600 mb-3 line-clamp-2 min-h-[40px]">
                    {course.description || 'No description available'}
                </p>

                {/* Course Duration */}
                {(startDate || endDate) && (
                    <div className="flex items-center text-sm text-slate-500 mb-3">
                        <Clock className="h-4 w-4 mr-2 text-slate-400" />
                        <span>
                            {startDate && endDate && (
                                <>
                                    {startDate} – {endDate}
                                </>
                            )}
                            {startDate && !endDate && <>Starts on {startDate}</>}
                            {!startDate && endDate && <>Until {endDate}</>}
                        </span>
                    </div>
                )}

                {/* Meta Info */}
                <div className="space-y-2">
                    <div className="flex items-center text-sm text-slate-500">
                        <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                        <span>
                            Created{' '}
                            {course.createdAt
                                ? new Date(course.createdAt).toLocaleDateString()
                                : 'N/A'}
                        </span>
                    </div>

                    <div className="flex items-center text-sm text-slate-500">
                        <FileText className="h-4 w-4 mr-2 text-slate-400" />
                        <span>{course.subjects?.length || 0} Subjects</span>
                    </div>

                    <div>
                        <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${course.status === 'ACTIVE'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-slate-100 text-slate-800'
                                }`}
                        >
                            {course.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 mt-auto flex space-x-2">
                <Button
                    variant="outline"
                    className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50"
                    onClick={() => onViewSubjects(course)}
                >
                    <Layers className="h-4 w-4 mr-2" />
                    Subjects
                </Button>

                <Button
                    variant="outline"
                    className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                    onClick={() => onViewBatches(course)}
                >
                    <Calendar className="h-4 w-4 mr-2" />
                    Batches
                </Button>
            </div>
        </div>
    );
}