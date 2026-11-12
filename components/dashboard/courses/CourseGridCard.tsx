'use client';

import { useState } from 'react';
import NextImage from 'next/image';
import {
    Clock,
    MoreVertical,
    Edit,
    Trash2,
    Calendar,
    FileText,
    Layers,
    IndianRupee,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Course } from '@/lib/api';
import { USER_ROLES } from '@/lib/constants';
import { useAuthStore } from '@/store/useAuthStore';
import { getCourseThumbnailUrl } from '@/lib/courses/courseThumbnail';
import { formatCoursePrice } from '@/lib/courses/coursePricing';

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
    const { user } = useAuthStore();
    const isAdmin = user?.role === USER_ROLES.ADMIN;
    const formatDate = (date?: string | Date | null) => {
        if (!date) return null;
        const d = new Date(date);
        return isNaN(d.getTime()) ? null : d.toLocaleDateString();
    };
    const alt = course.name || 'Course Thumbnail';

    const startDate = formatDate(course.startDate);
    const endDate = formatDate(course.endDate);
    const thumbnailUrl = getCourseThumbnailUrl(course.thumbnail);
    const priceLabel = formatCoursePrice(course.price);
    const isFree = Number(course.price ?? 0) <= 0;

    return (
        <div className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                <NextImage
                    src={thumbnailUrl}
                    alt={alt}
                    width={640}
                    height={360}
                    sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="h-full w-full object-cover"
                    unoptimized={thumbnailUrl.startsWith('http')}
                />
                <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                    <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm ${isFree
                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
                            : 'bg-white text-slate-900 ring-1 ring-slate-200'
                            }`}
                    >
                        {/* {!isFree && <IndianRupee className="mr-1 h-3.5 w-3.5" />} */}
                        {priceLabel}
                    </span>
                </div>
            </div>
            <div className="flex-1 p-5">
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

                    {isAdmin && <div className="relative ml-2 shrink-0">
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
                    </div>}
                </div>

                {/* Description */}
                {/* <p className="mb-3 min-h-10 text-sm text-slate-600 line-clamp-2">
                    {course.description || 'No description available'}
                </p> */}

                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-lg bg-slate-50 p-2">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            Dates
                        </div>
                        <div className="mt-1 truncate font-semibold text-slate-800" title={startDate || endDate ? `${startDate ?? ''}${startDate && endDate ? ' - ' : ''}${endDate ?? ''}` : 'Not set'}>
                            {startDate && endDate && `${startDate} - ${endDate}`}
                            {startDate && !endDate && `Starts ${startDate}`}
                            {!startDate && endDate && `Until ${endDate}`}
                            {!startDate && !endDate && 'Not set'}
                        </div>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            Created
                        </div>
                        <div className="mt-1 font-semibold text-slate-800">
                            {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                    </div>
                    {/* <>
                    <div className="rounded-lg bg-slate-50 p-2">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                            <FileText className="h-3.5 w-3.5 text-slate-400" />
                            Subjects
                        </div>
                        <div className="mt-1 font-semibold text-slate-800">{course.subjects?.length || 0}</div>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-2">
                        <div className="mb-1 text-xs font-medium text-slate-500">Status</div>
                        <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${course.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-slate-100 text-slate-800'
                                }`}
                        >
                            {course.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                    </> */}
                </div>
            </div>

            {/* Actions */}
            <div className="mt-auto grid grid-cols-1 gap-2 border-t border-slate-100 bg-slate-50 p-4 sm:grid-cols-2">
                <Button
                    variant="outline"
                    className="w-full min-w-0 justify-center border-slate-300 text-slate-700 hover:bg-slate-50"
                    onClick={() => onViewSubjects(course)}
                >
                    <Layers className="mr-2 h-4 w-4 shrink-0" />
                    Subjects
                </Button>

                <Button
                    variant="outline"
                    className="w-full min-w-0 justify-center border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                    onClick={() => onViewBatches(course)}
                >
                    <Calendar className="mr-2 h-4 w-4 shrink-0" />
                    Batches
                </Button>
            </div>
        </div>
    );
}
