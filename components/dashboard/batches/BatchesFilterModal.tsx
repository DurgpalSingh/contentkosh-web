'use client';

import { useState, useEffect, useMemo } from 'react';
import { Exam, Course } from '@/lib/api';
import { HierarchicalFilterModal, FilterSection } from '@/components/common/HierarchicalFilterModal';

interface BatchesFilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    exams: Exam[];
    allCourses: Course[];
    initialSelectedExamIds: number[];
    initialSelectedCourseIds: number[];
    onApplyFilters: (examIds: number[], courseIds: number[]) => void;
}

export function BatchesFilterModal({
    isOpen,
    onClose,
    exams,
    allCourses,
    initialSelectedExamIds,
    initialSelectedCourseIds,
    onApplyFilters,
}: BatchesFilterModalProps) {
    const [selectedExamIds, setSelectedExamIds] = useState<number[]>(initialSelectedExamIds);
    const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>(initialSelectedCourseIds);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedExamIds(initialSelectedExamIds);
            setSelectedCourseIds(initialSelectedCourseIds);
        }
    }, [isOpen, initialSelectedExamIds, initialSelectedCourseIds]);

    const filteredCourses = useMemo(() => {
        if (selectedExamIds.length === 0) {
            return allCourses;
        }
        return allCourses.filter(course => course.examId && selectedExamIds.includes(course.examId));
    }, [allCourses, selectedExamIds]);

    const toggleExam = (examId: number) => {
        setSelectedExamIds(prev =>
            prev.includes(examId) ? prev.filter(id => id !== examId) : [...prev, examId]
        );
    };

    const toggleCourse = (courseId: number) => {
        setSelectedCourseIds(prev =>
            prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]
        );
    };

    const handleApply = () => {
        onApplyFilters(selectedExamIds, selectedCourseIds);
        onClose();
    };

    const handleClearAll = () => {
        setSelectedExamIds([]);
        setSelectedCourseIds([]);
    };

    const sections: FilterSection[] = [
        {
            id: 'exams',
            title: 'Exams',
            items: exams.map(e => ({ id: e.id!, label: e.name || 'Unknown' })),
            selectedIds: selectedExamIds,
            onToggle: toggleExam,
            emptyMessage: 'No exams found.',
            theme: 'blue'
        },
        {
            id: 'courses',
            title: 'Courses',
            items: filteredCourses.map(c => ({ id: c.id!, label: c.name || 'Unknown' })),
            selectedIds: selectedCourseIds,
            onToggle: toggleCourse,
            emptyMessage: selectedExamIds.length > 0 ? "No courses for selected exams." : "No courses found.",
            theme: 'purple'
        }
    ];

    return (
        <HierarchicalFilterModal
            isOpen={isOpen}
            onClose={onClose}
            title="Filter Batches"
            sections={sections}
            onClearAll={handleClearAll}
            onApply={handleApply}
        />
    );
}
