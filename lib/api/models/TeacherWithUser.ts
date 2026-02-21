/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type TeacherWithUser = {
    id: number;
    user?: {
        id: number;
        name: string;
        email: string;
        mobile?: string;
        role: string;
    };
    userId: number;
    businessId: number;
    designation?: string;
    qualification?: string;
    experienceYears?: number;
    languages?: string[];
    bio?: string;
    gender?: string;
    dob?: Date | string;
    address?: string;
}