/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AttemptStatus } from './AttemptStatus';
import type { TestLanguage } from './TestLanguage';
export type TestAttempt = {
    id: string;
    /**
     * Deprecated. Use practiceTestId or examTestId.
     * @deprecated
     */
    testId?: string;
    practiceTestId?: string;
    examTestId?: string;
    userId?: string;
    language: TestLanguage;
    status: AttemptStatus;
    startedAt: string;
    submittedAt?: string;
    score?: number;
    totalScore?: number;
    percentage?: number;
};

