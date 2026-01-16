'use client';

import { useState, useRef, useEffect } from 'react';
import { Filter, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Exam } from '@/lib/api';

interface CourseFilterProps {
    exams: Exam[];
    selectedExamIds: number[];
    onSelectionChange: (examIds: number[]) => void;
}

export function CourseFilter({
    exams,
    selectedExamIds,
    onSelectionChange,
}: CourseFilterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const toggleExam = (examId: number) => {
        const newSelection = selectedExamIds.includes(examId)
            ? selectedExamIds.filter((id) => id !== examId)
            : [...selectedExamIds, examId];

        onSelectionChange(newSelection);
    };

    const clearFilters = () => {
        onSelectionChange([]);
        setIsOpen(false);
    };

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <Button
                variant={selectedExamIds.length > 0 ? "default" : "outline"}
                size="sm"
                className={`
          ${selectedExamIds.length > 0
                        ? 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700'
                        : 'bg-white hover:bg-gray-50 border-gray-300 text-gray-700'}
        `}
                onClick={() => setIsOpen(!isOpen)}
            >
                <Filter className="h-4 w-4 mr-2" />
                Filter
                {selectedExamIds.length > 0 && (
                    <span className="ml-2 bg-blue-100 text-blue-800 py-0.5 px-2 rounded-full text-xs font-medium">
                        {selectedExamIds.length}
                    </span>
                )}
            </Button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-md shadow-lg bg-white ring-1 ring-black/5 z-50">
                    <div className="py-2 px-3 border-b border-gray-100 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">Filter by Exam</span>

                        {selectedExamIds.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs text-red-600 hover:text-red-800 hover:bg-red-50"
                                onClick={clearFilters}
                            >
                                Clear all
                            </Button>
                        )}
                    </div>

                    <div className="max-h-60 overflow-y-auto py-1">
                        {exams.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                No exams available
                            </div>
                        ) : (
                            exams.map((exam) => (
                                <label
                                    key={exam.id}
                                    className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer select-none"
                                >
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        checked={selectedExamIds.includes(exam.id!)}
                                        onChange={() => toggleExam(exam.id!)}
                                    />
                                    <span className="ml-3 text-sm text-gray-700 truncate">
                                        {exam.name}
                                    </span>
                                </label>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}