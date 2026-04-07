/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TestLanguage } from './TestLanguage';
import type { TestStatus } from './TestStatus';
export type UpdatePracticeTestDTO = {
    name?: string;
    description?: string;
    defaultMarksPerQuestion?: number;
    showExplanations?: boolean;
    shuffleQuestions?: boolean;
    shuffleOptions?: boolean;
    status?: TestStatus;
    language?: TestLanguage;
};

