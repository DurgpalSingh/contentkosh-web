/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TestStatus } from './TestStatus';
export type SubjectiveTest = {
    id: string;
    businessId: number;
    batchId: number;
    batchName?: string;
    subjectId?: number | null;
    subjectName?: string | null;
    name: string;
    paperType: string;
    description?: string | null;
    instructions?: string | null;
    status: TestStatus;
    isPublished: boolean;
    totalMarks: number;
    durationMinutes: number;
    startAt: string;
    deadlineAt: string;
    hasQuestionPaper: boolean;
    /**
     * Download name, from the paper type
     */
    questionPaperName?: string | null;
    createdBy?: number;
    updatedBy?: number | null;
    createdAt?: string;
    updatedAt?: string;
};

