/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponse } from '../models/ApiResponse';
import type { AuthResponse } from '../models/AuthResponse';
import type { LoginRequest } from '../models/LoginRequest';
import type { RegisterRequest } from '../models/RegisterRequest';
import type { User } from '../models/User';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UsersService {
    /**
     * Register a new user
     * @param requestBody
     * @returns any User registered successfully
     * @throws ApiError
     */
    public static postApiUsersRegister(
        requestBody: RegisterRequest,
    ): CancelablePromise<(ApiResponse & {
        data?: AuthResponse;
    })> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/users/register',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid input data`,
                409: `User with this email already exists`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Login user
     * @param requestBody
     * @returns any Login successful
     * @throws ApiError
     */
    public static postApiUsersLogin(
        requestBody: LoginRequest,
    ): CancelablePromise<(ApiResponse & {
        data?: AuthResponse;
    })> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/users/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid input data`,
                401: `Invalid email or password`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Get user profile
     * @returns any Profile fetched successfully
     * @throws ApiError
     */
    public static getApiUsersProfile(): CancelablePromise<(ApiResponse & {
        data?: User;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/profile',
            errors: {
                401: `User not authenticated`,
                404: `User not found`,
                500: `Internal server error`,
            },
        });
    }
}
