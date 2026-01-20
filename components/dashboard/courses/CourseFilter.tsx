// CourseFilter.tsx - Bottom sheet style
'use client';

import { useState } from 'react';
import { Exam } from '@/lib/api';
import { Filter, X, Check } from 'lucide-react';

interface CourseFilterProps {
    exams: Exam[];
    selectedExamId?: number;
    onSelectionChange: (examId: number) => void;
}

export function CourseFilter({ exams, selectedExamId, onSelectionChange }: CourseFilterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const selectedExam = exams.find(e => e.id === selectedExamId);

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="
          inline-flex items-center gap-2 px-4 py-2 
          bg-white border border-gray-300 rounded-lg 
          shadow-sm hover:bg-gray-50 text-sm font-medium text-gray-700
        "
            >
                <Filter className="h-4 w-4" />
                <span className="max-w-[140px] truncate">
                    {selectedExam?.name || 'All Exams'}
                </span>
            </button>

            {/* Bottom Sheet / Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center">
                    <div className="
            w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl 
            shadow-2xl max-h-[85vh] overflow-hidden flex flex-col
            animate-in slide-in-from-bottom duration-300
          ">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="text-lg font-semibold">Select Exam</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 rounded-full hover:bg-gray-100"
                            >
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>

                        {/* List */}
                        <div className="overflow-y-auto flex-1">
                            {exams.map(exam => (
                                <button
                                    key={exam.id}
                                    onClick={() => {
                                        onSelectionChange(exam.id!);
                                        setIsOpen(false);
                                    }}
                                    className={`
                    w-full px-5 py-3.5 text-left flex items-center justify-between
                    border-b last:border-none
                    ${exam.id === selectedExamId
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'hover:bg-gray-50'
                                        }
                  `}
                                >
                                    <span className="font-medium">{exam.name}</span>
                                    {exam.id === selectedExamId && (
                                        <Check className="h-5 w-5 text-blue-600" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}