import { OpenAPI } from '../core/OpenAPI';
import { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';
import type {
  CreateTeacherRequest,
  UpdateTeacherRequest,
  TeacherResponse,
} from '../models/Teacher';

export class TeachersService {
  /**
   * Create a new teacher profile
   * POST /api/teachers/profile
   */
  public static postApiTeachersProfile(
    requestBody: CreateTeacherRequest,
  ): CancelablePromise<TeacherResponse> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/teachers/profile',
      body: requestBody,
    });
  }

  /**
   * Get teacher profile by ID
   * GET /api/teachers/{teacherId}
   */
  public static getApiTeachers(teacherId: number): CancelablePromise<TeacherResponse> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/teachers/{teacherId}',
      path: {
        teacherId: teacherId,
      },
    });
  }

  /**
   * Get teacher profile by User ID
   * GET /api/teachers/user/{userId}
   */
  public static getApiTeachersByUserId(userId: number): CancelablePromise<TeacherResponse> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/teachers/user/{userId}',
      path: {
        userId: userId,
      },
    });
  }


  /**
   * Update teacher profile
   * PUT /api/teachers/{teacherId}
   */
  public static putApiTeachers(
    teacherId: number,
    requestBody: UpdateTeacherRequest,
  ): CancelablePromise<TeacherResponse> {
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/api/teachers/{teacherId}',
      path: {
        teacherId: teacherId,
      },
      body: requestBody,
    });
  }
}