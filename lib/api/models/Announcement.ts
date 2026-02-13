/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
 
export type Announcement = {
    /**
     * Announcement ID
     */
    id?: number;
    /**
     * Title of the announcement
     */
    heading?: string;
    /**
     * Description of the announcement
     */
    content?: string;
    /**
     * Start date of the announcement period
     */
    startDate?: string;
    /**
     * End date of the announcement period
     */
    endDate?: string;
    /**
     * Whether the announcement is active
     */
    isActive?: boolean;
    /**
     * ID of the business this announcement belongs to
     */
    businessId?: number;
    /**
     * Whether the announcement is visible to admins
     */
    visibleToAdmins?: boolean;
    /**
     * Whether the announcement is visible to teachers
     */
    visibleToTeachers?: boolean;
    /**
     * Whether the announcement is visible to students
     */
    visibleToStudents?: boolean;
    /**
     * Announcement creation timestamp
     */
    createdAt?: string;
    /**
     * Announcement last update timestamp
     */
    updatedAt?: string;
    business?: {
        /**
         * Business ID
         */
        id?: number;
        /**
         * Business institute name
         */
        instituteName?: string;
    };
};

