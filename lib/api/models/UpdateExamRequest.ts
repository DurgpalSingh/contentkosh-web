/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UpdateExamRequest = {
    /**
     * Name of the exam
     */
    name?: string;
    /**
     * Description of the exam
     */
    description?: string;
    /**
     * Status of the exam
     */
    status?: UpdateExamRequest.status;
    /**
     * Unique code for the exam
     */
    code?: string;
    /**
     * Start date of the exam
     */
    startDate?: string;
    /**
     * End date of the exam
     */
    endDate?: string;
};
export namespace UpdateExamRequest {
    /**
     * Status of the exam
     */
    export enum status {
        ACTIVE = 'ACTIVE',
        INACTIVE = 'INACTIVE',
    }
}

