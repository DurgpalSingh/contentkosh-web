/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponse } from '../models/ApiResponse';
import type { CreateExamRequest } from '../models/CreateExamRequest';
import type { Exam } from '../models/Exam';
import type { ExamWithCourses } from '../models/ExamWithCourses';
import type { UpdateExamRequest } from '../models/UpdateExamRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ExamsService {
    /**
     * Create a new exam
     * @param requestBody
     * @returns any Exam created successfully
     * @throws ApiError
     */
    public static postApiExams(
        requestBody: CreateExamRequest,
    ): CancelablePromise<(ApiResponse & {
        data?: Exam;
    })> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/exams',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid input data`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Get exam by ID
     * @param id Exam ID
     * @returns any Exam fetched successfully
     * @throws ApiError
     */
    public static getApiExams(
        id: number,
    ): CancelablePromise<(ApiResponse & {
        data?: Exam;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/exams/{id}',
            path: {
                'id': id,
            },
            errors: {
                400: `Invalid exam ID`,
                404: `Exam not found`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Update exam
     * @param id Exam ID
     * @param requestBody
     * @returns any Exam updated successfully
     * @throws ApiError
     */
    public static putApiExams(
        id: number,
        requestBody: UpdateExamRequest,
    ): CancelablePromise<(ApiResponse & {
        data?: Exam;
    })> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/exams/{id}',
            path: {
                'id': id,
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
     * Delete exam
     * @param id Exam ID
     * @returns any Exam deleted successfully
     * @throws ApiError
     */
    public static deleteApiExams(
        id: number,
    ): CancelablePromise<(ApiResponse & {
        data?: any;
    })> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/exams/{id}',
            path: {
                'id': id,
            },
            errors: {
                400: `Invalid exam ID`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Get exam with its courses
     * @param id Exam ID
     * @returns any Exam with courses fetched successfully
     * @throws ApiError
     */
    public static getApiExamsWithCourses(
        id: number,
    ): CancelablePromise<(ApiResponse & {
        data?: ExamWithCourses;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/exams/{id}/with-courses',
            path: {
                'id': id,
            },
            errors: {
                400: `Invalid exam ID`,
                404: `Exam not found`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Get all exams for a business
     * @param businessId Business ID
     * @param active Filter by active status (true for active only, false for all)
     * @returns any Exams fetched successfully
     * @throws ApiError
     */
    public static getExamByBusiness(
        businessId: number,
        active?: boolean,
    ): CancelablePromise<(ApiResponse & {
        data?: Array<Exam>;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/exams',
            query: {
                'businessId': businessId,
                'active': active,
            },
            errors: {
                400: `Invalid business ID`,
                500: `Internal server error`,
            },
        });
    }
}
