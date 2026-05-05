import type { AnnouncementScope } from './AnnouncementScope';
import type { AnnouncementTarget } from './AnnouncementTarget';

export type Announcement = {
  id?: number;
  heading?: string;
  content?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  businessId?: number;
  visibleToAdmins?: boolean;
  visibleToTeachers?: boolean;
  visibleToStudents?: boolean;
  scope?: AnnouncementScope;
  targetAllCourses?: boolean;
  targetAllBatches?: boolean;
  createdBy?: number | null;
  updatedBy?: number | null;
  createdAt?: string;
  updatedAt?: string;
  targets?: AnnouncementTarget[];
  createdByUser?: {
    id?: number;
    name?: string;
    email?: string;
  } | null;
  business?: {
    id?: number;
    instituteName?: string;
  };
};
