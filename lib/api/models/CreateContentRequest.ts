/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateContentRequest = {
    /** File to upload (binary) */
    file: Blob;
    /** Title of the content (required) */
    title: string;
    /** Status of the content */
    status?: CreateContentRequest.status;
};
export namespace CreateContentRequest {
    /**
     * Status of the content
     */
    export enum status {
        ACTIVE = 'ACTIVE',
        INACTIVE = 'INACTIVE',
    }
}
