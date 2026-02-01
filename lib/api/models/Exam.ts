/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Course } from './Course';
export type Exam = {
    /**
     * Exam ID
     */
    id?: number;
    /**
     * Name of the exam (e.g., UPSC, NEET)
     */
    name?: string;
    /**
     * Description of the exam
     */
    description?: string;
    /**
     * Status of the exam
     */
    status?: Exam.status;
    /**
     * Unique code for the exam
     */
    code?: string;
    /**
     * Start date of the exam
     */
    startDate?: string;
    /**
     * End date of the exam
     */
    endDate?: string;
    /**
     * ID of the business this exam belongs to
     */
    businessId?: number;
    /**
     * Exam creation timestamp
     */
    createdAt?: string;
    /**
     * Exam last update timestamp
     */
    updatedAt?: string;
    /**
     * List of courses under this exam
     */
    courses?: Array<Course>;
};
export namespace Exam {
    /**
     * Status of the exam
     */
    export enum status {
        ACTIVE = 'ACTIVE',
        INACTIVE = 'INACTIVE',
    }
}

