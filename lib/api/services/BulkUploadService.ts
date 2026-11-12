import type { ApiResponse } from '../models/ApiResponse';
import type {
  BulkUploadPreviewResponse,
  BulkUploadConfirmRequest,
  BulkUploadConfirmResponse,
} from '../models/BulkUpload';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class BulkUploadService {
  /**
   * Upload a .doc/.docx file and preview parsed questions.
   * Parses the document and returns valid/invalid questions without persisting anything.
   * Use confirmBulkUpload to save the valid questions.
   * @param businessId Business ID
   * @param file The .doc or .docx file
   * @param testId The practice or exam test ID
   * @param testType Whether this is a practice or exam test
   * @returns BulkUploadPreviewResponse
   * @throws ApiError
   */
  public static uploadAndPreview(
    businessId: number,
    file: File,
    testId: string,
    testType: 'practice' | 'exam',
  ): CancelablePromise<ApiResponse & { data?: BulkUploadPreviewResponse }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('testId', testId);
    formData.append('testType', testType);

    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/business/{businessId}/bulk-upload',
      path: { businessId },
      // Pass the FormData instance directly — request.ts handles it via isFormData check
      formData: formData as unknown as Record<string, unknown>,
      errors: {
        400: 'Missing required fields',
        401: 'Unauthorized',
        403: 'Forbidden',
        422: 'Invalid file type, file too large, or no question blocks found',
        500: 'Internal server error',
      },
    });
  }

  /**
   * Confirm bulk upload and persist all valid questions.
   * @param businessId Business ID
   * @param requestBody
   * @returns BulkUploadConfirmResponse
   * @throws ApiError
   */
  public static confirmBulkUpload(
    businessId: number,
    requestBody: BulkUploadConfirmRequest,
  ): CancelablePromise<ApiResponse & { data?: BulkUploadConfirmResponse }> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/business/{businessId}/bulk-upload/confirm',
      path: { businessId },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: 'Invalid request body',
        401: 'Unauthorized',
        403: 'Forbidden',
        404: 'Test not found',
        410: 'Upload session expired or not found',
        500: 'Internal server error',
      },
    });
  }
}
