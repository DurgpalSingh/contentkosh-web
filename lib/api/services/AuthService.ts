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
     * Register a new user (email verification required, no session is issued)
     * @param requestBody
     * @returns any User registered successfully
     * @throws ApiError
     */
    public static postApiAuthSignup(
        requestBody: RegisterRequest,
    ): CancelablePromise<(ApiResponse & {
        data?: {
            /**
             * False when the verification mail could not be sent
             */
            emailSent?: boolean;
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
     * Verify an email address using the emailed magic link token
     * @param requestBody
     * @returns any Email verified (or already verified)
     * @throws ApiError
     */
    public static postApiAuthVerifyEmail(
        requestBody: {
            token: string;
        },
    ): CancelablePromise<(ApiResponse & {
        data?: {
            verified?: boolean;
            alreadyVerified?: boolean;
            /**
             * True when this call logged the user in (auth cookies were set)
             */
            autoLogin?: boolean;
            slug?: string | null;
        };
    })> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/verify-email',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid link`,
                409: `The institute slug was taken before the link was opened`,
                410: `Link expired`,
            },
        });
    }
    /**
     * Request a new verification link
     * @param requestBody
     * @returns any Generic acknowledgement
     * @throws ApiError
     */
    public static postApiAuthResendVerification(
        requestBody: {
            email: string;
        },
    ): CancelablePromise<ApiResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/resend-verification',
            body: requestBody,
            mediaType: 'application/json',
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
                403: `User account is inactive, or email not verified`,
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
