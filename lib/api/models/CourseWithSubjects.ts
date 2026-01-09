/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Subject } from './Subject';
export type CourseWithSubjects = {
    /**
     * Course ID
     */
    id?: number;
    /**
     * Name of the course
     */
    name?: string;
    /**
     * Description of the course
     */
    description?: string;
    /**
     * Duration of the course
     */
    duration?: string;
    /**
     * Whether the course is active
     */
    status?: "ACTIVE" | "INACTIVE";
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
     * List of active subjects under this course
     */
    subjects?: Array<Subject>;
};

