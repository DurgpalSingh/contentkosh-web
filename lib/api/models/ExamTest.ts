/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ResultVisibilityExam } from './ResultVisibilityExam';
import type { TestLanguage } from './TestLanguage';
import type { TestStatus } from './TestStatus';
export type ExamTest = {
    id: string;
    businessId: string;
    batchId: string;
    /**
     * Batch display name (when loaded with batch join)
     */
    batchName?: string;
    name: string;
    description?: string;
    startAt: string;
    deadlineAt: string;
    durationMinutes: number;
    status: TestStatus;
    defaultMarksPerQuestion?: number;
    negativeMarksPerQuestion?: number;
    resultVisibility?: ResultVisibilityExam;
    shuffleQuestions?: boolean;
    shuffleOptions?: boolean;
    language: TestLanguage;
    totalQuestions?: number;
    totalMarks?: number;
    createdBy: string;
    updatedBy?: string;
    createdAt: string;
    updatedAt: string;
};

