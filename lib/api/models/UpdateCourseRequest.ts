/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UpdateCourseRequest = {
    /**
     * Name of the course
     */
    name?: string;
    /**
     * Description of the course
     */
    description?: string;
    /**
     * Course thumbnail URL or file path
     */
    thumbnail?: string | null;
    /**
     * Clear the existing course thumbnail
     */
    removeThumbnail?: boolean;
    /**
     * Course price as a whole number. Use 0 for free courses.
     */
    price?: number;
    /**
     * Status of the course
     */
    status?: UpdateCourseRequest.status;
    /**
     * Start date of the course
     */
    startDate?: string;
    /**
     * End date of the course
     */
    endDate?: string;
};
export namespace UpdateCourseRequest {
    /**
     * Status of the course
     */
    export enum status {
        ACTIVE = 'ACTIVE',
        INACTIVE = 'INACTIVE',
    }
}

