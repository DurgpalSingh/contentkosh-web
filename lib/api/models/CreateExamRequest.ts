/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateExamRequest = {
    /**
     * Name of the exam (required)
     */
    name: string;
    /**
     * Description of the exam
     */
    description?: string;
    /**
     * Status of the exam
     */
    status?: CreateExamRequest.status;
    /**
     * ID of the business this exam belongs to (required)
     */
    businessId: any;
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
export namespace CreateExamRequest {
    /**
     * Status of the exam
     */
    export enum status {
        ACTIVE = 'ACTIVE',
        INACTIVE = 'INACTIVE',
    }
}

