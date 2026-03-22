/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TestAnalyticsAttempt } from './TestAnalyticsAttempt';
export type TestAnalytics = {
    totalAttempts?: number;
    averageScore?: number;
    averagePercentage?: number;
    passRate?: number;
    highestScore?: number;
    lowestScore?: number;
    attempts?: Array<TestAnalyticsAttempt>;
    questionStats?: Array<{
        questionId?: string;
        correctCount?: number;
        totalAttempts?: number;
        accuracy?: number;
    }>;
};

