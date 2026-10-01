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
    /**
     * The student's original PDF name
     */
    answerSheetName?: string | null;
    marksAwarded?: number | null;
    remarks?: string | null;
    hasCheckedAnswerSheet: boolean;
    checkedAt?: string | null;
};

