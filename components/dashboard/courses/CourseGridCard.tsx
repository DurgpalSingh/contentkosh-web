import { Course } from '@/lib/api';
import { Clock, MoreVertical, Edit, Trash2, Calendar, FileText, Layers } from 'lucide-react';
import { useState } from 'react';

interface CourseGridCardProps {
    course: Course;
    examName?: string;
    onViewBatches: (course: Course) => void;
    onViewSubjects: (course: Course) => void;
    onEdit?: (course: Course) => void;
    onDelete?: (course: Course) => void;
}

export function CourseGridCard({ course, examName, onViewBatches, onViewSubjects, onEdit, onDelete }: CourseGridCardProps) {
    const [showMenu, setShowMenu] = useState(false);

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col h-full">
            <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                        {examName && (
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 mb-2 line-clamp-1 break-words">
                                {examName}
                            </span>
                        )}
                        <h3 className="text-lg font-semibold text-slate-900 line-clamp-2" title={course.name}>
                            {course.name}
                        </h3>
                    </div>

                    <div className="relative ml-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowMenu(!showMenu);
                            }}
                            className="p-1 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
                        >
                            <MoreVertical className="h-5 w-5" />
                        </button>

                        {showMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowMenu(false)}
                                />
                                <div className="absolute right-0 mt-1 w-32 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1">
                                    {onEdit && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowMenu(false);
                                                onEdit(course);
                                            }}
                                            className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                        >
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit
                                        </button>
                                    )}
                                    {onDelete && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowMenu(false);
                                                onDelete(course);
                                            }}
                                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <p className="text-sm text-slate-600 mb-4 line-clamp-2 min-h-[40px]">
                    {course.description || 'No description available'}
                </p>

                <div className="space-y-2">
                    <div className="flex items-center text-sm text-slate-500">
                        <Clock className="h-4 w-4 mr-2 text-slate-400" />
                        <span>{course.duration || 'Duration not set'}</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-500">
                        <FileText className="h-4 w-4 mr-2 text-slate-400" />
                        <span>{course.subjects?.length || 0} Subjects</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-500">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${course.status === "ACTIVE" ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                            }`}>
                            {course.status === "ACTIVE"? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 mt-auto flex space-x-2">
                <button
                    onClick={() => onViewSubjects(course)}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
                >
                    <Layers className="h-4 w-4 mr-2" />
                    Subjects
                </button>
                <button
                    onClick={() => onViewBatches(course)}
                    className="min-w-0 flex-1 flex items-center justify-center px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                >
                    <Calendar className="h-4 w-4 mr-2" />
                    Batches
                </button>
            </div>
        </div>
    );
}
