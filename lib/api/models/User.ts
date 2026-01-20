/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type User = {
    /**
     * User ID
     */
    id?: number;
    /**
     * User email address
     */
    email?: string;
    /**
     * User full name
     */
    name?: string;
    /**
     * User mobile number
     */
    mobile?: string;
    /**
     * User role
     */
    role?: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'USER';
    /**
     * User status
     */
    status?: 'ACTIVE' | 'INACTIVE';
    /**
     * User creation timestamp
     */
    createdAt?: string;
    /**
     * User last update timestamp
     */
    updatedAt?: string;
};

