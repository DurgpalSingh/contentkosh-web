/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponse } from '../models/ApiResponse';
import type { LoginRequest } from '../models/LoginRequest';
import type { RegisterRequest } from '../models/RegisterRequest';
import type { User } from '../models/User';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthService {
    /**
     * Register a new user
     * @param requestBody
     * @returns any User registered successfully
     * @throws ApiError
     */
    public static postApiAuthSignup(
        requestBody: RegisterRequest,
    ): CancelablePromise<(ApiResponse & {
        data?: {
            accessToken?: string;
            refreshToken?: string;
            user?: User;
        };
    })> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/signup',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                409: `Email or mobile already exists`,
            },
        });
    }
    /**
     * Login user
     * @param requestBody
     * @returns any Login successful
     * @throws ApiError
     */
    public static postApiAuthLogin(
        requestBody: LoginRequest,
    ): CancelablePromise<(ApiResponse & {
        data?: {
            accessToken?: string;
            refreshToken?: string;
            user?: User;
        };
    })> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Invalid credentials`,
                403: `User account is inactive`,
            },
        });
    }
    /**
     * Refresh access token using refresh token
     * @param requestBody
     * @returns any Tokens refreshed successfully
     * @throws ApiError
     */
    public static postApiAuthRefresh(
        requestBody: {
            /**
             * The refresh token received during login
             */
            refreshToken: string;
        },
    ): CancelablePromise<(ApiResponse & {
        data?: {
            accessToken?: string;
            refreshToken?: string;
            user?: User;
        };
    })> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/refresh',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Invalid, expired, or revoked refresh token`,
                403: `User account is inactive`,
            },
        });
    }
    /**
     * Logout user (revokes refresh token)
     * @param requestBody
     * @returns any Logout successful
     * @throws ApiError
     */
    public static postApiAuthLogout(
        requestBody?: {
            /**
             * The refresh token to revoke
             */
            refreshToken?: string;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/logout',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get logged-in user profile
     * @returns any Profile fetched successfully
     * @throws ApiError
     */
    public static getApiAuthMe(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/auth/me',
            errors: {
                401: `Unauthorized`,
            },
        });
    }
}
