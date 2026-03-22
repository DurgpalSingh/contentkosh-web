/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AdminDashboard } from '../models/AdminDashboard';
import type { ApiResponse } from '../models/ApiResponse';
import type { StudentDashboard } from '../models/StudentDashboard';
import type { TeacherDashboard } from '../models/TeacherDashboard';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DashboardService {
    /**
     * Get dashboard data based on user role
     * Returns role-specific dashboard data (Admin, Teacher, or Student)
     * @returns any Dashboard data fetched successfully
     * @throws ApiError
     */
    public static getApiDashboard(): CancelablePromise<(ApiResponse & {
        data?: (AdminDashboard | TeacherDashboard | StudentDashboard);
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/dashboard',
            errors: {
                401: `Unauthorized`,
                403: `Dashboard not available for your role`,
            },
        });
    }
}
