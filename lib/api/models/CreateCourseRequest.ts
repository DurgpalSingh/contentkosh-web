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
     * Status of the course
     */
    status?: CreateCourseRequest.status;
    /**
     * Start date of the course
     */
    startDate?: string;
    /**
     * End date of the course
     */
    endDate?: string;
    /**
     * ID of the exam this course belongs to (required)
     */
    examId: number;
};
export namespace CreateCourseRequest {
    /**
     * Status of the course
     */
    export enum status {
        ACTIVE = 'ACTIVE',
        INACTIVE = 'INACTIVE',
    }
}

