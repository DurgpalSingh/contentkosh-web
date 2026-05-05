import type { Announcement } from '../models/Announcement';
import type { ApiResponse } from '../models/ApiResponse';
import type { CreateAnnouncementRequest } from '../models/CreateAnnouncementRequest';
import type { UpdateAnnouncementRequest } from '../models/UpdateAnnouncementRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class AnnouncementsService {
  public static getUserAnnouncementBundle(): CancelablePromise<
    ApiResponse & {
      data?: { received?: Announcement[]; managed?: Announcement[] };
    }
  > {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/announcements/user',
    });
  }

  public static getMyAnnouncements(): CancelablePromise<
    ApiResponse & { data?: Announcement[] }
  > {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/announcements',
    });
  }

  public static getManagedAnnouncements(): CancelablePromise<
    ApiResponse & { data?: Announcement[] }
  > {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/announcements/managed',
    });
  }

  public static createAnnouncement(
    requestBody: CreateAnnouncementRequest,
  ): CancelablePromise<ApiResponse & { data?: Announcement }> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/announcements',
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  public static getAnnouncementById(
    id: number,
  ): CancelablePromise<ApiResponse & { data?: Announcement }> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/announcements/{id}',
      path: { id },
    });
  }

  public static updateAnnouncement(
    id: number,
    requestBody: UpdateAnnouncementRequest,
  ): CancelablePromise<ApiResponse & { data?: Announcement }> {
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/api/announcements/{id}',
      path: { id },
      body: requestBody,
      mediaType: 'application/json',
    });
  }

  public static deleteAnnouncement(id: number): CancelablePromise<ApiResponse> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/api/announcements/{id}',
      path: { id },
    });
  }
}
