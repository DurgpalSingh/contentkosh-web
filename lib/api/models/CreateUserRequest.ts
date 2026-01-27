/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateUserRequest = {
    /**
     * User full name
     */
    name: string;
    /**
     * Valid email address
     */
    email: string;
    /**
     * Mobile number
     */
    mobile?: string;
    /**
     * Password (min 6 chars)
     */
    password: string;
    /**
     * User role
     */
    role: CreateUserRequest.role;
};
export namespace CreateUserRequest {
    /**
     * User role
     */
    export enum role {
        ADMIN = 'ADMIN',
        TEACHER = 'TEACHER',
        STUDENT = 'STUDENT',
        USER = 'USER',
    }
}

