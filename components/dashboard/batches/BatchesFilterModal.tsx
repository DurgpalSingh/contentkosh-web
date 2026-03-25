'use client';

import { useEffect, useMemo, useState } from 'react';
import { Exam, Course } from '@/lib/api';
import {
    HierarchicalFilterModal,
    FilterSection,
} from '@/components/common/HierarchicalFilterModal';

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
    const [localCourseId, setLocalCourseId] = useState<number | null>(
        selectedCourseId ?? null
    );

    useEffect(() => {
        if (isOpen) {
            setLocalExamIds(selectedExamIds.length > 0 ? selectedExamIds : exams.length > 0 ? [exams[0].id!] : []);
            setLocalCourseId(selectedCourseId ?? null);
        }
    }, [isOpen, selectedExamIds, selectedCourseId, exams]);

    const visibleCourses = useMemo(() => {
        if (localExamIds.length === 0) return courses;
        return courses.filter(c => c.examId && localExamIds.includes(c.examId));
    }, [courses, localExamIds]);

    useEffect(() => {
        if (visibleCourses.length > 0 && localCourseId === null) {
            setLocalCourseId(visibleCourses[0].id!);
        }
    }, [visibleCourses, localCourseId]);

    const examMapIdToName = useMemo(() => {
        const lookup: Record<number, string> = {};
        exams.forEach(e => {
            if (e.id) lookup[e.id] = e.name || '';
        });
        return lookup;
    }, [exams]);

    // Prepare sections for HierarchicalFilterModal
    const sections: FilterSection[] = [
        // Section 1: Exams (multi-select)
        {
            id: 'exams',
            title: 'Exams',
            selectionType: 'multiple',
            selectedId: null,
            items: exams.map(e => ({
                id: e.id!,
                label: e.name || 'Unnamed Exam',
            })),
            selectedIds: localExamIds,
            onToggle: (id) => {
                setLocalExamIds(prev =>
                    prev.includes(id)
                        ? prev.filter(x => x !== id)
                        : [...prev, id]
                );
                setLocalCourseId(null);
            },
            emptyMessage: 'No exams available.',
            theme: 'blue',
        },
        // Section 2: Courses (single-select only)
        {
            id: 'courses',
            title: 'Course (Required)',
            selectionType: 'single',
            selectedIds: [] as number[],
            items: visibleCourses.map(c => {
                const examName = c.examId ? examMapIdToName[c.examId] : undefined;
                return {
                    id: c.id!,
                    label: c.name || 'Unnamed Course',
                    subLabel: examName ? `(${examName})` : undefined,
                };
            }),
            selectedId: localCourseId,
            onSelect: (id) => setLocalCourseId(id),
            onToggle: () => { },
            emptyMessage:
                visibleCourses.length === 0
                    ? 'No courses available for selected exams'
                    : 'Select one course',
            theme: 'purple',
        },
    ];

    const handleClearAll = () => {
        // Only clear exams — never clear course
        setLocalExamIds([]);
        // Course remains selected (or auto-select first visible)
        setLocalCourseId(visibleCourses[0]?.id ?? null);
    };

    const handleApply = () => {
        if (!localCourseId) return;
        onApply(localExamIds, localCourseId);
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