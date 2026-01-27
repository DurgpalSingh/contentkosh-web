/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type BatchUser = {
    /**
     * Batch User ID
     */
    id?: number;
    /**
     * User ID
     */
    userId?: number;
    /**
     * Batch ID
     */
    batchId?: number;
    /**
     * Whether the batch user is active
     */
    isActive?: boolean;
    /**
     * Batch user creation timestamp
     */
    createdAt?: string;
    /**
     * Batch user last update timestamp
     */
    updatedAt?: string;
    user?: {
        /**
         * User ID
         */
        id?: number;
        /**
         * User email
         */
        email?: string;
        /**
         * User name
         */
        name?: string;
    };
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
        /**
         * Batch start date
         */
        startDate?: string;
        /**
         * Batch end date
         */
        endDate?: string;
        /**
         * Whether the batch is active
         */
        isActive?: boolean;
        /**
         * Course ID
         */
        courseId?: number;
        /**
         * Batch creation timestamp
         */
        createdAt?: string;
        /**
         * Batch last update timestamp
         */
        updatedAt?: string;
    };
};

