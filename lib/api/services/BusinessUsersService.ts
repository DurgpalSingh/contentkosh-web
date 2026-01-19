/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponse } from '../models/ApiResponse';
import type { AssignUserToBusinessRequest } from '../models/AssignUserToBusinessRequest';
import type { BusinessUser } from '../models/BusinessUser';
import type { UpdateBusinessUserRequest } from '../models/UpdateBusinessUserRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class BusinessUsersService {
    /**
     * Assign user to a business with a specific role
     * @param requestBody
     * @returns any User assigned to business successfully
     * @throws ApiError
     */
    public static postApiUsersAssignToBusiness(
        requestBody: AssignUserToBusinessRequest,
    ): CancelablePromise<(ApiResponse & {
        data?: BusinessUser;
    })> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/users/assign-to-business',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid input data`,
                404: `User or business not found`,
                409: `User is already assigned to this business`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Get current user's business associations
     * @returns any User business associations fetched successfully
     * @throws ApiError
     */
    public static getApiUsersMyBusinesses(): CancelablePromise<(ApiResponse & {
        data?: Array<BusinessUser>;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/my-businesses',
            errors: {
                401: `User not authenticated`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Get all users for a specific business
     * @param businessId Business ID
     * @param role Filter by role
     * @returns any Business users fetched successfully
     * @throws ApiError
     */
    public static getApiUsersBusinessUsers(
        businessId: number,
        role?: 'STUDENT' | 'TEACHER' | 'ADMIN' | 'SUPERADMIN',
    ): CancelablePromise<(ApiResponse & {
        data?: Array<BusinessUser>;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/business/{businessId}/users',
            path: {
                'businessId': businessId,
            },
            query: {
                'role': role,
            },
            errors: {
                400: `Invalid business ID`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Get specific business user by ID
     * @param id Business User ID
     * @returns any Business user fetched successfully
     * @throws ApiError
     */
    public static getApiUsersBusinessUsersById(
        id: number,
    ): CancelablePromise<(ApiResponse & {
        data?: BusinessUser;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/business-users/{id}',
            path: {
                'id': id,
            },
            errors: {
                400: `Invalid business user ID`,
                404: `Business user not found`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Update business user role or status
     * @param id Business User ID
     * @param requestBody
     * @returns any Business user updated successfully
     * @throws ApiError
     */
    public static putApiUsersBusinessUsers(
        id: number,
        requestBody: UpdateBusinessUserRequest,
    ): CancelablePromise<(ApiResponse & {
        data?: BusinessUser;
    })> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/users/business-users/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid input data`,
                404: `Business user not found`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Remove user from business
     * @param id Business User ID
     * @returns any User removed from business successfully
     * @throws ApiError
     */
    public static deleteApiUsersBusinessUsers(
        id: number,
    ): CancelablePromise<(ApiResponse & {
        data?: any;
    })> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/users/business-users/{id}',
            path: {
                'id': id,
            },
            errors: {
                400: `Invalid business user ID`,
                500: `Internal server error`,
            },
        });
    }
}
