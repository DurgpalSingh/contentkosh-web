/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

export type Announcement = {
  id?: number;
  heading?: string;
  content?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  businessId?: number;
  courseId?: number | null;
  batchId?: number | null;
  createdBy?: number;
  updatedBy?: number | null;
  visibleToAdmins?: boolean;
  visibleToTeachers?: boolean;
  visibleToStudents?: boolean;
  createdAt?: string;
  updatedAt?: string;
};
