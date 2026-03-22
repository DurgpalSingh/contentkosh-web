/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TestStatus } from './TestStatus';
export type PracticeTest = {
    id: string;
    businessId: string;
    batchId: string;
    /**
     * Batch display name (when loaded with batch join)
     */
    batchName?: string;
    name: string;
    description?: string;
    status: TestStatus;
    defaultMarksPerQuestion: number;
    showExplanations: boolean;
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    totalQuestions?: number;
    totalMarks?: number;
    createdBy?: string;
    updatedBy?: string;
    createdAt: string;
    updatedAt: string;
};

