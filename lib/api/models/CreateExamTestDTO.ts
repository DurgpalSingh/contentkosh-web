/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ResultVisibilityExam } from './ResultVisibilityExam';
import type { TestLanguage } from './TestLanguage';
import type { TestStatus } from './TestStatus';
export type CreateExamTestDTO = {
    batchId: string;
    name: string;
    description?: string;
    startAt: string;
    deadlineAt: string;
    durationMinutes: number;
    defaultMarksPerQuestion?: number;
    negativeMarksPerQuestion?: number;
    resultVisibility?: ResultVisibilityExam;
    shuffleQuestions?: boolean;
    shuffleOptions?: boolean;
    status?: TestStatus;
    language: TestLanguage;
};

