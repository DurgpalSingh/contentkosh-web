/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExamAvailableTest } from './ExamAvailableTest';
import type { StudentAttemptQuestion } from './StudentAttemptQuestion';
import type { TestAttempt } from './TestAttempt';
/**
 * Top-level `answers` removed; use `questions[].studentAnswer` and `questions[].correctAnswer` per result visibility.
 */
export type ExamTestAttemptDetails = {
    attempt: TestAttempt;
    test: ExamAvailableTest;
    questions: Array<StudentAttemptQuestion>;
};

