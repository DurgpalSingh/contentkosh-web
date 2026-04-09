import type { Announcement } from '../models/Announcement';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export interface CreateAnnouncementPayload {
  heading: string;
  content: string;
  startDate: string;
  endDate: string;
  courseId?: number | null;
  batchId?: number | null;
  visibleToTeachers: boolean;
  visibleToStudents: boolean;
  isActive?: boolean;
}

export interface UpdateAnnouncementPayload {
  heading?: string;
  content?: string;
  startDate?: string;
  endDate?: string;
  courseId?: number | null;
  batchId?: number | null;
  visibleToTeachers?: boolean;
  visibleToStudents?: boolean;
  isActive?: boolean;
}

export class AnnouncementsService {
  /** POST /api/announcements — create (ADMIN, SUPERADMIN, TEACHER) */
  public static create(body: CreateAnnouncementPayload): CancelablePromise<{ data?: Announcement }> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/announcements',
      body,
      mediaType: 'application/json',
    });
  }

  /** GET /api/announcements/my — role-filtered list for current user */
  public static getMyAnnouncements(): CancelablePromise<{ data?: Announcement[] }> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/announcements/my',
    });
  }

  /** GET /api/announcements — management list (ADMIN: all, TEACHER: own) */
  public static list(): CancelablePromise<{ data?: Announcement[] }> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/announcements',
    });
  }

  /** PUT /api/announcements/:id */
  public static update(id: number, body: UpdateAnnouncementPayload): CancelablePromise<{ data?: Announcement }> {
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/api/announcements/{id}',
      path: { id },
      body,
      mediaType: 'application/json',
    });
  }

  /** DELETE /api/announcements/:id — ADMIN/SUPERADMIN only */
  public static remove(id: number): CancelablePromise<{ data?: null }> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/api/announcements/{id}',
      path: { id },
    });
  }
}
