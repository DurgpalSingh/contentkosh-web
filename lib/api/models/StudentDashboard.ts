/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type StudentDashboard = {
    stats?: {
        /**
         * Number of batches student is enrolled in
         */
        enrolledBatches?: number;
        /**
         * Total content available to student
         */
        totalContent?: number;
        /**
         * Number of currently active announcements for students
         */
        activeAnnouncements?: number;
    };
    /**
     * Batches student is enrolled in
     */
    myBatches?: Array<{
        /**
         * Batch ID
         */
        id?: number;
        /**
         * Batch display name
         */
        displayName?: string;
        /**
         * Course name
         */
        courseName?: string;
        /**
         * Batch start date
         */
        startDate?: string;
        /**
         * Batch end date
         */
        endDate?: string;
        /**
         * Whether batch is active
         */
        isActive?: boolean;
    }>;
    /**
     * Recent active announcements for students
     */
    recentAnnouncements?: Array<{
        /**
         * Announcement ID
         */
        id?: number;
        /**
         * Announcement heading
         */
        heading?: string;
        /**
         * Announcement content
         */
        content?: string;
        /**
         * Announcement start date
         */
        startDate?: string;
        /**
         * Announcement end date
         */
        endDate?: string;
    }>;
    /**
     * Recently added content available to student
     */
    recentContent?: Array<{
        /**
         * Content ID
         */
        id?: number;
        /**
         * Content title
         */
        title?: string;
        /**
         * Batch name
         */
        batchName?: string;
        /**
         * Content type
         */
        type?: 'PDF' | 'IMAGE' | 'DOC';
        /**
         * Content creation timestamp
         */
        createdAt?: string;
    }>;
    /**
     * Recent live or upcoming exam tests for the student dashboard
     */
    recentExams?: Array<{
        id?: string;
        name?: string;
        batchName?: string;
        startAt?: string;
        deadlineAt?: string;
    }>;
};

