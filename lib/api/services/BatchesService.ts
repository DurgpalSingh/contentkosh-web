/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
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
    public static postApiBatches(
        requestBody: CreateBatchRequest,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/batches',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid input data`,
                404: `Course not found`,
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
    public static getApiBatches(
        id: number,
    ): CancelablePromise<any> {
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
    public static putApiBatches(
        id: number,
        requestBody: UpdateBatchRequest,
    ): CancelablePromise<any> {
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
    public static deleteApiBatches(
        id: number,
    ): CancelablePromise<any> {
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
     * Get all batches for a course
     * @param courseId Course ID
     * @param active Filter by active status (true for active only, false for all)
     * @returns any Batches fetched successfully
     * @throws ApiError
     */
    public static getApiBatchesCourse(
        courseId: number,
        active?: boolean,
        include?: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/batches/course/{courseId}',
            path: {
                'courseId': courseId,
            },
            query: {
                'active': active,
                'include': include,
            },
            errors: {
                400: `Invalid course ID`,
                500: `Internal server error`,
            },
        });
    }

    /**
     * Get all active batches (role-aware)
     * @returns any Active batches fetched successfully
     * @throws ApiError
     */
    public static getApiBatchesAll(
        include?: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/batches/all',
            query: {
                'include': include,
            },
            errors: {
                403: `Forbidden`,
                500: `Internal server error`,
            },
        });
    }
}
