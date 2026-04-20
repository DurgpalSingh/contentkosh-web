import { OpenAPI } from '../core/OpenAPI';
import { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';
import type { CreateStudentRequest, UpdateStudentRequest, StudentResponse } from '../models/Student';

export class StudentsService {
  /**
   * Create a new student profile
   * POST /api/students/profile
   */
  public static postApiStudentsProfile(
    requestBody: CreateStudentRequest,
  ): CancelablePromise<StudentResponse> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/students/profile',
      body: requestBody,
    });
  }

  /**
   * Get student profile by ID
   * GET /api/students/{studentId}
   */
  public static getApiStudents(studentId: number): CancelablePromise<StudentResponse> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/students/{studentId}',
      path: {
        studentId: studentId,
      },
    });
  }

  /**
   * Get student profile by User ID
   * GET /api/students/user/{userId}
   */
  public static getApiStudentsByUserId(userId: number): CancelablePromise<StudentResponse> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/students/user/{userId}',
      path: {
        userId: userId,
      },
    });
  }

  /**
   * Update student profile
   * PUT /api/students/{studentId}
   */
  public static putApiStudents(
    studentId: number,
    requestBody: UpdateStudentRequest,
  ): CancelablePromise<StudentResponse> {
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/api/students/{studentId}',
      path: {
        studentId: studentId,
      },
      body: requestBody,
    });
  }
}
