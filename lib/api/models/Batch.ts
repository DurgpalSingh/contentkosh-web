/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
 
export type Batch = {
    /**
     * Batch ID
     */
    id?: number;
    /**
     * Unique code name for the batch
     */
    codeName?: string;
    /**
     * Display name for the batch
     */
    displayName?: string;
    /**
     * Start date of the batch
     */
    startDate?: string;
    /**
     * End date of the batch
     */
    endDate?: string;
    /**
     * Whether the batch is active
     */
    isActive?: boolean;
    /**
     * ID of the course this batch belongs to
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
    course?: {
        /**
         * Course ID
         */
        id?: number;
        /**
         * Course name
         */
        name?: string;
    };
};

