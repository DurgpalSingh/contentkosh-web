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
     * Course thumbnail URL or file path
     */
    thumbnail?: string | null;
    /**
     * Course price as a whole number. Use 0 for free courses.
     */
    price?: number;
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

