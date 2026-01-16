'use client';

import { useState, useEffect } from 'react';
import { Exam, Course } from '@/lib/api';
import { HierarchicalFilterModal, FilterItem, FilterSection } from '@/components/common/HierarchicalFilterModal'; // ← your reusable component

interface BatchesFilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    exams: Exam[];
    courses: Course[];
    selectedExamIds: number[];
    selectedCourseId?: number;
    onApply: (examIds: number[], courseId?: number) => void;
}

export function BatchesFilterModal({
    isOpen,
    onClose,
    exams,
    courses,
    selectedExamIds,
    selectedCourseId,
    onApply,
}: BatchesFilterModalProps) {
    const [localExamIds, setLocalExamIds] = useState<number[]>(selectedExamIds);
    const [localCourseId, setLocalCourseId] = useState<number | undefined>(selectedCourseId);

    // Sync when modal opens
    useEffect(() => {
        if (isOpen) {
            setLocalExamIds(selectedExamIds);
            setLocalCourseId(selectedCourseId);
        }
    }, [isOpen, selectedExamIds, selectedCourseId]);

    // Filter courses based on currently selected exams
    const visibleCourses = localExamIds.length === 0
        ? courses
        : courses.filter((c) => c.examId && localExamIds.includes(c.examId));

    // Auto-select first course if none is selected
    useEffect(() => {
        if (visibleCourses.length > 0 && localCourseId === undefined) {
            setLocalCourseId(visibleCourses[0].id);
        }
    }, [visibleCourses, localCourseId]);

    // Prepare sections for HierarchicalFilterModal
    const sections: FilterSection[] = [
        // Section 1: Exams (multi-select)
        {
            id: 'exams',
            title: 'Exams',
            items: exams.map((e) => ({
                id: e.id!,
                label: e.name || 'Unnamed Exam',
            })),
            selectedIds: localExamIds,
            onToggle: (id: number) => {
                setLocalExamIds((prev) =>
                    prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
                );
            },
            emptyMessage: 'No exams available.',
            theme: 'blue',
        },
        // Section 2: Courses (single-select only - we fake it as multi but enforce single)
        {
            id: 'courses',
            title: 'Courses (Required* - select one)',
            items: visibleCourses.map((c) => ({
                id: c.id!,
                label: c.name || 'Unnamed Course',
                subLabel: c.examName ? `(${c.examName})` : undefined,
            })),
            selectedIds: localCourseId !== undefined ? [localCourseId] : [],
            onToggle: (id: number) => {
                // Enforce single selection - clicking same deselects nothing (keeps current)
                setLocalCourseId(id);
            },
            emptyMessage:
                visibleCourses.length === 0
                    ? localExamIds.length > 0
                        ? 'No courses found for selected exams'
                        : 'No courses available'
                    : 'Select one course',
            theme: 'purple',
        },
    ];

    const handleClearAll = () => {
        // Only clear exams — never clear course
        setLocalExamIds([]);
        // Course remains selected (or auto-select first visible)
        if (visibleCourses.length > 0) {
            setLocalCourseId(visibleCourses[0].id);
        }
    };

    const handleApply = () => {
        // Always send a course id (we guaranteed it's set)
        const finalCourseId = localCourseId ?? visibleCourses[0]?.id;
        if (finalCourseId !== undefined) {
            onApply(localExamIds, finalCourseId);
        }
        onClose();
    };

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