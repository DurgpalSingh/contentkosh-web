/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SubjectiveDisplayStatus } from './SubjectiveDisplayStatus';
export type SubjectiveStaffSubmission = {
    id: string;
    subjectiveTestId: string;
    student?: {
        id?: number;
        name?: string;
        email?: string;
    } | null;
    displayStatus: SubjectiveDisplayStatus;
    startedAt: string;
    effectiveDeadlineAt: string;
    submittedAt?: string | null;
    hasAnswerSheet: boolean;
    marksAwarded?: number | null;
    remarks?: string | null;
    hasCheckedAnswerSheet: boolean;
    checkedBy?: number | null;
    checkedAt?: string | null;
};

