/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateBatchRequest = {
    /**
     * Unique code name for the batch (required)
     */
    codeName: string;
    /**
     * Display name for the batch (required)
     */
    displayName: string;
    /**
     * Start date of the batch (required)
     */
    startDate: string;
    /**
     * End date of the batch (required)
     */
    endDate: string;
    /**
     * Whether the batch is active
     */
    isActive?: boolean;
    /**
     * ID of the course this batch belongs to (required)
     */
    courseId: number;
};

