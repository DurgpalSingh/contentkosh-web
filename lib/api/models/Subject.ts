/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Subject = {
    /**
     * Subject ID
     */
    id: number;
    /**
     * Name of the subject (e.g., Geography, History, Physics)
     */
    name?: string;
    /**
     * Description of the subject
     */
    description?: string;
    /**
     * Status of the subject
     */
    status?: Subject.status;
    /**
     * ID of the course this subject belongs to
     */
    courseId?: number;
    /**
     * Subject creation timestamp
     */
    createdAt?: string;
    /**
     * Subject last update timestamp
     */
    updatedAt?: string;
};
export namespace Subject {
    /**
     * Status of the subject
     */
    export enum status {
        ACTIVE = 'ACTIVE',
        INACTIVE = 'INACTIVE',
    }
}

