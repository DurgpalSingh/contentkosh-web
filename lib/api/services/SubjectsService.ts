/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponse } from '../models/ApiResponse';
import type { CreateSubjectRequest } from '../models/CreateSubjectRequest';
import type { Subject } from '../models/Subject';
import type { UpdateSubjectRequest } from '../models/UpdateSubjectRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SubjectsService {
    /**
     * Create a new subject under a course
     * @param examId Exam ID
     * @param courseId Course ID
     * @param requestBody
     * @returns any Subject created successfully
     * @throws ApiError
     */
    public static postApiExamsCoursesSubjects(
        examId: number,
        courseId: number,
        requestBody: CreateSubjectRequest,
    ): CancelablePromise<(ApiResponse & {
        data?: Subject;
    })> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/exams/{examId}/courses/{courseId}/subjects',
            path: {
                'examId': examId,
                'courseId': courseId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid input data`,
                404: `Course not found`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Get all subjects for a course
     * @param examId Exam ID
     * @param courseId Course ID
     * @param active Filter by active status (true for active only, false for all)
     * @returns any Subjects fetched successfully
     * @throws ApiError
     */
    public static getApiExamsCoursesSubjects(
        examId: number,
        courseId: number,
        active?: boolean,
    ): CancelablePromise<(ApiResponse & {
        data?: Array<Subject>;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/exams/{examId}/courses/{courseId}/subjects',
            path: {
                'examId': examId,
                'courseId': courseId,
            },
            query: {
                'active': active,
            },
            errors: {
                400: `Invalid course ID`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Get subject by ID under a course
     * @param examId Exam ID
     * @param courseId Course ID
     * @param subjectId Subject ID
     * @returns any Subject fetched successfully
     * @throws ApiError
     */
    public static getApiExamsCoursesSubjects1(
        examId: number,
        courseId: number,
        subjectId: number,
    ): CancelablePromise<(ApiResponse & {
        data?: Subject;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/exams/{examId}/courses/{courseId}/subjects/{subjectId}',
            path: {
                'examId': examId,
                'courseId': courseId,
                'subjectId': subjectId,
            },
            errors: {
                400: `Invalid subject ID`,
                404: `Subject not found`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Update subject under a course
     * @param examId Exam ID
     * @param courseId Course ID
     * @param subjectId Subject ID
     * @param requestBody
     * @returns any Subject updated successfully
     * @throws ApiError
     */
    public static putApiExamsCoursesSubjects(
        examId: number,
        courseId: number,
        subjectId: number,
        requestBody: UpdateSubjectRequest,
    ): CancelablePromise<(ApiResponse & {
        data?: Subject;
    })> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/exams/{examId}/courses/{courseId}/subjects/{subjectId}',
            path: {
                'examId': examId,
                'courseId': courseId,
                'subjectId': subjectId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid input data`,
                404: `Subject not found`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Delete subject under a course
     * @param examId Exam ID
     * @param courseId Course ID
     * @param subjectId Subject ID
     * @returns any Subject deleted successfully
     * @throws ApiError
     */
    public static deleteApiExamsCoursesSubjects(
        examId: number,
        courseId: number,
        subjectId: number,
    ): CancelablePromise<(ApiResponse & {
        data?: any;
    })> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/exams/{examId}/courses/{courseId}/subjects/{subjectId}',
            path: {
                'examId': examId,
                'courseId': courseId,
                'subjectId': subjectId,
            },
            errors: {
                400: `Invalid subject ID`,
                500: `Internal server error`,
            },
        });
    }

    /**
     * Get subjects available for a user (role-aware)
     */
    public static getApiSubjectsUser(): CancelablePromise<(ApiResponse & {
        data?: Array<Subject>;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/business/subjects/all',
            errors: {
                400: `Invalid user ID`,
                403: `Forbidden`,
                404: `User not found`,
                500: `Internal server error`,
            },
        });
    }
}
