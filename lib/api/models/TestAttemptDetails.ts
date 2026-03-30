/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TestAnswer } from './TestAnswer';
import type { TestAttempt } from './TestAttempt';
import type { TestAttemptSummary } from './TestAttemptSummary';
import type { TestDetailsForAttempt } from './TestDetailsForAttempt';
import type { TestQuestion } from './TestQuestion';
export type TestAttemptDetails = {
    attempt: TestAttempt;
    test: TestDetailsForAttempt;
    questions: Array<TestQuestion>;
    answers?: Array<TestAnswer>;
    summary?: TestAttemptSummary;
};

