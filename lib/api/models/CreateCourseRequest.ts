/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateCourseRequest = {
    /**
     * Name of the course (required)
     */
    name: string;
    /**
     * Description of the course
     */
    description?: string;
    /**
     * Duration of the course (e.g., 6 months, 1 year)
     */
    duration?: string;
    /**
     * Whether the course is active
     */
    status?: "ACTIVE" | "INACTIVE";
    /**
     * ID of the exam this course belongs to (required)
     */
    examId: number;
};

