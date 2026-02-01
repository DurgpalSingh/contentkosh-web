/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AddUserToBatchRequest } from '../models/AddUserToBatchRequest';
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
    public static postApiBatchesAddUser(
        requestBody: AddUserToBatchRequest,
    ): CancelablePromise<any> {
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
    ): CancelablePromise<any> {
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
     * @returns BatchUser User batches fetched successfully
     * @throws ApiError
     */
    public static getApiBatchesUser(
        userId: number,
    ): CancelablePromise<Array<BatchUser>> {
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
     * @param role Filter users by role
     * @returns BatchUser Batch users fetched successfully
     * @throws ApiError
     */
    public static getApiBatchesUsers(
        batchId: number,
        role?: 'STUDENT' | 'TEACHER' | 'ADMIN' | 'USER',
    ): CancelablePromise<Array<BatchUser>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/batches/{batchId}/users',
            path: {
                'batchId': batchId,
            },
            query: {
                'role': role,
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
    public static putApiBatchesUsers(
        batchId: number,
        userId: number,
        requestBody: UpdateBatchUserRequest,
    ): CancelablePromise<any> {
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
