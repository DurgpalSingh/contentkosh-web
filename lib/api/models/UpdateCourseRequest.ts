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
     * Optional start date
     */
    startDate?: string;
    /**
     * Optional end date
     */
    endDate?: string;
    /**
     * Whether the course is active
     */
    status?: "ACTIVE" | "INACTIVE";
};

