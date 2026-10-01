/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SubjectiveDisplayStatus } from './SubjectiveDisplayStatus';
export type SubjectiveRosterRow = {
    studentId: number;
    studentName: string;
    studentEmail: string;
    submissionId?: string | null;
    displayStatus: SubjectiveDisplayStatus;
    startedAt?: string | null;
    submittedAt?: string | null;
    marksAwarded?: number | null;
    checkedAt?: string | null;
};

