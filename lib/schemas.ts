import { z } from 'zod';
import { validateEntityName } from './validation';

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

const createEntityNameFieldSchema = ({
    label,
    maxLength = 50,
}: {
    label: string;
    maxLength?: number;
}) =>
    z.string().superRefine((value, ctx) => {
        const validationError = validateEntityName(value, label, maxLength);

        if (validationError) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: validationError,
            });
        }
    });

/**
 * Schema for Batch creation/editing.
 * Extends dateRangeFields and adds batch-specific fields, then applies refinement.
 */
export const batchSchema = z.object({
    codeName: createEntityNameFieldSchema({
        label: 'Batch code name',
        maxLength: 100,
    }),
    displayName: createEntityNameFieldSchema({
        label: 'Display name',
        maxLength: 100,
    }),
}).merge(dateRangeFields).refine(dateRangeRefinement, dateRangeRefinementMessage);

export type BatchFormData = z.infer<typeof batchSchema>;
