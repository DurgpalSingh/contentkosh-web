/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponse } from '../models/ApiResponse';
import type { CreatePracticeTestDTO } from '../models/CreatePracticeTestDTO';
import type { CreateQuestionDTO } from '../models/CreateQuestionDTO';
import type { PracticeAvailableTest } from '../models/PracticeAvailableTest';
import type { PracticeTest } from '../models/PracticeTest';
import type { PracticeTestAttemptDetails } from '../models/PracticeTestAttemptDetails';
import type { PublishPracticeTestRequest } from '../models/PublishPracticeTestRequest';
import type { StartPracticeAttemptRequest } from '../models/StartPracticeAttemptRequest';
import type { StartPrecticeTestAttemptResponse } from '../models/StartPrecticeTestAttemptResponse';
import type { SubmitAttemptRequest } from '../models/SubmitAttemptRequest';
import type { SubmitAttemptResponse } from '../models/SubmitAttemptResponse';
import type { TestAnalytics } from '../models/TestAnalytics';
import type { TestQuestion } from '../models/TestQuestion';
import type { UpdatePracticeTestDTO } from '../models/UpdatePracticeTestDTO';
import type { UpdateQuestionDTO } from '../models/UpdateQuestionDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PracticeTestsService {
    /**
     * Get available practice tests for the authenticated user
     * Student catalog of published practice tests from every batch where the user has an active membership.
     * @param businessId Business ID
     * @returns any Available practice tests fetched successfully
     * @throws ApiError
     */
    public static getApiBusinessPracticeTestsAvailable(
        businessId: number,
    ): CancelablePromise<(ApiResponse & {
        data?: Array<PracticeAvailableTest>;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/business/{businessId}/practice-tests/available',
            path: {
                'businessId': businessId,
            },
            errors: {
                400: `Invalid business ID`,
                401: `Unauthorized`,
                403: `Forbidden`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Publish a practice test
     * @param businessId Business ID
     * @param requestBody
     * @returns any Practice test published successfully
     * @throws ApiError
     */
    public static postApiBusinessPracticeTestsPublish(
        businessId: number,
        requestBody: PublishPracticeTestRequest,
    ): CancelablePromise<(ApiResponse & {
        data?: PracticeTest;
    })> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/business/{businessId}/practice-tests/publish',
            path: {
                'businessId': businessId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid input data`,
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Practice test not found`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Start a new attempt for a practice test
     * @param businessId Business ID
     * @param requestBody
     * @returns any Practice attempt started successfully
     * @throws ApiError
     */
    public static postApiBusinessPracticeTestsAttempts(
        businessId: number,
        requestBody: StartPracticeAttemptRequest,
    ): CancelablePromise<(ApiResponse & {
        data?: StartPrecticeTestAttemptResponse;
    })> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/business/{businessId}/practice-tests/attempts',
            path: {
                'businessId': businessId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid input data`,
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Practice test not found`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Get details for a practice test attempt
     * @param businessId Business ID
     * @param attemptId Attempt ID
     * @returns any Practice attempt fetched successfully
     * @throws ApiError
     */
    public static getApiBusinessPracticeTestsAttempts(
        businessId: number,
        attemptId: string,
    ): CancelablePromise<(ApiResponse & {
        data?: PracticeTestAttemptDetails;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/business/{businessId}/practice-tests/attempts/{attemptId}',
            path: {
                'businessId': businessId,
                'attemptId': attemptId,
            },
            errors: {
                400: `Invalid input data`,
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Practice attempt not found`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Submit answers for a practice test attempt
     * @param businessId Business ID
     * @param attemptId Attempt ID
     * @param requestBody
     * @returns any Practice attempt submitted successfully
     * @throws ApiError
     */
    public static postApiBusinessPracticeTestsAttemptsSubmit(
        businessId: number,
        attemptId: string,
        requestBody: SubmitAttemptRequest,
    ): CancelablePromise<(ApiResponse & {
        data?: SubmitAttemptResponse;
    })> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/business/{businessId}/practice-tests/attempts/{attemptId}/submit',
            path: {
                'businessId': businessId,
                'attemptId': attemptId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid input data`,
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Practice attempt not found`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Update a question in a practice test
     * @param businessId Business ID
     * @param questionId Question ID
     * @param requestBody
     * @returns any Question updated successfully
     * @throws ApiError
     */
    public static putApiBusinessPracticeTestsQuestions(
        businessId: number,
        questionId: string,
        requestBody: UpdateQuestionDTO,
    ): CancelablePromise<(ApiResponse & {
        data?: TestQuestion;
    })> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/business/{businessId}/practice-tests/questions/{questionId}',
            path: {
                'businessId': businessId,
                'questionId': questionId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid input data`,
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Question not found`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Delete a question from a practice test
     * @param businessId Business ID
     * @param questionId Question ID
     * @returns any Question deleted successfully
     * @throws ApiError
     */
    public static deleteApiBusinessPracticeTestsQuestions(
        businessId: number,
        questionId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/business/{businessId}/practice-tests/questions/{questionId}',
            path: {
                'businessId': businessId,
                'questionId': questionId,
            },
            errors: {
                400: `Invalid input data`,
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Question not found`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Create a new practice test
     * @param businessId Business ID
     * @param requestBody
     * @returns any Practice test created successfully
     * @throws ApiError
     */
    public static postApiBusinessPracticeTests(
        businessId: number,
        requestBody: CreatePracticeTestDTO,
    ): CancelablePromise<(ApiResponse & {
        data?: PracticeTest;
    })> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/business/{businessId}/practice-tests',
            path: {
                'businessId': businessId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid input data`,
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Batch not found`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * List practice tests for a business
     * Teacher or admin listing (scoped to batches the teacher belongs to; admins and superadmins see all tests in the business).
     * Students should use `GET /practice-tests/available` for published tests across all batches they are active members of.
     *
     * @param businessId Business ID
     * @param status Filter by status (0=DRAFT, 1=PUBLISHED)
     * @param batchId Filter by batch ID
     * @returns any Practice tests fetched successfully
     * @throws ApiError
     */
    public static getApiBusinessPracticeTests(
        businessId: number,
        status?: 0 | 1,
        batchId?: number,
    ): CancelablePromise<(ApiResponse & {
        data?: Array<PracticeTest>;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/business/{businessId}/practice-tests',
            path: {
                'businessId': businessId,
            },
            query: {
                'status': status,
                'batchId': batchId,
            },
            errors: {
                400: `Invalid query parameters`,
                401: `Unauthorized`,
                403: `Forbidden`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Export practice test analytics as CSV
     * @param businessId Business ID
     * @param practiceTestId Practice test ID
     * @returns string Analytics exported as CSV
     * @throws ApiError
     */
    public static getApiBusinessPracticeTestsAnalyticsExport(
        businessId: number,
        practiceTestId: string,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/business/{businessId}/practice-tests/{practiceTestId}/analytics/export',
            path: {
                'businessId': businessId,
                'practiceTestId': practiceTestId,
            },
            errors: {
                400: `Invalid input data`,
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Practice test not found`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Get practice test analytics
     * @param businessId Business ID
     * @param practiceTestId Practice test ID
     * @returns any Practice test analytics fetched successfully
     * @throws ApiError
     */
    public static getApiBusinessPracticeTestsAnalytics(
        businessId: number,
        practiceTestId: string,
    ): CancelablePromise<(ApiResponse & {
        data?: TestAnalytics;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/business/{businessId}/practice-tests/{practiceTestId}/analytics',
            path: {
                'businessId': businessId,
                'practiceTestId': practiceTestId,
            },
            errors: {
                400: `Invalid input data`,
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Practice test not found`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * List questions for a practice test
     * @param businessId Business ID
     * @param practiceTestId Practice test ID
     * @returns any Questions fetched successfully
     * @throws ApiError
     */
    public static getApiBusinessPracticeTestsQuestions(
        businessId: number,
        practiceTestId: string,
    ): CancelablePromise<(ApiResponse & {
        data?: Array<TestQuestion>;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/business/{businessId}/practice-tests/{practiceTestId}/questions',
            path: {
                'businessId': businessId,
                'practiceTestId': practiceTestId,
            },
            errors: {
                400: `Invalid input data`,
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Practice test not found`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Create a question in a practice test
     * @param businessId Business ID
     * @param practiceTestId Practice test ID
     * @param requestBody
     * @returns any Question created successfully
     * @throws ApiError
     */
    public static postApiBusinessPracticeTestsQuestions(
        businessId: number,
        practiceTestId: string,
        requestBody: CreateQuestionDTO,
    ): CancelablePromise<(ApiResponse & {
        data?: TestQuestion;
    })> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/business/{businessId}/practice-tests/{practiceTestId}/questions',
            path: {
                'businessId': businessId,
                'practiceTestId': practiceTestId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid input data`,
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Practice test not found`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Get a practice test by ID
     * @param businessId Business ID
     * @param practiceTestId Practice test ID
     * @returns any Practice test fetched successfully
     * @throws ApiError
     */
    public static getApiBusinessPracticeTests1(
        businessId: number,
        practiceTestId: string,
    ): CancelablePromise<(ApiResponse & {
        data?: PracticeTest;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/business/{businessId}/practice-tests/{practiceTestId}',
            path: {
                'businessId': businessId,
                'practiceTestId': practiceTestId,
            },
            errors: {
                400: `Invalid input data`,
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Practice test not found`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Update a practice test
     * @param businessId Business ID
     * @param practiceTestId Practice test ID
     * @param requestBody
     * @returns any Practice test updated successfully
     * @throws ApiError
     */
    public static putApiBusinessPracticeTests(
        businessId: number,
        practiceTestId: string,
        requestBody: UpdatePracticeTestDTO,
    ): CancelablePromise<(ApiResponse & {
        data?: PracticeTest;
    })> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/business/{businessId}/practice-tests/{practiceTestId}',
            path: {
                'businessId': businessId,
                'practiceTestId': practiceTestId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid input data`,
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Practice test not found`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Delete a practice test
     * @param businessId Business ID
     * @param practiceTestId Practice test ID
     * @returns any Practice test deleted successfully
     * @throws ApiError
     */
    public static deleteApiBusinessPracticeTests(
        businessId: number,
        practiceTestId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/business/{businessId}/practice-tests/{practiceTestId}',
            path: {
                'businessId': businessId,
                'practiceTestId': practiceTestId,
            },
            errors: {
                400: `Invalid input data`,
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Practice test not found`,
                500: `Internal server error`,
            },
        });
    }
}
