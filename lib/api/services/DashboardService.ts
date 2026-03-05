import type { ApiResponse } from '../models/ApiResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
import type { DashboardData } from '@/types/dashboard';

export class DashboardService {
    /**
     * Get dashboard data based on current authenticated user role
     * @returns any Dashboard fetched successfully
     * @throws ApiError
     */
    public static getApiDashboard(): CancelablePromise<(ApiResponse & {
        data?: DashboardData;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/dashboard',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                500: `Internal server error`,
            },
        });
    }
}
