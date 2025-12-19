import { Exam } from '@/lib/api';
import { Filter, X, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface CourseFilterProps {
    exams: Exam[];
    selectedExamIds: number[];
    onSelectionChange: (examIds: number[]) => void;
}

export function CourseFilter({ exams, selectedExamIds, onSelectionChange }: CourseFilterProps) {
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
            ? selectedExamIds.filter(id => id !== examId)
            : [...selectedExamIds, examId];

        onSelectionChange(newSelection);
    };

    const clearFilters = () => {
        onSelectionChange([]);
        setIsOpen(false);
    };

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${selectedExamIds.length > 0
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
            >
                <Filter className="h-4 w-4 mr-2" />
                Filter
                {selectedExamIds.length > 0 && (
                    <span className="ml-2 bg-blue-100 text-blue-800 py-0.5 px-2 rounded-full text-xs">
                        {selectedExamIds.length}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-2 px-3 border-b border-gray-100 flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">Filter by Exam</span>
                        {selectedExamIds.length > 0 && (
                            <button
                                onClick={clearFilters}
                                className="text-xs text-red-600 hover:text-red-800"
                            >
                                Clear all
                            </button>
                        )}
                    </div>

                    <div className="max-h-60 overflow-y-auto py-2">
                        {exams.length === 0 ? (
                            <div className="px-4 py-2 text-sm text-gray-500 text-center">
                                No exams available
                            </div>
                        ) : (
                            exams.map((exam) => (
                                <label
                                    key={exam.id}
                                    className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                                >
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            checked={selectedExamIds.includes(exam.id!)}
                                            onChange={() => toggleExam(exam.id!)}
                                        />
                                    </div>
                                    <span className="ml-3 text-sm text-gray-700 truncate block">
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
