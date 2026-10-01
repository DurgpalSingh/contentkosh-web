/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SubjectiveAvailableTest } from './SubjectiveAvailableTest';
import type { SubjectiveDisplayStatus } from './SubjectiveDisplayStatus';
import type { SubjectiveResult } from './SubjectiveResult';
export type SubjectiveStudentSubmission = {
    submissionId: string;
    test: SubjectiveAvailableTest;
    displayStatus: SubjectiveDisplayStatus;
    startedAt: string;
    effectiveDeadlineAt: string;
    submittedAt?: string | null;
    hasAnswerSheet: boolean;
    /**
     * Present only once the submission is CHECKED
     */
    result?: SubjectiveResult | null;
};

