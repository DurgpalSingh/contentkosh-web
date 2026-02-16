/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
 
export type UpdateAnnouncementRequest = {
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

