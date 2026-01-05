/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AddUserToBatchRequest } from '../models/AddUserToBatchRequest';
import type { ApiResponse } from '../models/ApiResponse';
import type { Batch } from '../models/Batch';
import type { BatchUser } from '../models/BatchUser';
import type { RemoveUserFromBatchRequest } from '../models/RemoveUserFromBatchRequest';
import type { UpdateBatchUserRequest } from '../models/UpdateBatchUserRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class BatchUsersService {
    /**
     * Add user to batch
     * @param requestBody
     * @returns any User added to batch successfully
     * @throws ApiError
     */
    public static postApiBatchesAddUser({
        requestBody,
    }: {
        requestBody: AddUserToBatchRequest,
    }): CancelablePromise<(ApiResponse & {
        data?: BatchUser;
    })> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/batches/add-user',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid input data`,
                404: `User or batch not found`,
                409: `User is already in this batch`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Remove user from batch
     * @param requestBody
     * @returns any User removed from batch successfully
     * @throws ApiError
     */
    public static postApiBatchesRemoveUser(
        requestBody: RemoveUserFromBatchRequest,
    ): CancelablePromise<(ApiResponse & {
        data?: any;
    })> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/batches/remove-user',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid input data`,
                404: `User is not in this batch`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Get all batches for a user
     * @param userId User ID
     * @returns any User batches fetched successfully
     * @throws ApiError
     */
    public static getApiBatchesUser({
        userId,
    }: {
        /**
         * User ID
         */
        userId: number,
    }): CancelablePromise<(ApiResponse & {
        data?: Array<{
            /**
             * Batch User ID
             */
            id?: number;
            /**
             * Whether the batch user is active
             */
            isActive?: boolean;
            /**
             * Batch user creation timestamp
             */
            createdAt?: string;
            batch?: Batch;
        }>;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/batches/user/{userId}',
            path: {
                'userId': userId,
            },
            errors: {
                400: `Invalid user ID`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Get all users for a batch
     * @param batchId Batch ID
     * @returns any Batch users fetched successfully
     * @throws ApiError
     */
    public static getApiBatchesUsers({
        batchId,
    }: {
        /**
         * Batch ID
         */
        batchId: number,
    }): CancelablePromise<(ApiResponse & {
        data?: Array<{
            /**
             * Batch User ID
             */
            id?: number;
            /**
             * Whether the batch user is active
             */
            isActive?: boolean;
            /**
             * Batch user creation timestamp
             */
            createdAt?: string;
            user?: {
                /**
                 * User ID
                 */
                id?: number;
                /**
                 * User email
                 */
                email?: string;
                /**
                 * User name
                 */
                name?: string;
            };
        }>;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/batches/{batchId}/users',
            path: {
                'batchId': batchId,
            },
            errors: {
                400: `Invalid batch ID`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Update batch user status
     * @param batchId Batch ID
     * @param userId User ID
     * @param requestBody
     * @returns any Batch user updated successfully
     * @throws ApiError
     */
    public static putApiBatchesUsers({
        batchId,
        userId,
        requestBody,
    }: {
        /**
         * Batch ID
         */
        batchId: number,
        /**
         * User ID
         */
        userId: number,
        requestBody: UpdateBatchUserRequest,
    }): CancelablePromise<(ApiResponse & {
        data?: BatchUser;
    })> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/batches/{batchId}/users/{userId}',
            path: {
                'batchId': batchId,
                'userId': userId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid input data`,
                404: `User is not in this batch`,
                500: `Internal server error`,
            },
        });
    }
}
