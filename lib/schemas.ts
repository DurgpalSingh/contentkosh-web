import { z } from 'zod';
import { PHONE_DIGIT_LIMIT, validateEntityName } from './validation';

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

const optionalTrimmedString = z.string().trim().optional();

const optionalEmail = z
    .string()
    .trim()
    .email('Enter a valid email')
    .or(z.literal(''))
    .optional()
    .transform((value) => (value ? value : undefined));

const optionalDateString = z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
    .or(z.literal(''))
    .optional()
    .transform((value) => (value ? value : undefined));

const optionalLanguagesArray = z
    .array(z.string().trim().min(1))
    .optional()
    .transform((value) => value ?? []);

const genderSchema = z.enum(['male', 'female', 'other']);

export const settingsUserDetailsSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, 'Name is required')
        .max(100, 'Name is too long')
        .regex(/\p{L}/u, 'Name must contain at least one alphabet'),
    mobile: z
        .string()
        .trim()
        .regex(/^\d{10}$/, 'Mobile number must be a valid 10-digit number')
        .or(z.literal(''))
        .optional()
        .transform((value) => (value ? value : undefined)),
});

export const settingsTeacherProfileSchema = z.object({
    qualification: optionalTrimmedString,
    experienceYears: z
        .union([z.string(), z.number(), z.undefined()])
        .transform((value) => {
            if (value === undefined) return undefined;
            const normalized = String(value).trim();
            if (!normalized) return undefined;
            const parsed = Number(normalized);
            return Number.isNaN(parsed) ? Number.NaN : parsed;
        })
        .refine((value) => value === undefined || Number.isInteger(value), 'Experience must be a whole number')
        .refine((value) => value === undefined || (value >= 0 && value <= 60), 'Experience must be between 0 and 60'),
    designation: optionalTrimmedString,
    bio: optionalTrimmedString,
    languages: optionalLanguagesArray,
    gender: z.union([genderSchema, z.literal('')]).optional().transform((value) => (value ? value : undefined)),
    dob: optionalDateString,
    address: optionalTrimmedString,
});

export const settingsStudentProfileSchema = z.object({
    gender: z.union([genderSchema, z.literal('')]).optional().transform((value) => (value ? value : undefined)),
    dob: optionalDateString,
    languages: optionalLanguagesArray,
    address: optionalTrimmedString,
    city: optionalTrimmedString,
    bio: optionalTrimmedString,
});

export const settingsBusinessDetailsSchema = z.object({
    instituteName: z
        .string()
        .trim()
        .min(1, 'Business name is required')
        .max(100, 'Business name is too long')
        .regex(/\p{L}/u, 'Business name must contain at least one alphabet'),
    tagline: optionalTrimmedString,
    contactNumber: z
        .string()
        .trim()
        .max(PHONE_DIGIT_LIMIT, `Contact number cannot exceed ${PHONE_DIGIT_LIMIT} digits`)
        .regex(/^\d{10}$/, 'Contact number must be a valid 10-digit number')
        .or(z.literal(''))
        .optional()
        .transform((value) => (value ? value : undefined)),
    email: optionalEmail,
    address: optionalTrimmedString,
});
