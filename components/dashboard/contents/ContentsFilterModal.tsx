'use client';

import { useEffect, useMemo, useState } from 'react';
import { Batch, Course, Exam } from '@/lib/api';
import { HierarchicalFilterModal, FilterSection } from '@/components/common/HierarchicalFilterModal';

interface ContentBatch extends Batch {
    courseId?: number;
    courseName?: string;
    examId?: number;
}

interface ContentsFilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    exams: Exam[];
    courses: Course[];
    batches: ContentBatch[];
    selectedExamIds: number[];
    selectedCourseIds: number[];
    selectedBatchId?: number;
    onApply: (examIds: number[], courseIds: number[], batchId?: number) => void;
}

export function ContentsFilterModal({
    isOpen,
    onClose,
    exams,
    courses,
    batches,
    selectedExamIds,
    selectedCourseIds,
    selectedBatchId,
    onApply,
}: ContentsFilterModalProps) {
    const [localExamIds, setLocalExamIds] = useState<number[]>(selectedExamIds);
    const [localCourseIds, setLocalCourseIds] = useState<number[]>(selectedCourseIds);
    const [localBatchId, setLocalBatchId] = useState<number | null>(
        selectedBatchId ?? null
    );

    useEffect(() => {
        if (isOpen) {
            setLocalExamIds(selectedExamIds);
            setLocalCourseIds(selectedCourseIds);
            setLocalBatchId(selectedBatchId ?? null);
        }
    }, [isOpen, selectedExamIds, selectedCourseIds, selectedBatchId]);

    const visibleCourses = useMemo(() => {
        if (localExamIds.length === 0) return courses;
        return courses.filter(c => c.examId && localExamIds.includes(c.examId));
    }, [courses, localExamIds]);

    const visibleBatches = useMemo(() => {
        const visibleCourseIds = localCourseIds.length > 0
            ? new Set(localCourseIds)
            : new Set(visibleCourses.map(c => c.id!));
        if (visibleCourseIds.size === 0) return [];
        return batches.filter(b => b.courseId && visibleCourseIds.has(b.courseId));
    }, [batches, localCourseIds, visibleCourses]);

    useEffect(() => {
        if (visibleBatches.length > 0) {
            setLocalBatchId(prev =>
                prev && visibleBatches.some(b => b.id === prev)
                    ? prev
                    : visibleBatches[0].id!
            );
        } else {
            setLocalBatchId(null);
        }
    }, [visibleBatches]);

    const handleClearAll = () => {
        setLocalExamIds([]);
        setLocalCourseIds([]);
        setLocalBatchId(null);
    };

    const handleApply = () => {
        if (!localBatchId) return;
        onApply(localExamIds, localCourseIds, localBatchId);
        onClose();
    };

    const sections: FilterSection[] = [
        {
            id: 'exams',
            title: 'Exams',
            selectionType: 'multiple',
            items: exams.map(e => ({
                id: e.id!,
                label: e.name || 'Unnamed Exam',
            })),
            selectedIds: localExamIds,
            selectedId: null,
            onToggle: (id) => {
                setLocalExamIds(prev =>
                    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
                );
                setLocalCourseIds([]);
                setLocalBatchId(null);
            },
            emptyMessage: 'No exams available.',
            theme: 'blue',
        },
        {
            id: 'courses',
            title: 'Course',
            selectionType: 'multiple',
            items: visibleCourses.map(c => ({
                id: c.id!,
                label: c.name || 'Unnamed Course',
                subLabel: c.examName ? `(${c.examName})` : undefined,
            })),
            selectedIds: localCourseIds,
            selectedId: null,
            onToggle: (id) => {
                setLocalCourseIds(prev =>
                    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
                );
                setLocalBatchId(null);
            },
            emptyMessage:
                visibleCourses.length === 0
                    ? 'No courses available for selected exams'
                    : 'Select courses',
            theme: 'purple',
        },
        {
            id: 'batches',
            title: 'Batch (Required)',
            selectionType: 'single',
            items: visibleBatches.map(b => ({
                id: b.id!,
                label: b.displayName || 'Unnamed Batch',
                subLabel: b.codeName,
            })),
            selectedIds: [],
            selectedId: localBatchId,
            onSelect: (id) => setLocalBatchId(id),
            emptyMessage: visibleCourses.length === 0
                ? 'Select exams or courses to see batches'
                : 'No batches for selected courses',
            theme: 'green',
        },
    ];

    return (
        <HierarchicalFilterModal
            isOpen={isOpen}
            onClose={onClose}
            title="Filter Contents"
            sections={sections}
            onClearAll={handleClearAll}
            onApply={handleApply}
        />
    );
}
