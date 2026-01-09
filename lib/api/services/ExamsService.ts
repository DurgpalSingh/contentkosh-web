/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponse } from '../models/ApiResponse';
import type { CreateExamRequest } from '../models/CreateExamRequest';
import type { Exam } from '../models/Exam';
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
    public static postApiBusinessExams({
        businessId,
        requestBody,
    }: {
        /**
         * Business ID
         */
        businessId: number;
        requestBody: CreateExamRequest;
    }): CancelablePromise<(ApiResponse & {
        data?: Exam;
    })> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/business/{businessId}/exams',
            path: {
                'businessId': businessId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid input data`,
                404: `Business not found`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * List exams for a business
     * @returns any Exams fetched successfully
     * @throws ApiError
     */
    public static getApiBusinessExams({
        businessId,
        include,
    }: {
        /**
         * Business ID
         */
        businessId: number,
        /**
         * Comma-separated list of relations to include
         */
        include?: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/business/{businessId}/exams',
            path: {
                'businessId': businessId,
            },
            query: {
                'include': include,
            },
            errors: {
                400: `Invalid Business ID`,
                404: `Business not found`,
            },
        });
    }
    /**
     * Get exam by ID
     * @param id Exam ID
     * @returns any Exam fetched successfully
     * @throws ApiError
     */
    public static getApiBusinessExams1({
        businessId,
        id,
        fields,
        include,
    }: {
        /**
         * Business ID
         */
        businessId: number,
        /**
         * Exam ID
         */
        id: number,
        /**
         * Comma-separated list of fields to select
         */
        fields?: string,
        /**
         * Comma-separated list of relations to include
         */
        include?: string,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/business/{businessId}/exams/{id}',
            path: {
                'businessId': businessId,
                'id': id,
            },
            query: {
                'fields': fields,
                'include': include,
            },
            errors: {
                404: `Exam not found`,
            },
        });
    }
    /**
     * Update exam under a business
     * @returns any Exam updated successfully
     * @throws ApiError
     */
    public static putApiBusinessExams({
        businessId,
        id,
        requestBody,
    }: {
        /**
         * Business ID
         */
        businessId: number,
        /**
         * Exam ID
         */
        id: number,
        requestBody: UpdateExamRequest,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/business/{businessId}/exams/{id}',
            path: {
                'businessId': businessId,
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Exam not found`,
            },
        });
    }
    /**
     * Delete exam under a business
     * @returns any Exam deleted successfully
     * @throws ApiError
     */
    public static deleteApiBusinessExams({
        businessId,
        id,
    }: {
        /**
         * Business ID
         */
        businessId: number,
        /**
         * Exam ID
         */
        id: number,
    }): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/business/{businessId}/exams/{id}',
            path: {
                'businessId': businessId,
                'id': id,
            },
            errors: {
                404: `Exam not found`,
            },
        });
    }
}