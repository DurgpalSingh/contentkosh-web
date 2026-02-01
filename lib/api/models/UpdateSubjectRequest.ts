/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UpdateSubjectRequest = {
    /**
     * Name of the subject
     */
    name?: string;
    /**
     * Description of the subject
     */
    description?: string;
    /**
     * Status of the subject
     */
    status?: UpdateSubjectRequest.status;
};
export namespace UpdateSubjectRequest {
    /**
     * Status of the subject
     */
    export enum status {
        ACTIVE = 'ACTIVE',
        INACTIVE = 'INACTIVE',
    }
}

