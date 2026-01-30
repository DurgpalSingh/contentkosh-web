/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponse } from '../models/ApiResponse';
import type { Course } from '../models/Course';
import type { CreateCourseRequest } from '../models/CreateCourseRequest';
import type { UpdateCourseRequest } from '../models/UpdateCourseRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CoursesService {
    /**
     * Create a new course under an exam
     * @param examId Exam ID
     * @param requestBody
     * @returns any Course created successfully
     * @throws ApiError
     */
    public static postApiExamsCourses(
        examId: number,
        requestBody: CreateCourseRequest,
    ): CancelablePromise<(ApiResponse & {
        data?: Course;
    })> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/exams/{examId}/courses',
            path: {
                'examId': examId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid input data`,
                404: `Exam not found`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Get all courses for an exam
     * @param examId Exam ID
     * @param active Filter by active status (true for active only, false for all)
     * @param fields Comma-separated list of fields to select (e.g. id,name)
     * @param include Comma-separated list of relations to include (e.g. subjects)
     * @returns any Courses fetched successfully
     * @throws ApiError
     */
    public static getApiExamsCourses(
        examId: number,
        active?: boolean,
        fields?: string,
        include?: string,
    ): CancelablePromise<(ApiResponse & {
        data?: Array<Course>;
    })>;
    public static getApiExamsCourses(
        examId: number,
        options: {
            active?: boolean;
            fields?: string;
            include?: string;
        }
    ): CancelablePromise<(ApiResponse & {
        data?: Array<Course>;
    })>;
    public static getApiExamsCourses(
        examId: number,
        arg2?: boolean | { active?: boolean; fields?: string; include?: string },
        arg3?: string,
        arg4?: string,
    ): CancelablePromise<(ApiResponse & {
        data?: Array<Course>;
    })> {
        let active: boolean | undefined;
        let fields: string | undefined;
        let include: string | undefined;

        if (typeof arg2 === 'object' && arg2 !== null) {
            active = arg2.active;
            fields = arg2.fields;
            include = arg2.include;
        } else {
            active = arg2 as boolean | undefined;
            fields = arg3;
            include = arg4;
        }

        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/exams/{examId}/courses',
            path: {
                'examId': examId,
            },
            query: {
                'active': active,
                'fields': fields,
                'include': include,
            },
            errors: {
                400: `Invalid exam ID`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Get course by ID under an exam
     * @param examId Exam ID
     * @param courseId Course ID
     * @param fields Comma-separated list of fields to select (e.g. id,name)
     * @param include Comma-separated list of relations to include (e.g. subjects)
     * @returns any Course fetched successfully
     * @throws ApiError
     */
    public static getApiExamsCourses1(
        examId: number,
        courseId: number,
        fields?: string,
        include?: string,
    ): CancelablePromise<(ApiResponse & {
        data?: Course;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/exams/{examId}/courses/{courseId}',
            path: {
                'examId': examId,
                'courseId': courseId,
            },
            query: {
                'fields': fields,
                'include': include,
            },
            errors: {
                400: `Invalid course ID`,
                404: `Course not found`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Update course under an exam
     * @param examId Exam ID
     * @param courseId Course ID
     * @param requestBody
     * @returns any Course updated successfully
     * @throws ApiError
     */
    public static putApiExamsCourses(
        examId: number,
        courseId: number,
        requestBody: UpdateCourseRequest,
    ): CancelablePromise<(ApiResponse & {
        data?: Course;
    })> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/exams/{examId}/courses/{courseId}',
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
     * Delete course under an exam
     * @param examId Exam ID
     * @param courseId Course ID
     * @returns any Course deleted successfully
     * @throws ApiError
     */
    public static deleteApiExamsCourses(
        examId: number,
        courseId: number,
    ): CancelablePromise<(ApiResponse & {
        data?: any;
    })> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/exams/{examId}/courses/{courseId}',
            path: {
                'examId': examId,
                'courseId': courseId,
            },
            errors: {
                400: `Invalid course ID`,
                500: `Internal server error`,
            },
        });
    }
}
