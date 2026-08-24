/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
 
export type Business = {
    /**
     * Business ID
     */
    id?: number;
    /**
     * Name of the coaching institute
     */
    instituteName?: string;
    /**
     * Unique identifier for the business URL
     */
    slug?: string;
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
    /**
     * Business creation timestamp
     */
    createdAt?: string;
    /**
     * Business last update timestamp
     */
    updatedAt?: string;
    /**
     * Super Admin lifecycle status
     */
    status?: 'ACTIVE' | 'PAUSED' | 'DELETED';
    /**
     * Reason provided by Super Admin when pausing or deleting - null when ACTIVE
     */
    statusReason?: string | null;
    /**
     * Timestamp of the last Super Admin status change
     */
    statusChangedAt?: string | null;
};

