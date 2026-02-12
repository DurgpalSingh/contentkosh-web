/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UpdateContentRequest = {
    /** Updated title */
    title?: string;
    /** Updated status */
    status?: UpdateContentRequest.status;
};
export namespace UpdateContentRequest {
    /**
     * Status of the content
     */
    export enum status {
        ACTIVE = 'ACTIVE',
        INACTIVE = 'INACTIVE',
    }
}
