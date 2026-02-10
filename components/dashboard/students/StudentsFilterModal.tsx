'use client';

import { useState, useEffect, useMemo } from 'react';
import { Exam, Course, Batch } from '@/lib/api';
import { HierarchicalFilterModal, FilterSection } from '@/components/common/HierarchicalFilterModal';

// Define a local type or use a generic constraints if possible, but simplest is to extend here
interface BatchWithCourse extends Batch {
    courseId?: number;
}

interface StudentsFilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    exams: Exam[];
    allCourses: Course[];
    allBatches: BatchWithCourse[];
    initialSelectedExamIds: number[];
    initialSelectedCourseIds: number[];
    initialSelectedBatchIds: number[];
    onApplyFilters: (examIds: number[], courseIds: number[], batchIds: number[]) => void;
}

export function StudentsFilterModal({
    isOpen,
    onClose,
    exams,
    allCourses,
    allBatches,
    initialSelectedExamIds,
    initialSelectedCourseIds,
    initialSelectedBatchIds,
    onApplyFilters,
}: StudentsFilterModalProps) {
    const [selectedExamIds, setSelectedExamIds] = useState<number[]>(initialSelectedExamIds);
    const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>(initialSelectedCourseIds);
    const [selectedBatchIds, setSelectedBatchIds] = useState<number[]>(initialSelectedBatchIds);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedExamIds(initialSelectedExamIds);
            setSelectedCourseIds(initialSelectedCourseIds);
            setSelectedBatchIds(initialSelectedBatchIds);
        }
    }, [isOpen, initialSelectedExamIds, initialSelectedCourseIds, initialSelectedBatchIds]);

    // Filter courses based on selected exams
    const filteredCourses = useMemo(() => {
        if (selectedExamIds.length === 0) {
            return allCourses;
        }
        return allCourses.filter(course => course.examId && selectedExamIds.includes(course.examId));
    }, [allCourses, selectedExamIds]);

    // Filter batches based on selected courses (and exams implicitly via course filtering)
    const filteredBatches = useMemo(() => {
        // If specific courses are selected, show only their batches
        if (selectedCourseIds.length > 0) {
            return allBatches.filter(batch => batch.courseId && selectedCourseIds.includes(batch.courseId));
        }
        // If only exams are selected (but no specific courses), show batches for all courses in those exams
        if (selectedExamIds.length > 0) {
            const validCourseIds = filteredCourses.map(c => c.id);
            return allBatches.filter(batch => batch.courseId && validCourseIds.includes(batch.courseId));
        }
        // Otherwise show all
        return allBatches;
    }, [allBatches, selectedCourseIds, selectedExamIds, filteredCourses]);


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

    const toggleBatch = (batchId: number) => {
        setSelectedBatchIds(prev =>
            prev.includes(batchId) ? prev.filter(id => id !== batchId) : [...prev, batchId]
        );
    };

    const handleApply = () => {
        onApplyFilters(selectedExamIds, selectedCourseIds, selectedBatchIds);
        onClose();
    };

    const handleClearAll = () => {
        setSelectedExamIds([]);
        setSelectedCourseIds([]);
        setSelectedBatchIds([]);
    };

    const sections: FilterSection[] = [
        {
            id: 'exams',
            title: 'Exams',
            items: exams.map(e => ({ id: e.id!, label: e.name || 'Unknown' })),
            selectedIds: selectedExamIds,
            onToggle: toggleExam,
            selectionType: 'multiple',
            selectedId: null,
            emptyMessage: 'No exams found.',
            theme: 'blue'
        },
        {
            id: 'courses',
            title: 'Courses',
            items: filteredCourses.map(c => ({ id: c.id!, label: c.name || 'Unknown' })),
            selectedIds: selectedCourseIds,
            onToggle: toggleCourse,
            selectionType: 'multiple',
            selectedId: null,
            emptyMessage: selectedExamIds.length > 0 ? "No courses for selected exams." : "No courses found.",
            theme: 'purple'
        },
        {
            id: 'batches',
            title: 'Batches',
            items: filteredBatches.map(b => ({ id: b.id!, label: b.displayName || 'Unknown', subLabel: b.codeName })),
            selectedIds: selectedBatchIds,
            onToggle: toggleBatch,
            selectionType: 'multiple',
            selectedId: null,
            emptyMessage: selectedCourseIds.length > 0 ? "No batches for selected courses." : "No batches found.",
            theme: 'green'
        }
    ];

    return (
        <HierarchicalFilterModal
            isOpen={isOpen}
            onClose={onClose}
            title="Filter Students"
            sections={sections}
            onClearAll={handleClearAll}
            onApply={handleApply}
        />
    );
}
