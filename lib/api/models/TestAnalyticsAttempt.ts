/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AttemptStatus } from './AttemptStatus';
export type TestAnalyticsAttempt = {
    attemptId: string;
    userId: string;
    status: AttemptStatus;
    startedAt: string;
    submittedAt?: string;
    score?: number;
    totalScore?: number;
    percentage?: number;
};

