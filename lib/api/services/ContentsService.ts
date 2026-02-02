/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponse } from '../models/ApiResponse';
import type { Content } from '../models/Content';
import type { CreateContentRequest } from '../models/CreateContentRequest';
import type { UpdateContentRequest } from '../models/UpdateContentRequest';
import { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ContentsService {
    /**
     * Create content (multipart/form-data)
     * @param batchId Batch ID
     * @param requestBody Form data containing file, title and optional status
     * @returns any Content created successfully
     * @throws ApiError
     */
    public static postApiBatchesContents({
        batchId,
        requestBody,
    }: {
        /** Batch ID */
        batchId: number,
        requestBody: CreateContentRequest,
    }): CancelablePromise<(ApiResponse & {
        data?: Content;
    })> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/batches/{batchId}/contents',
            path: {
                'batchId': batchId,
            },
            formData: requestBody as any,
            mediaType: 'multipart/form-data',
            errors: {
                400: `Invalid input data or file validation failed`,
                403: `Insufficient permissions`,
                404: `Batch not found`,
                500: `Internal server error`,
            },
        });
    }

    /**
     * Get contents for a batch
     * @param batchId Batch ID
     * @param type Filter by content type
     * @param status Filter by content status
     * @param search Search in content titles
     * @returns any Contents fetched successfully
     * @throws ApiError
     */
    public static getApiBatchesContents({
        batchId,
        type,
        status,
        search,
    }: {
        /** Batch ID */
        batchId: number,
        /** Filter by content type */
        type?: 'PDF' | 'IMAGE',
        /** Filter by content status */
        status?: 'ACTIVE' | 'INACTIVE',
        /** Search string */
        search?: string,
    }): CancelablePromise<(ApiResponse & {
        data?: Array<Content>;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/batches/{batchId}/contents',
            path: {
                'batchId': batchId,
            },
            query: {
                'type': type,
                'status': status,
                'search': search,
            },
            errors: {
                400: `Invalid batch ID`,
                404: `Batch not found`,
                500: `Internal server error`,
            },
        });
    }

    /**
     * Get content by ID
     * @param contentId Content ID
     * @returns any Content fetched successfully
     * @throws ApiError
     */
    public static getApiContents({
        contentId,
    }: {
        /** Content ID */
        contentId: number,
    }): CancelablePromise<(ApiResponse & {
        data?: Content;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/contents/{contentId}',
            path: {
                'contentId': contentId,
            },
            errors: {
                400: `Invalid content ID`,
                404: `Content not found`,
                500: `Internal server error`,
            },
        });
    }

    /**
     * Download/view content file (returns binary stream)
     * @param contentId Content ID
     * @returns any File streamed successfully
     * @throws ApiError
     */
    public static getApiContentsFile({
        contentId,
    }: {
        /** Content ID */
        contentId: number,
    }): CancelablePromise<Blob> {
        // Use direct fetch because generated request utility does not expose responseType easily
        return new CancelablePromise(async (resolve, reject, onCancel) => {
            try {
                const token = typeof OpenAPI.TOKEN === 'string' ? OpenAPI.TOKEN : undefined as any;
                const controller = new AbortController();
                onCancel(() => controller.abort());
                const url = `${OpenAPI.BASE}/api/contents/${encodeURIComponent(String(contentId))}/file`;
                const res = await fetch(url, {
                    method: 'GET',
                    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                    signal: controller.signal,
                });
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(`Failed to fetch file: ${res.status} ${text}`);
                }
                const blob = await res.blob();
                resolve(blob);
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * Update content
     * @param contentId Content ID
     * @param requestBody
     * @returns any Content updated successfully
     * @throws ApiError
     */
    public static putApiContents({
        contentId,
        requestBody,
    }: {
        /** Content ID */
        contentId: number,
        requestBody: UpdateContentRequest,
    }): CancelablePromise<(ApiResponse & {
        data?: Content;
    })> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/contents/{contentId}',
            path: {
                'contentId': contentId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid input data`,
                404: `Content not found`,
                500: `Internal server error`,
            },
        });
    }

    /**
     * Delete content
     * @param contentId Content ID
     * @returns any Content deleted successfully
     * @throws ApiError
     */
    public static deleteApiContents({
        contentId,
    }: {
        /** Content ID */
        contentId: number,
    }): CancelablePromise<(ApiResponse & {
        data?: any;
    })> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/contents/{contentId}',
            path: {
                'contentId': contentId,
            },
            errors: {
                400: `Invalid content ID`,
                500: `Internal server error`,
            },
        });
    }
}
