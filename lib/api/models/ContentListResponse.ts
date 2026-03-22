/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Content } from './Content';
export type ContentListResponse = {
    /**
     * List of contents
     */
    contents?: Array<Content>;
    /**
     * Total number of contents
     */
    total?: number;
    /**
     * Whether there are more contents to fetch
     */
    hasMore?: boolean;
};

