/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Business } from './Business';

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
     * Mobile number
     */
    mobile?: string;
    /**
     * User role
     */
    role?: User.role;
    /**
     * User status
     */
    status?: User.status;
    /**
     * Business ID
     */
    businessId?: number;
    /**
     * User profile picture URL or path
     */
    profilePicture?: string | null;
    /**
     * Business details
     */
    business?: Business;
    /**
     * User creation timestamp
     */
    createdAt?: string;
    /**
     * User last update timestamp
     */
    updatedAt?: string;
};
export namespace User {
    /**
     * User role
     */
    export enum role {
        SUPERADMIN = 'SUPERADMIN',
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

