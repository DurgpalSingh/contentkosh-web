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
     * Code for the exam (e.g., UPSC2024)
     */
    code?: string;
    /**
     * Description of the exam
     */
    description?: string;
    /**
     * Status of the exam
     */
    status?: 'ACTIVE' | 'INACTIVE';
    /**
     * Optional start date
     */
    startDate?: string;
    /**
     * Optional end date
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

