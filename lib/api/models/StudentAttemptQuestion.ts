/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TestQuestion } from './TestQuestion';
/**
 * Per-question row for student attempt detail: display + student answer + optional correct answer when policy allows.
 */
export type StudentAttemptQuestion = {
    question: TestQuestion;
    /**
     * Omitted or null when exam results are withheld before reveal.
     */
    studentAnswer?: {
        selectedOptionIds?: Array<string>;
        textAnswer?: string | null;
        isCorrect?: boolean | null;
        obtainedMarks?: number | null;
    } | null;
    /**
     * Present only after practice submit or when exam result visibility allows.
     */
    correctAnswer?: {
        correctOptionIds?: Array<string>;
        correctTextAnswer?: string | null;
    } | null;
};

