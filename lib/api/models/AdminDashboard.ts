/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type AdminDashboard = {
    stats?: {
        /**
         * Total number of active users
         */
        totalUsers?: number;
        /**
         * Total number of active teachers
         */
        totalTeachers?: number;
        /**
         * Total number of active students
         */
        totalStudents?: number;
        /**
         * Total number of exams
         */
        totalExams?: number;
        /**
         * Total number of courses
         */
        totalCourses?: number;
        /**
         * Total number of batches
         */
        totalBatches?: number;
        /**
         * Total number of content items
         */
        totalContent?: number;
        /**
         * Number of currently active announcements
         */
        activeAnnouncements?: number;
    };
    /**
     * Recently created users
     */
    recentUsers?: Array<{
        /**
         * User ID
         */
        id?: number;
        /**
         * User name
         */
        name?: string;
        /**
         * User email
         */
        email?: string;
        /**
         * User role
         */
        role?: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'USER';
        /**
         * User creation timestamp
         */
        createdAt?: string;
    }>;
    /**
     * Recent active announcements
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
};

