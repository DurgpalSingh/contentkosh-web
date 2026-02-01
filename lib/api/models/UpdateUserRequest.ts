/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UpdateUserRequest = {
    /**
     * User full name
     */
    name?: string;
    /**
     * Mobile number
     */
    mobile?: string;
    /**
     * User role
     */
    role?: UpdateUserRequest.role;
    /**
     * User status
     */
    status?: UpdateUserRequest.status;
};
export namespace UpdateUserRequest {
    /**
     * User role
     */
    export enum role {
        ADMIN = 'ADMIN',
        TEACHER = 'TEACHER',
        STUDENT = 'STUDENT',
        USER = 'USER',
    }
    /**
     * User status
     */
    export enum status {
        ACTIVE = 'ACTIVE',
        INACTIVE = 'INACTIVE',
    }
}

