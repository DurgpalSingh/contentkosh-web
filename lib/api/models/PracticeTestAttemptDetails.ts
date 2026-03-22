/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PracticeAvailableTest } from './PracticeAvailableTest';
import type { StudentAttemptQuestion } from './StudentAttemptQuestion';
import type { TestAttempt } from './TestAttempt';
/**
 * Top-level `answers` removed; use `questions[].studentAnswer` and `questions[].correctAnswer`.
 */
export type PracticeTestAttemptDetails = {
    attempt: TestAttempt;
    test: PracticeAvailableTest;
    questions: Array<StudentAttemptQuestion>;
};

