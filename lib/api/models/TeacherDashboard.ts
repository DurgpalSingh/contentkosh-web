/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type TeacherDashboard = {
    stats?: {
        /**
         * Total number of batches teacher is associated with
         */
        totalBatches?: number;
        /**
         * Total number of students across all batches
         */
        totalStudents?: number;
        /**
         * Total content uploaded by teacher
         */
        totalContent?: number;
        /**
         * Number of currently active announcements for teachers
         */
        activeAnnouncements?: number;
    };
    /**
     * Batches associated with teacher
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
         * Number of students in batch
         */
        studentCount?: number;
        /**
         * Whether batch is active
         */
        isActive?: boolean;
    }>;
    /**
     * Recent active announcements for teachers
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
         * Announcement start date
         */
        startDate?: string;
        /**
         * Announcement end date
         */
        endDate?: string;
    }>;
    /**
     * Recently uploaded content by teacher
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
         * Content creation timestamp
         */
        createdAt?: string;
    }>;
};

