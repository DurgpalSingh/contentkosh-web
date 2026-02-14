'use client';

import { useState } from 'react';
import { BookOpen, Calendar, MoreVertical, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Exam } from '@/lib/api';

interface ExamGridCardProps {
    exam: Exam;
    onViewCourses: (exam: Exam) => void;
    onEdit?: (exam: Exam) => void;
    onDelete?: (exam: Exam) => void;
}

export function ExamGridCard({
    exam,
    onViewCourses,
    onEdit,
    onDelete,
}: ExamGridCardProps) {
    const [showMenu, setShowMenu] = useState(false);

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col h-full">
            <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0">
                        <h3
                            className="text-lg font-semibold text-slate-900 line-clamp-2 break-words"
                            title={exam.name}
                        >
                            {exam.name}
                        </h3>
                        <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${exam.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-slate-100 text-slate-800'
                                }`}
                        >
                            {exam.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                        </span>
                    </div>

                    <div className="relative">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                            onClick={() => setShowMenu(!showMenu)}
                        >
                            <MoreVertical className="h-5 w-5" />
                        </Button>

                        {showMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowMenu(false)}
                                />
                                <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1">
                                    {onEdit && (
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                            onClick={() => {
                                                setShowMenu(false);
                                                onEdit(exam);
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
                                            onClick={() => {
                                                setShowMenu(false);
                                                onDelete(exam);
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

                <p
                    className="text-sm text-slate-600 mb-6 line-clamp-2 min-h-[40px]"
                    title={exam.description}
                >
                    {exam.description || 'No description available'}
                </p>

                <div className="space-y-2">
                    <div className="flex items-center text-sm text-slate-500">
                        <BookOpen className="h-4 w-4 mr-2 text-slate-400" />
                        <span>{exam.courses?.length || 0} Courses</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-500">
                        <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                        <span>
                            Created{' '}
                            {exam.createdAt
                                ? new Date(exam.createdAt).toLocaleDateString()
                                : 'N/A'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 mt-auto">
                <Button
                    variant="outline"
                    className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                    onClick={() => onViewCourses(exam)}
                >
                    <Eye className="h-4 w-4 mr-2" />
                    View Courses
                </Button>
            </div>
        </div>
    );
}