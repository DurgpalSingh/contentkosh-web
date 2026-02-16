/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
 
export type CreateAnnouncementRequest = {
    /**
     * Title of the announcement (required)
     */
    heading: string;
    /**
     * Description of the announcement (required)
     */
    content: string;
    /**
     * Start date of the announcement period (required)
     */
    startDate: string;
    /**
     * End date of the announcement period (required)
     */
    endDate: string;
    /**
     * Whether the announcement is active
     */
    isActive?: boolean;
    /**
     * ID of the business this announcement belongs to (required)
     */
    businessId: number;
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
};

