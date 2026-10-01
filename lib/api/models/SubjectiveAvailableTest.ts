/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SubjectiveAvailability } from './SubjectiveAvailability';
import type { SubjectiveDisplayStatus } from './SubjectiveDisplayStatus';
export type SubjectiveAvailableTest = {
    id: string;
    batchId: number;
    batchName?: string;
    subjectId?: number | null;
    subjectName?: string | null;
    name: string;
    paperType: string;
    description?: string | null;
    instructions?: string | null;
    totalMarks: number;
    durationMinutes: number;
    startAt: string;
    deadlineAt: string;
    hasQuestionPaper: boolean;
    availability: SubjectiveAvailability;
    displayStatus: SubjectiveDisplayStatus;
    submissionId?: string | null;
    effectiveDeadlineAt?: string | null;
};

