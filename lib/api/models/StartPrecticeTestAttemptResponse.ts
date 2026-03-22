/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PracticeAvailableTest } from './PracticeAvailableTest';
import type { TestQuestion } from './TestQuestion';
export type StartPrecticeTestAttemptResponse = {
    attemptId: string;
    test: PracticeAvailableTest;
    questions: Array<TestQuestion>;
    startedAt: string;
};

