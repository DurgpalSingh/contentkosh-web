/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LockedReason } from './LockedReason';
import type { ResultVisibilityExam } from './ResultVisibilityExam';
import type { TestLanguage } from './TestLanguage';
import type { TestStatus } from './TestStatus';
export type ExamAvailableTest = {
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
    language: TestLanguage;
    startAt: string;
    deadlineAt: string;
    durationMinutes: number;
    totalQuestions?: number;
    totalMarks?: number;
    defaultMarksPerQuestion?: number;
    negativeMarksPerQuestion?: number;
    resultVisibility?: ResultVisibilityExam;
    canAttempt?: boolean;
    lockedReason?: LockedReason;
    attemptsAllowed?: number;
    attemptsUsed?: number;
    hasAttempt?: boolean;
    attemptId?: string;
    lastAttemptAt?: string;
};

