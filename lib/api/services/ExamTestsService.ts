/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponse } from '../models/ApiResponse';
import type { CreateExamTestDTO } from '../models/CreateExamTestDTO';
import type { CreateQuestionDTO } from '../models/CreateQuestionDTO';
import type { ExamAvailableTest } from '../models/ExamAvailableTest';
import type { ExamTest } from '../models/ExamTest';
import type { ExamTestAttemptDetails } from '../models/ExamTestAttemptDetails';
import type { PublishExamTestRequest } from '../models/PublishExamTestRequest';
import type { StartExamAttemptRequest } from '../models/StartExamAttemptRequest';
import type { StartExamTestAttemptResponse } from '../models/StartExamTestAttemptResponse';
import type { SubmitAttemptRequest } from '../models/SubmitAttemptRequest';
import type { SubmitAttemptResponse } from '../models/SubmitAttemptResponse';
import type { TestAnalytics } from '../models/TestAnalytics';
import type { TestQuestion } from '../models/TestQuestion';
import type { UpdateExamTestDTO } from '../models/UpdateExamTestDTO';
import type { UpdateQuestionDTO } from '../models/UpdateQuestionDTO';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ExamTestsService {
    /**
     * Get available exam tests for the authenticated user
     * Student catalog of published exam tests from every batch where the user has an active membership.
     * @param businessId Business ID
     * @returns any Available exam tests fetched successfully
     * @throws ApiError
     */
    public static getApiBusinessExamTestsAvailable(
        businessId: number,
    ): CancelablePromise<(ApiResponse & {
        data?: Array<ExamAvailableTest>;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/business/{businessId}/exam-tests/available',
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
     * Publish an exam test
     * @param businessId Business ID
     * @param requestBody
     * @returns any Exam test published successfully
     * @throws ApiError
     */
    public static postApiBusinessExamTestsPublish(
        businessId: number,
        requestBody: PublishExamTestRequest,
    ): CancelablePromise<(ApiResponse & {
        data?: ExamTest;
    })> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/business/{businessId}/exam-tests/publish',
            path: {
                'businessId': businessId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid input data`,
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Exam test not found`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Start a new attempt for an exam test
     * @param businessId Business ID
     * @param requestBody
     * @returns any Exam attempt started successfully
     * @throws ApiError
     */
    public static postApiBusinessExamTestsAttempts(
        businessId: number,
        requestBody: StartExamAttemptRequest,
    ): CancelablePromise<(ApiResponse & {
        data?: StartExamTestAttemptResponse;
    })> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/business/{businessId}/exam-tests/attempts',
            path: {
                'businessId': businessId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid input data`,
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Exam test not found`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Get details for an exam test attempt
     * @param businessId Business ID
     * @param attemptId Attempt ID
     * @returns any Exam attempt fetched successfully
     * @throws ApiError
     */
    public static getApiBusinessExamTestsAttempts(
        businessId: number,
        attemptId: string,
    ): CancelablePromise<(ApiResponse & {
        data?: ExamTestAttemptDetails;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/business/{businessId}/exam-tests/attempts/{attemptId}',
            path: {
                'businessId': businessId,
                'attemptId': attemptId,
            },
            errors: {
                400: `Invalid input data`,
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Exam attempt not found`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Submit answers for an exam test attempt
     * @param businessId Business ID
     * @param attemptId Attempt ID
     * @param requestBody
     * @returns any Exam attempt submitted successfully
     * @throws ApiError
     */
    public static postApiBusinessExamTestsAttemptsSubmit(
        businessId: number,
        attemptId: string,
        requestBody: SubmitAttemptRequest,
    ): CancelablePromise<(ApiResponse & {
        data?: SubmitAttemptResponse;
    })> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/business/{businessId}/exam-tests/attempts/{attemptId}/submit',
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
                404: `Exam attempt not found`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Update a question in an exam test
     * @param businessId Business ID
     * @param questionId Question ID
     * @param requestBody
     * @returns any Question updated successfully
     * @throws ApiError
     */
    public static putApiBusinessExamTestsQuestions(
        businessId: number,
        questionId: string,
        requestBody: UpdateQuestionDTO,
    ): CancelablePromise<(ApiResponse & {
        data?: TestQuestion;
    })> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/business/{businessId}/exam-tests/questions/{questionId}',
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
     * Delete a question from an exam test
     * @param businessId Business ID
     * @param questionId Question ID
     * @returns any Question deleted successfully
     * @throws ApiError
     */
    public static deleteApiBusinessExamTestsQuestions(
        businessId: number,
        questionId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/business/{businessId}/exam-tests/questions/{questionId}',
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
     * Create a new exam test
     * @param businessId Business ID
     * @param requestBody
     * @returns any Exam test created successfully
     * @throws ApiError
     */
    public static postApiBusinessExamTests(
        businessId: number,
        requestBody: CreateExamTestDTO,
    ): CancelablePromise<(ApiResponse & {
        data?: ExamTest;
    })> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/business/{businessId}/exam-tests',
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
     * List exam tests for a business
     * Teacher or admin listing (scoped to batches the teacher belongs to; admins and superadmins see all tests in the business).
     * Students should use `GET /exam-tests/available` for published exams across all batches they are active members of.
     *
     * @param businessId Business ID
     * @param status Filter by status (0=DRAFT, 1=PUBLISHED)
     * @param batchId Filter by batch ID
     * @returns any Exam tests fetched successfully
     * @throws ApiError
     */
    public static getApiBusinessExamTests(
        businessId: number,
        status?: 0 | 1,
        batchId?: number,
    ): CancelablePromise<(ApiResponse & {
        data?: Array<ExamTest>;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/business/{businessId}/exam-tests',
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
     * Export exam test analytics as CSV
     * @param businessId Business ID
     * @param examTestId Exam test ID
     * @returns string Analytics exported as CSV
     * @throws ApiError
     */
    public static getApiBusinessExamTestsAnalyticsExport(
        businessId: number,
        examTestId: string,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/business/{businessId}/exam-tests/{examTestId}/analytics/export',
            path: {
                'businessId': businessId,
                'examTestId': examTestId,
            },
            errors: {
                400: `Invalid input data`,
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Exam test not found`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Get exam test analytics
     * @param businessId Business ID
     * @param examTestId Exam test ID
     * @returns any Exam test analytics fetched successfully
     * @throws ApiError
     */
    public static getApiBusinessExamTestsAnalytics(
        businessId: number,
        examTestId: string,
    ): CancelablePromise<(ApiResponse & {
        data?: TestAnalytics;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/business/{businessId}/exam-tests/{examTestId}/analytics',
            path: {
                'businessId': businessId,
                'examTestId': examTestId,
            },
            errors: {
                400: `Invalid input data`,
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Exam test not found`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * List questions for an exam test
     * @param businessId Business ID
     * @param examTestId Exam test ID
     * @returns any Questions fetched successfully
     * @throws ApiError
     */
    public static getApiBusinessExamTestsQuestions(
        businessId: number,
        examTestId: string,
    ): CancelablePromise<(ApiResponse & {
        data?: Array<TestQuestion>;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/business/{businessId}/exam-tests/{examTestId}/questions',
            path: {
                'businessId': businessId,
                'examTestId': examTestId,
            },
            errors: {
                400: `Invalid input data`,
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Exam test not found`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Create a question in an exam test
     * @param businessId Business ID
     * @param examTestId Exam test ID
     * @param requestBody
     * @returns any Question created successfully
     * @throws ApiError
     */
    public static postApiBusinessExamTestsQuestions(
        businessId: number,
        examTestId: string,
        requestBody: CreateQuestionDTO,
    ): CancelablePromise<(ApiResponse & {
        data?: TestQuestion;
    })> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/business/{businessId}/exam-tests/{examTestId}/questions',
            path: {
                'businessId': businessId,
                'examTestId': examTestId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid input data`,
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Exam test not found`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Create a question in an exam test (with optional image attachments)
     * Sends as multipart/form-data when image files are provided.
     * @param businessId Business ID
     * @param examTestId Exam test ID
     * @param formData Browser FormData containing `data` (JSON string) and optional image fields
     * @returns any Question created successfully
     * @throws ApiError
     */
    public static postApiBusinessExamTestsQuestionsWithMedia(
        businessId: number,
        examTestId: string,
        formData: FormData,
    ): CancelablePromise<(ApiResponse & {
        data?: TestQuestion;
    })> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/business/{businessId}/exam-tests/{examTestId}/questions',
            path: {
                'businessId': businessId,
                'examTestId': examTestId,
            },
            formData: formData as any,
            errors: {
                400: `Invalid input data`,
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Exam test not found`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Update a question in an exam test (with optional image attachments)
     * Sends as multipart/form-data when image files or removal flags are provided.
     * @param businessId Business ID
     * @param questionId Question ID
     * @param formData Browser FormData containing `data` (JSON string) and optional image fields
     * @returns any Question updated successfully
     * @throws ApiError
     */
    public static putApiBusinessExamTestsQuestionsWithMedia(
        businessId: number,
        questionId: string,
        formData: FormData,
    ): CancelablePromise<(ApiResponse & {
        data?: TestQuestion;
    })> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/business/{businessId}/exam-tests/questions/{questionId}',
            path: {
                'businessId': businessId,
                'questionId': questionId,
            },
            formData: formData as any,
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
     * Get an exam test by ID
     * @param businessId Business ID
     * @param examTestId Exam test ID
     * @returns any Exam test fetched successfully
     * @throws ApiError
     */
    public static getApiBusinessExamTests1(
        businessId: number,
        examTestId: string,
    ): CancelablePromise<(ApiResponse & {
        data?: ExamTest;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/business/{businessId}/exam-tests/{examTestId}',
            path: {
                'businessId': businessId,
                'examTestId': examTestId,
            },
            errors: {
                400: `Invalid input data`,
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Exam test not found`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Update an exam test
     * @param businessId Business ID
     * @param examTestId Exam test ID
     * @param requestBody
     * @returns any Exam test updated successfully
     * @throws ApiError
     */
    public static putApiBusinessExamTests(
        businessId: number,
        examTestId: string,
        requestBody: UpdateExamTestDTO,
    ): CancelablePromise<(ApiResponse & {
        data?: ExamTest;
    })> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/business/{businessId}/exam-tests/{examTestId}',
            path: {
                'businessId': businessId,
                'examTestId': examTestId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid input data`,
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Exam test not found`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Delete an exam test
     * @param businessId Business ID
     * @param examTestId Exam test ID
     * @returns any Exam test deleted successfully
     * @throws ApiError
     */
    public static deleteApiBusinessExamTests(
        businessId: number,
        examTestId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/business/{businessId}/exam-tests/{examTestId}',
            path: {
                'businessId': businessId,
                'examTestId': examTestId,
            },
            errors: {
                400: `Invalid input data`,
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Exam test not found`,
                500: `Internal server error`,
            },
        });
    }
}
