/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Content = {
    id?: number;
    batchId: number;
    title: string;
    type: Content.type;
    filePath: string;
    fileSize: number;
    status?: Content.status;
    uploadedBy?: number;
    updatedBy?: number;
    createdAt?: string;
    updatedAt?: string;
};

export namespace Content {
    /**
     * Status of the content
     */
    export enum status {
        ACTIVE = 'ACTIVE',
        INACTIVE = 'INACTIVE',
    }
}
export namespace Content {
    /**
     * Type of the content
     */
    export enum type {
        PDF = 'PDF',
        IMAGE = 'IMAGE',
    }
}
