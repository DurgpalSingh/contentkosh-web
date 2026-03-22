/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ResultVisibilityExam } from './ResultVisibilityExam';
import type { ResultVisibilityPractice } from './ResultVisibilityPractice';
import type { TestStatus } from './TestStatus';
export type TestDetailsForAttempt = {
    id: string;
    businessId?: string;
    batchId?: string;
    name: string;
    description?: string;
    /**
     * 0=Practice, 1=Exam
     */
    type?: TestDetailsForAttempt.type;
    status?: TestStatus;
    totalQuestions: number;
    totalMarks: number;
    durationMinutes?: number;
    defaultMarksPerQuestion?: number;
    negativeMarksPerQuestion?: number;
    showExplanations?: boolean;
    shuffleQuestions?: boolean;
    shuffleOptions?: boolean;
    startAt?: string;
    deadlineAt?: string;
    /**
     * Practice=IMMEDIATE; Exam=AFTER_DEADLINE or HIDDEN.
     */
    resultVisibility?: (ResultVisibilityPractice | ResultVisibilityExam);
    attemptsAllowed?: number;
    attemptsUsed?: number;
};
export namespace TestDetailsForAttempt {
    /**
     * 0=Practice, 1=Exam
     */
    export enum type {
        '_0' = 0,
        '_1' = 1,
    }
}

