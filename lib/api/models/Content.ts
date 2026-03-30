/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Content = {
    /**
     * Content ID
     */
    id?: number;
    /**
     * ID of the batch this content belongs to
     */
    batchId?: number;
    /**
     * Title of the content
     */
    title?: string;
    /**
     * Type of the content file
     */
    type?: Content.type;
    /**
     * File path on the server
     */
    filePath?: string;
    /**
     * File size in bytes
     */
    fileSize?: number;
    /**
     * Status of the content
     */
    status?: Content.status;
    /**
     * ID of the user who uploaded the content
     */
    uploadedBy?: number;
    /**
     * ID of the user who last updated the content
     */
    updatedBy?: number;
    /**
     * Content creation timestamp
     */
    createdAt?: string;
    /**
     * Content last update timestamp
     */
    updatedAt?: string;
    batch?: {
        /**
         * Batch ID
         */
        id?: number;
        /**
         * Batch code name
         */
        codeName?: string;
        /**
         * Batch display name
         */
        displayName?: string;
    };
    uploader?: {
        /**
         * User ID
         */
        id?: number;
        /**
         * User name
         */
        name?: string;
        /**
         * User email
         */
        email?: string;
    };
    updater?: {
        /**
         * User ID
         */
        id?: number;
        /**
         * User name
         */
        name?: string;
        /**
         * User email
         */
        email?: string;
    };
};
export namespace Content {
    /**
     * Type of the content file
     */
    export enum type {
        PDF = 'PDF',
        IMAGE = 'IMAGE',
        DOC = 'DOC',
    }
    /**
     * Status of the content
     */
    export enum status {
        ACTIVE = 'ACTIVE',
        INACTIVE = 'INACTIVE',
    }
}
