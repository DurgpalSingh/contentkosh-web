/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponse } from '../models/ApiResponse';
import type { Batch } from '../models/Batch';
import type { BatchWithUsers } from '../models/BatchWithUsers';
import type { CreateBatchRequest } from '../models/CreateBatchRequest';
import type { UpdateBatchRequest } from '../models/UpdateBatchRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class BatchesService {
    /**
     * Create a new batch
     * @param requestBody
     * @returns any Batch created successfully
     * @throws ApiError
     */
    public static postApiBatches({
        requestBody,
    }: {
        requestBody: CreateBatchRequest,
    }): CancelablePromise<(ApiResponse & {
        data?: Batch;
    })> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/batches',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid input data`,
                404: `Business not found`,
                409: `Batch with this code name already exists`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Get batch by ID
     * @param id Batch ID
     * @returns any Batch fetched successfully
     * @throws ApiError
     */
    public static getApiBatches({
        id,
    }: {
        /**
         * Batch ID
         */
        id: number,
    }): CancelablePromise<(ApiResponse & {
        data?: Batch;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/batches/{id}',
            path: {
                'id': id,
            },
            errors: {
                400: `Invalid batch ID`,
                404: `Batch not found`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Update batch
     * @param id Batch ID
     * @param requestBody
     * @returns any Batch updated successfully
     * @throws ApiError
     */
    public static putApiBatches({
        id,
        requestBody,
    }: {
        /**
         * Batch ID
         */
        id: number,
        requestBody: UpdateBatchRequest,
    }): CancelablePromise<(ApiResponse & {
        data?: Batch;
    })> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/batches/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid input data`,
                404: `Batch not found`,
                409: `Batch with this code name already exists`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Delete batch
     * @param id Batch ID
     * @returns any Batch deleted successfully
     * @throws ApiError
     */
    public static deleteApiBatches({
        id,
    }: {
        /**
         * Batch ID
         */
        id: number,
    }): CancelablePromise<(ApiResponse & {
        data?: any;
    })> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/batches/{id}',
            path: {
                'id': id,
            },
            errors: {
                400: `Invalid batch ID`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Get batch with its users
     * @param id Batch ID
     * @returns any Batch with users fetched successfully
     * @throws ApiError
     */
    public static getApiBatchesWithUsers({
        id,
    }: {
        /**
         * Batch ID
         */
        id: number,
    }): CancelablePromise<(ApiResponse & {
        data?: BatchWithUsers;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/batches/{id}/users',
            path: {
                'id': id,
            },
            errors: {
                400: `Invalid batch ID`,
                404: `Batch not found`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Get all batches for a business
     * @param businessId Business ID
     * @param active Filter by active status (true for active only, false for all)
     * @returns any Batches fetched successfully
     * @throws ApiError
     */
    public static getApiBatchesBusiness({
        businessId,
        active,
    }: {
        /**
         * Business ID
         */
        businessId: number,
        /**
         * Filter by active status (true for active only, false for all)
         */
        active?: boolean,
    }): CancelablePromise<(ApiResponse & {
        data?: Array<Batch>;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/batches/business/{businessId}',
            path: {
                'businessId': businessId,
            },
            query: {
                'active': active,
            },
            errors: {
                400: `Invalid business ID`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Get all batches for a course
     * @param courseId Course ID
     * @param active Filter by active status (true for active only, false for all)
     * @returns any Batches fetched successfully
     * @throws ApiError
     */
    public static getApiBatchesCourse({
        courseId,
        active,
        include,
    }: {
        /**
         * Course ID
         */
        courseId: number,
        /**
         * Filter by active status (true for active only, false for all)
         */
        active?: boolean,
        include?: string
    }): CancelablePromise<(ApiResponse & {
        data?: Array<Batch>;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/batches/course/{courseId}',
            path: {
                'courseId': courseId,
            },
            query: {
                'active': active,
                'include':include,
            },
            errors: {
                400: `Invalid course ID`,
                500: `Internal server error`,
            },
        });
    }
}
