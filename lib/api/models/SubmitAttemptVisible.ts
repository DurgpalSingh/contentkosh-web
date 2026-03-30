/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AttemptStatus } from './AttemptStatus';
import type { SubmitAttemptResultQuestion } from './SubmitAttemptResultQuestion';
import type { TestAnswer } from './TestAnswer';
export type SubmitAttemptVisible = {
    attemptId: string;
    status: AttemptStatus;
    score: number;
    totalScore: number;
    percentage: number;
    answers?: Array<TestAnswer>;
    submittedAt?: string;
    /**
     * Per-question evaluation detail (practice tests and visible exam results only)
     */
    result?: {
        questions?: Array<SubmitAttemptResultQuestion>;
    } | null;
};

