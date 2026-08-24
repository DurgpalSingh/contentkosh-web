/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SuperAdminService {
    /**
     * List all businesses on the platform (Super Admin only)
     * @param page
     * @param limit
     * @param status
     * @param search Matches against institute name or slug
     * @returns any Businesses fetched successfully
     * @throws ApiError
     */
    public static getApiSuperadminBusinesses(
        page?: number,
        limit?: number,
        status?: 'ACTIVE' | 'PAUSED' | 'DELETED',
        search?: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/superadmin/businesses',
            query: {
                'page': page,
                'limit': limit,
                'status': status,
                'search': search,
            },
            errors: {
                403: `Forbidden - Super Admin only`,
            },
        });
    }
    /**
     * Get a single business's detail (Super Admin only)
     * @param id
     * @returns any Business fetched successfully
     * @throws ApiError
     */
    public static getApiSuperadminBusinesses1(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/superadmin/businesses/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Business not found`,
            },
        });
    }
    /**
     * Pause, resume, or soft-delete a business (Super Admin only)
     * Single endpoint for every business lifecycle transition. Set `status` to PAUSED or DELETED to block that business's users from logging in / using the platform (a `reason` is required in both cases and is shown to the business's users). Set `status` to ACTIVE to resume - this immediately restores access.
     *
     * @param id
     * @param requestBody
     * @returns any Business status updated successfully
     * @throws ApiError
     */
    public static patchApiSuperadminBusinessesStatus(
        id: number,
        requestBody: {
            status: 'ACTIVE' | 'PAUSED' | 'DELETED';
            /**
             * Required when status is PAUSED or DELETED
             */
            reason?: string;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/superadmin/businesses/{id}/status',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid input data / missing reason`,
                404: `Business not found`,
            },
        });
    }
}
