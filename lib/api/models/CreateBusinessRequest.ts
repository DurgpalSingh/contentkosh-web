/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateBusinessRequest = {
    /**
     * Name of the coaching institute (required)
     */
    instituteName: string;
    /**
     * Unique identifier for the business URL (required)
     */
    slug: string;
    /**
     * URL or file path to the institute logo
     */
    logo?: string;
    /**
     * Institute tagline or slogan
     */
    tagline?: string;
    /**
     * Contact phone number
     */
    contactNumber?: string;
    /**
     * Contact email address
     */
    email?: string;
    /**
     * Physical address of the institute
     */
    address?: string;
    /**
     * YouTube channel URL
     */
    youtubeUrl?: string;
    /**
     * Instagram profile URL
     */
    instagramUrl?: string;
    /**
     * LinkedIn profile URL
     */
    linkedinUrl?: string;
    /**
     * Facebook page URL
     */
    facebookUrl?: string;
};

