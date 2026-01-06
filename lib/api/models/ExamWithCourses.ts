/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Course } from './Course';
export type ExamWithCourses = {
    /**
     * Exam ID
     */
    id?: number;
    /**
     * Name of the exam
     */
    name?: string;
    /**
     * Code for the exam
     */
    code?: string;
    /**
     * Description of the exam
     */
    description?: string;
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
     * List of active courses under this exam
     */
    courses?: Array<Course>;
};

