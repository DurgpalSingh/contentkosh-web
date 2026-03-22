/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { QuestionType } from './QuestionType';
import type { TestOption } from './TestOption';
export type TestQuestion = {
    id: string;
    type: QuestionType;
    questionText: string;
    /**
     * Deprecated. Use questionText instead.
     * @deprecated
     */
    text?: string;
    mediaUrl?: string;
    options?: Array<TestOption>;
};

