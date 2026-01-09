/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateSubjectRequest = {
    /**
     * Name of the subject (required)
     */
    name: string;
    /**
     * Description of the subject
     */
    description?: string;
    /**
     * Whether the subject is active
     */
    status?: "ACTIVE" | "INACTIVE";
    /**
     * ID of the course this subject belongs to (required)
     */
    courseId: number;
};

