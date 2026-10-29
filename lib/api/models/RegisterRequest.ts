/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

export type RegisterRequest = {
    /**
     * User email address
     */
    email: string;
    /**
     * User password (minimum 6 characters)
     */
    password: string;
    /**
     * User full name
     */
    name: string;
    /**
     * Optional mobile number
     */
    mobile?: string;
    /**
     * Slug of an existing business to join as a guest. Omit to register a new institute owner, then `business` is required.
     */
    slug?: string;
    /**
     * Institute details, required when `slug` is omitted. The business is created only once the emailed link is opened.
     */
    business?: {
        instituteName: string;
        slug: string;
        logo_url?: string;
        phone?: string;
        email?: string;
        tagline?: string;
        address?: string;
        youtubeUrl?: string;
        instagramUrl?: string;
        linkedinUrl?: string;
        facebookUrl?: string;
    };
};

