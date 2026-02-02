/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Content = {
    id?: number;
    batchId: number;
    title: string;
    type: "PDF" | "IMAGE";
    filePath: string;
    fileSize: number;
    status?: "ACTIVE" | "INACTIVE";
    uploadedBy?: number;
    updatedBy?: number;
    createdAt?: string;
    updatedAt?: string;
};
