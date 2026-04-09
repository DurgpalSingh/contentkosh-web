import type { AnnouncementScope } from './AnnouncementScope';

export type CreateAnnouncementRequest = {
  heading: string;
  content: string;
  startDate: string;
  endDate: string;
  isActive?: boolean;
  visibleToAdmins?: boolean;
  visibleToTeachers?: boolean;
  visibleToStudents?: boolean;
  scope: AnnouncementScope;
  targetAllCourses?: boolean;
  targetAllBatches?: boolean;
  courseIds?: number[];
  batchIds?: number[];
};
