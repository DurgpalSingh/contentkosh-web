/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Subject } from './Subject';
export type Course = {
    /**
     * Course ID
     */
    id?: number;
    /**
     * Name of the course (e.g., Civil Services Course)
     */
    name?: string;
    /**
     * Description of the course
     */
    description?: string;
    /**
     * Duration of the course (e.g., 6 months, 1 year)
     */
    duration?: string;
    /**
     * Status of the course
     */
    status?: Course.status;
    /**
     * ID of the exam this course belongs to
     */
    examId?: number;
    /**
     * Course creation timestamp
     */
    createdAt?: string;
    /**
     * Course last update timestamp
     */
    updatedAt?: string;
    /**
     * List of subjects under this course
     */
    subjects?: Array<Subject>;
};
export namespace Course {
    /**
     * Status of the course
     */
    export enum status {
        ACTIVE = 'ACTIVE',
        INACTIVE = 'INACTIVE',
    }
}

