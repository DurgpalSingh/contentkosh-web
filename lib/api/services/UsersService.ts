/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponse } from '../models/ApiResponse';
import type { CreateUserRequest } from '../models/CreateUserRequest';
import type { UpdateUserRequest } from '../models/UpdateUserRequest';
import type { User } from '../models/User';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UsersService {
    /**
     * Get logged-in user profile (Alias for /auth/me)
     * @returns User Profile fetched successfully
     * @throws ApiError
     */
    public static getApiUsersProfile(): CancelablePromise<User> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/profile',
            errors: {
                401: `Unauthorized`,
            },
        });
    }
    /**
     * Create user for a business (Admin only)
     * @param businessId Business ID
     * @param requestBody
     * @returns ApiResponse User created successfully
     * @throws ApiError
     */
    public static postApiBusinessUsers(
        businessId: number,
        requestBody: CreateUserRequest,
    ): CancelablePromise<ApiResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/business/{businessId}/users',
            path: {
                'businessId': businessId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Validation error`,
                403: `Forbidden - No access to this business`,
                404: `Business not found`,
                409: `User with email/mobile already exists`,
            },
        });
    }
    /**
     * Get all users for a specific business
     * @param businessId Business ID
     * @param role Filter users by role
     * @returns any Users fetched successfully
     * @throws ApiError
     */
    public static getApiBusinessUsers(
        businessId: number,
        role?: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'USER',
    ): CancelablePromise<ApiResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/business/{businessId}/users',
            path: {
                'businessId': businessId,
            },
            query: {
                'role': role,
            },
            errors: {
                403: `Forbidden - No access to this business`,
                404: `Business not found`,
            },
        });
    }
    /**
     * Update user
     * @param userId User ID
     * @param requestBody
     * @returns any User updated successfully
     * @throws ApiError
     */
    public static putApiUsers(
        userId: number,
        requestBody: UpdateUserRequest,
    ): CancelablePromise<ApiResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/users/{userId}',
            path: {
                'userId': userId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Validation error`,
                403: `Forbidden - No access to this user`,
                404: `User not found`,
            },
        });
    }
    /**
     * Soft delete user
     * @param userId User ID
     * @returns any User deleted successfully
     * @throws ApiError
     */
    public static deleteApiUsers(
        userId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/users/{userId}',
            path: {
                'userId': userId,
            },
            errors: {
                403: `Forbidden - No access to this user`,
                404: `User not found`,
            },
        });
    }
}
