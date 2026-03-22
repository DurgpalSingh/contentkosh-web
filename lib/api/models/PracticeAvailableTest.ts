/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TestStatus } from './TestStatus';
export type PracticeAvailableTest = {
    id: string;
    businessId: string;
    batchId: string;
    /**
     * Batch display name for UI
     */
    batchName?: string;
    name: string;
    description?: string;
    status?: TestStatus;
    totalQuestions: number;
    totalMarks: number;
    defaultMarksPerQuestion?: number;
    canAttempt?: boolean;
    attemptId?: string;
    attemptCount?: number;
    bestScore?: number;
    lastAttemptAt?: string;
};

