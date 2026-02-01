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
     * Status of the subject
     */
    status?: CreateSubjectRequest.status;
    /**
     * ID of the course this subject belongs to (required)
     */
    courseId: number;
};
export namespace CreateSubjectRequest {
    /**
     * Status of the subject
     */
    export enum status {
        ACTIVE = 'ACTIVE',
        INACTIVE = 'INACTIVE',
    }
}

