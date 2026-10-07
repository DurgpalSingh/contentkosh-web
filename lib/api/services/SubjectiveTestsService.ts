/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiResponse } from '../models/ApiResponse';
import type { CreateSubjectiveTestRequest } from '../models/CreateSubjectiveTestRequest';
import type { PublishSubjectiveTestRequest } from '../models/PublishSubjectiveTestRequest';
import type { SubjectiveAvailableTest } from '../models/SubjectiveAvailableTest';
import type { SubjectiveDisplayStatus } from '../models/SubjectiveDisplayStatus';
import type { SubjectiveStaffSubmission } from '../models/SubjectiveStaffSubmission';
import type { SubjectiveStartResult } from '../models/SubjectiveStartResult';
import type { SubjectiveStudentSubmission } from '../models/SubjectiveStudentSubmission';
import type { SubjectiveSubmissionList } from '../models/SubjectiveSubmissionList';
import type { SubjectiveSubmitResult } from '../models/SubjectiveSubmitResult';
import type { SubjectiveTest } from '../models/SubjectiveTest';
import type { SubjectiveTestDetail } from '../models/SubjectiveTestDetail';
import type { UpdateSubjectiveTestRequest } from '../models/UpdateSubjectiveTestRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SubjectiveTestsService {
    /**
     * List subjective tests available to the authenticated student
     * Published tests from every batch where the student has an active membership, with availability and the student's own status.
     * @param businessId
     * @returns any Available subjective tests fetched successfully
     * @throws ApiError
     */
    public static getApiBusinessSubjectiveTestsAvailable(
        businessId: number,
    ): CancelablePromise<(ApiResponse & {
        data?: Array<SubjectiveAvailableTest>;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/business/{businessId}/subjective-tests/available',
            path: {
                'businessId': businessId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }
    /**
     * Publish a draft subjective test
     * Requires an uploaded question paper, positive marks and duration, and a future deadline after the start time.
     * @param businessId
     * @param requestBody
     * @returns any Subjective test published successfully
     * @throws ApiError
     */
    public static postApiBusinessSubjectiveTestsPublish(
        businessId: number,
        requestBody: PublishSubjectiveTestRequest,
    ): CancelablePromise<(ApiResponse & {
        data?: SubjectiveTest;
    })> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/business/{businessId}/subjective-tests/publish',
            path: {
                'businessId': businessId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Test is not ready to publish`,
                404: `Subjective test not found`,
            },
        });
    }
    /**
     * Get the authenticated student's own submission
     * Marks, remarks and the checked copy are included only once the submission is CHECKED.
     * @param businessId
     * @param submissionId
     * @returns any Submission fetched successfully
     * @throws ApiError
     */
    public static getApiBusinessSubjectiveTestsSubmissions(
        businessId: number,
        submissionId: string,
    ): CancelablePromise<(ApiResponse & {
        data?: SubjectiveStudentSubmission;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/business/{businessId}/subjective-tests/submissions/{submissionId}',
            path: {
                'businessId': businessId,
                'submissionId': submissionId,
            },
            errors: {
                404: `Submission not found`,
            },
        });
    }
    /**
     * Download the authenticated student's submitted answer sheet
     * @param businessId
     * @param submissionId
     * @returns binary PDF file
     * @throws ApiError
     */
    public static getApiBusinessSubjectiveTestsSubmissionsAnswerSheet(
        businessId: number,
        submissionId: string,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/business/{businessId}/subjective-tests/submissions/{submissionId}/answer-sheet',
            path: {
                'businessId': businessId,
                'submissionId': submissionId,
            },
            errors: {
                404: `Answer sheet not found`,
            },
        });
    }
    /**
     * Download the latest checked copy of the authenticated student's answer sheet
     * Available only once the submission is CHECKED.
     * @param businessId
     * @param submissionId
     * @returns binary PDF file
     * @throws ApiError
     */
    public static getApiBusinessSubjectiveTestsSubmissionsCheckedAnswerSheet(
        businessId: number,
        submissionId: string,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/business/{businessId}/subjective-tests/submissions/{submissionId}/checked-answer-sheet',
            path: {
                'businessId': businessId,
                'submissionId': submissionId,
            },
            errors: {
                404: `Checked answer sheet not found`,
            },
        });
    }
    /**
     * Create a draft subjective test
     * Upload the question paper afterwards with PUT /{subjectiveTestId}/question-paper; it is required to publish.
     * @param businessId
     * @param requestBody
     * @returns any Subjective test created successfully
     * @throws ApiError
     */
    public static postApiBusinessSubjectiveTests(
        businessId: number,
        requestBody: CreateSubjectiveTestRequest,
    ): CancelablePromise<(ApiResponse & {
        data?: SubjectiveTest;
    })> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/business/{businessId}/subjective-tests',
            path: {
                'businessId': businessId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid input data`,
            },
        });
    }
    /**
     * List subjective tests for staff
     * Admins see every test in the business; teachers see the tests they created.
     * @param businessId
     * @param status
     * @param batchId
     * @param paperType
     * @returns any Subjective tests fetched successfully
     * @throws ApiError
     */
    public static getApiBusinessSubjectiveTests(
        businessId: number,
        status?: number,
        batchId?: number,
        paperType?: string,
    ): CancelablePromise<(ApiResponse & {
        data?: Array<SubjectiveTest>;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/business/{businessId}/subjective-tests',
            path: {
                'businessId': businessId,
            },
            query: {
                'status': status,
                'batchId': batchId,
                'paperType': paperType,
            },
        });
    }
    /**
     * Get a subjective test with per-status submission counts
     * @param businessId
     * @param subjectiveTestId
     * @returns any Subjective test fetched successfully
     * @throws ApiError
     */
    public static getApiBusinessSubjectiveTests1(
        businessId: number,
        subjectiveTestId: string,
    ): CancelablePromise<(ApiResponse & {
        data?: SubjectiveTestDetail;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/business/{businessId}/subjective-tests/{subjectiveTestId}',
            path: {
                'businessId': businessId,
                'subjectiveTestId': subjectiveTestId,
            },
            errors: {
                404: `Subjective test not found`,
            },
        });
    }
    /**
     * Update a draft subjective test
     * Send only the changed fields. Replace the question paper with PUT /{subjectiveTestId}/question-paper.
     * @param businessId
     * @param subjectiveTestId
     * @param requestBody
     * @returns any Subjective test updated successfully
     * @throws ApiError
     */
    public static putApiBusinessSubjectiveTests(
        businessId: number,
        subjectiveTestId: string,
        requestBody: UpdateSubjectiveTestRequest,
    ): CancelablePromise<(ApiResponse & {
        data?: SubjectiveTest;
    })> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/business/{businessId}/subjective-tests/{subjectiveTestId}',
            path: {
                'businessId': businessId,
                'subjectiveTestId': subjectiveTestId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid input, or the test is already published`,
                404: `Subjective test not found`,
            },
        });
    }
    /**
     * Delete a draft subjective test with no submissions
     * @param businessId
     * @param subjectiveTestId
     * @returns any Subjective test deleted successfully
     * @throws ApiError
     */
    public static deleteApiBusinessSubjectiveTests(
        businessId: number,
        subjectiveTestId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/business/{businessId}/subjective-tests/{subjectiveTestId}',
            path: {
                'businessId': businessId,
                'subjectiveTestId': subjectiveTestId,
            },
            errors: {
                400: `Test is published or has submissions`,
                404: `Subjective test not found`,
            },
        });
    }
    /**
     * Upload or replace the question paper of a draft test
     * Access is checked before the file is stored. The previous paper is deleted after the new one is saved.
     * @param businessId
     * @param subjectiveTestId
     * @param formData
     * @returns any Question paper uploaded successfully
     * @throws ApiError
     */
    public static putApiBusinessSubjectiveTestsQuestionPaper(
        businessId: number,
        subjectiveTestId: string,
        formData: {
            questionPaper: Blob;
        },
    ): CancelablePromise<(ApiResponse & {
        data?: SubjectiveTest;
    })> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/business/{businessId}/subjective-tests/{subjectiveTestId}/question-paper',
            path: {
                'businessId': businessId,
                'subjectiveTestId': subjectiveTestId,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                400: `Missing/invalid PDF, or the test is already published`,
                404: `Subjective test not found`,
            },
        });
    }
    /**
     * Download the question paper
     * Staff need access to the test. Students must have started the test.
     * @param businessId
     * @param subjectiveTestId
     * @returns binary PDF file
     * @throws ApiError
     */
    public static getApiBusinessSubjectiveTestsQuestionPaper(
        businessId: number,
        subjectiveTestId: string,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/business/{businessId}/subjective-tests/{subjectiveTestId}/question-paper',
            path: {
                'businessId': businessId,
                'subjectiveTestId': subjectiveTestId,
            },
            errors: {
                400: `Student has not started the test`,
                404: `Question paper not found`,
            },
        });
    }
    /**
     * Start or resume the student's single attempt
     * @param businessId
     * @param subjectiveTestId
     * @returns any Attempt started or resumed
     * @throws ApiError
     */
    public static postApiBusinessSubjectiveTestsStart(
        businessId: number,
        subjectiveTestId: string,
    ): CancelablePromise<(ApiResponse & {
        data?: SubjectiveStartResult;
    })> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/business/{businessId}/subjective-tests/{subjectiveTestId}/start',
            path: {
                'businessId': businessId,
                'subjectiveTestId': subjectiveTestId,
            },
            errors: {
                400: `Test not open, time over, or already submitted`,
                404: `Subjective test not found`,
            },
        });
    }
    /**
     * Upload the answer sheet and submit the student's attempt
     * Accepted once, only for an in-progress attempt before its effective end time.
     * @param businessId
     * @param subjectiveTestId
     * @param formData
     * @returns any Answer sheet submitted successfully
     * @throws ApiError
     */
    public static postApiBusinessSubjectiveTestsSubmissions(
        businessId: number,
        subjectiveTestId: string,
        formData: {
            answerSheet: Blob;
        },
    ): CancelablePromise<(ApiResponse & {
        data?: SubjectiveSubmitResult;
    })> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/business/{businessId}/subjective-tests/{subjectiveTestId}/submissions',
            path: {
                'businessId': businessId,
                'subjectiveTestId': subjectiveTestId,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                400: `Invalid file, time over, or already submitted`,
                404: `Subjective test not found`,
            },
        });
    }
    /**
     * List the batch roster with each student's submission status
     * Includes active batch students who have not started (NOT_STARTED).
     * @param businessId
     * @param subjectiveTestId
     * @param status
     * @param search Matches student name or email
     * @param page
     * @param limit
     * @returns any Submissions fetched successfully
     * @throws ApiError
     */
    public static getApiBusinessSubjectiveTestsSubmissions1(
        businessId: number,
        subjectiveTestId: string,
        status?: SubjectiveDisplayStatus,
        search?: string,
        page?: number,
        limit?: number,
    ): CancelablePromise<(ApiResponse & {
        data?: SubjectiveSubmissionList;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/business/{businessId}/subjective-tests/{subjectiveTestId}/submissions',
            path: {
                'businessId': businessId,
                'subjectiveTestId': subjectiveTestId,
            },
            query: {
                'status': status,
                'search': search,
                'page': page,
                'limit': limit,
            },
            errors: {
                404: `Subjective test not found`,
            },
        });
    }
    /**
     * Get one submission with grading details
     * @param businessId
     * @param subjectiveTestId
     * @param submissionId
     * @returns any Submission fetched successfully
     * @throws ApiError
     */
    public static getApiBusinessSubjectiveTestsSubmissions2(
        businessId: number,
        subjectiveTestId: string,
        submissionId: string,
    ): CancelablePromise<(ApiResponse & {
        data?: SubjectiveStaffSubmission;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/business/{businessId}/subjective-tests/{subjectiveTestId}/submissions/{submissionId}',
            path: {
                'businessId': businessId,
                'subjectiveTestId': subjectiveTestId,
                'submissionId': submissionId,
            },
            errors: {
                404: `Submission not found`,
            },
        });
    }
    /**
     * Download a student's original answer sheet
     * @param businessId
     * @param subjectiveTestId
     * @param submissionId
     * @returns binary PDF file
     * @throws ApiError
     */
    public static getApiBusinessSubjectiveTestsSubmissionsAnswerSheet1(
        businessId: number,
        subjectiveTestId: string,
        submissionId: string,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/business/{businessId}/subjective-tests/{subjectiveTestId}/submissions/{submissionId}/answer-sheet',
            path: {
                'businessId': businessId,
                'subjectiveTestId': subjectiveTestId,
                'submissionId': submissionId,
            },
            errors: {
                404: `Answer sheet not found`,
            },
        });
    }
    /**
     * Download the latest checked copy of a student's answer sheet
     * @param businessId
     * @param subjectiveTestId
     * @param submissionId
     * @returns binary PDF file
     * @throws ApiError
     */
    public static getApiBusinessSubjectiveTestsSubmissionsCheckedAnswerSheet1(
        businessId: number,
        subjectiveTestId: string,
        submissionId: string,
    ): CancelablePromise<Blob> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/business/{businessId}/subjective-tests/{subjectiveTestId}/submissions/{submissionId}/checked-answer-sheet',
            path: {
                'businessId': businessId,
                'subjectiveTestId': subjectiveTestId,
                'submissionId': submissionId,
            },
            errors: {
                404: `Checked answer sheet not found`,
            },
        });
    }
    /**
     * Add or update marks, remarks and the checked answer sheet
     * The checked PDF is required the first time; later updates may change marks/remarks only. Sending a new PDF replaces the previous checked copy.
     * @param businessId
     * @param subjectiveTestId
     * @param submissionId
     * @param formData
     * @returns any Submission graded successfully
     * @throws ApiError
     */
    public static putApiBusinessSubjectiveTestsSubmissionsGrade(
        businessId: number,
        subjectiveTestId: string,
        submissionId: string,
        formData: {
            /**
             * JSON string matching GradeSubjectiveSubmissionRequest
             */
            data: string;
            checkedAnswerSheet?: Blob;
        },
    ): CancelablePromise<(ApiResponse & {
        data?: SubjectiveStaffSubmission;
    })> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/business/{businessId}/subjective-tests/{subjectiveTestId}/submissions/{submissionId}/grade',
            path: {
                'businessId': businessId,
                'subjectiveTestId': subjectiveTestId,
                'submissionId': submissionId,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                400: `Invalid marks/file, or the submission is not submitted yet`,
                404: `Submission not found`,
                409: `Updated by someone else at the same time`,
            },
        });
    }
}
