/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponse } from '../models/ApiResponse';
import type { Business } from '../models/Business';
import type { CreateBusinessRequest } from '../models/CreateBusinessRequest';
import type { CreateExamRequest } from '../models/CreateExamRequest';
import type { Exam } from '../models/Exam';
import type { UpdateBusinessRequest } from '../models/UpdateBusinessRequest';
import type { UpdateExamRequest } from '../models/UpdateExamRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class BusinessService {
    /**
     * Create exam under business
     * @param businessId Business ID
     * @param requestBody
     * @returns any Exam created successfully
     * @throws ApiError
     */
    public static postApiBusinessExams(
        businessId: number,
        requestBody: CreateExamRequest,
    ): CancelablePromise<(ApiResponse & {
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
                500: `Internal server error`,
            },
        });
    }
    /**
     * List exams for a business
     * @param businessId Business ID
     * @returns any Exams fetched successfully
     * @throws ApiError
     */
    public static getApiBusinessExams(
        businessId: number,
    ): CancelablePromise<(ApiResponse & {
        data?: Array<Exam>;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/business/{businessId}/exams',
            path: {
                'businessId': businessId,
            },
            errors: {
                400: `Invalid Business ID`,
                404: `Business not found`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Get exam by ID under a business
     * @param businessId Business ID
     * @param id Exam ID
     * @param fields Comma-separated list of fields to select
     * @param include Comma-separated list of relations to include
     * @returns any Exam fetched successfully
     * @throws ApiError
     */
    public static getApiBusinessExams1(
        businessId: number,
        id: number,
        fields?: string,
        include?: string,
    ): CancelablePromise<(ApiResponse & {
        data?: Exam;
    })> {
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
                500: `Internal server error`,
            },
        });
    }
    /**
     * Update exam under a business
     * @param businessId Business ID
     * @param id Exam ID
     * @param requestBody
     * @returns any Exam updated successfully
     * @throws ApiError
     */
    public static putApiBusinessExams(
        businessId: number,
        id: number,
        requestBody: UpdateExamRequest,
    ): CancelablePromise<(ApiResponse & {
        data?: Exam;
    })> {
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
                400: `Invalid input data`,
                404: `Exam not found`,
                409: `Exam name already exists`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Delete exam under a business
     * @param businessId Business ID
     * @param id Exam ID
     * @returns any Exam deleted successfully
     * @throws ApiError
     */
    public static deleteApiBusinessExams(
        businessId: number,
        id: number,
    ): CancelablePromise<(ApiResponse & {
        data?: any;
    })> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/business/{businessId}/exams/{id}',
            path: {
                'businessId': businessId,
                'id': id,
            },
            errors: {
                404: `Exam not found`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Create business configuration
     * @param requestBody
     * @returns any Business created successfully
     * @throws ApiError
     */
    public static postApiBusiness(
        requestBody: CreateBusinessRequest,
    ): CancelablePromise<(ApiResponse & {
        data?: Business;
    })> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/business',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid input data`,
                409: `Business configuration already exists`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Get business configuration
     * @returns any Business fetched successfully
     * @throws ApiError
     */
    public static getApiBusiness(): CancelablePromise<(ApiResponse & {
        data?: Business;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/business',
            errors: {
                404: `No business configuration found`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Get business configuration by ID
     * @param id Business ID
     * @returns any Business fetched successfully
     * @throws ApiError
     */
    public static getApiBusiness1(
        id: number,
    ): CancelablePromise<(ApiResponse & {
        data?: Business;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/business/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Business not found`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Update business configuration
     * @param id Business ID
     * @param requestBody
     * @returns any Business updated successfully
     * @throws ApiError
     */
    public static putApiBusiness(
        id: number,
        requestBody: UpdateBusinessRequest,
    ): CancelablePromise<(ApiResponse & {
        data?: Business;
    })> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/business/{id}',
            path: {
                'id': id,
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
     * Delete business configuration
     * @param id Business ID
     * @returns any Business deleted successfully
     * @throws ApiError
     */
    public static deleteApiBusiness(
        id: number,
    ): CancelablePromise<(ApiResponse & {
        data?: any;
    })> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/business/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Business not found`,
                500: `Internal server error`,
            },
        });
    }
}
