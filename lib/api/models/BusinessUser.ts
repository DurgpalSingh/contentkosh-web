/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type BusinessUser = {
    /**
     * Business User ID
     */
    id?: number;
    /**
     * User ID
     */
    userId?: number;
    /**
     * Business ID
     */
    businessId?: number;
    /**
     * User role in the business
     */
    role?: BusinessUser.role;
    /**
     * Whether the business user is active
     */
    isActive?: boolean;
    /**
     * Business user creation timestamp
     */
    createdAt?: string;
    /**
     * Business user last update timestamp
     */
    updatedAt?: string;
    user?: {
        /**
         * User ID
         */
        id?: number;
        /**
         * User email
         */
        email?: string;
        /**
         * User name
         */
        /**
         * User name
         */
        name?: string;
        /**
         * User mobile
         */
        mobile?: string;
    };
    business?: {
        /**
         * Business ID
         */
        id?: number;
        /**
         * Business institute name
         */
        instituteName?: string;
    };
};
export namespace BusinessUser {
    /**
     * User role in the business
     */
    export enum role {
        STUDENT = 'STUDENT',
        TEACHER = 'TEACHER',
        ADMIN = 'ADMIN',
        SUPERADMIN = 'SUPERADMIN',
    }
}

