/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponse } from '../models/ApiResponse';
import type { Business } from '../models/Business';
import type { CreateBusinessRequest } from '../models/CreateBusinessRequest';
import type { UpdateBusinessRequest } from '../models/UpdateBusinessRequest';
import type { UpdateExamRequest } from '../models/UpdateExamRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class BusinessService {
    
    /**
     * Create business configuration
     * @returns any Business created successfully
     * @throws ApiError
     */
    public static postApiBusiness({
        requestBody,
    }: {
        requestBody: CreateBusinessRequest,
    }): CancelablePromise<(ApiResponse & {
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
     * @returns any Business fetched successfully
     * @throws ApiError
     */
    public static getApiBusinessById({
        id,
    }: {
        /**
         * Business ID
         */
        id: number,
    }): CancelablePromise<(ApiResponse & {
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
     * @returns any Business updated successfully
     * @throws ApiError
     */
    public static putApiBusiness({
        id,
        requestBody,
    }: {
        /**
         * Business ID
         */
        id: number,
        requestBody: UpdateBusinessRequest,
    }): CancelablePromise<(ApiResponse & {
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
     * @returns any Business deleted successfully
     * @throws ApiError
     */
    public static deleteApiBusiness({
        id,
    }: {
        /**
         * Business ID
         */
        id: number,
    }): CancelablePromise<(ApiResponse & {
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
