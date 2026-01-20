import { z } from 'zod';

/**
 * Base schema fields for date range.
 * Does not include refinement to allow extension.
 */
export const dateRangeFields = z.object({
    startDate: z.date({ message: 'Start date is required' }),
    endDate: z.date({ message: 'End date is required' }),
});

/**
 * Reusable refinement for date range.
 */
export const dateRangeRefinement = (data: { startDate: Date; endDate: Date }) => data.startDate <= data.endDate;
export const dateRangeRefinementMessage = {
    message: 'Start date must be before end date',
    path: ['startDate'],
};

/**
 * Schema for date range validation.
 */
export const dateRangeSchema = dateRangeFields.refine(dateRangeRefinement, dateRangeRefinementMessage);

/**
 * Schema for Batch creation/editing.
 * Extends dateRangeFields and adds batch-specific fields, then applies refinement.
 */
export const batchSchema = dateRangeFields.extend({
    codeName: z.string().trim().min(1, 'Batch code name is required'),
    displayName: z.string().trim().min(1, 'Display name is required'),
}).refine(dateRangeRefinement, dateRangeRefinementMessage);

export type BatchFormData = z.infer<typeof batchSchema>;
