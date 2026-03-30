/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExamAvailableTest } from './ExamAvailableTest';
import type { TestQuestion } from './TestQuestion';
export type StartExamTestAttemptResponse = {
    attemptId: string;
    test: ExamAvailableTest;
    questions: Array<TestQuestion>;
    startedAt: string;
};

