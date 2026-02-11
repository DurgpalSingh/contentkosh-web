/**
 * Validates an entity name (e.g., Exam name, Course name).
 * 
 * @param name The name to validate.
 * @param entityLabel The label of the entity for the error message (default: 'Name').
 * @param maxLength The maximum allowed length (default: 50).
 * @returns An error message string if invalid, or null if valid.
 */
export type Validator = (value: string) => string | null;

export const isRequired = (label: string): Validator => (value) => {
    if (!value || !value.trim()) {
        return `${label} is required`;
    }
    return null;
};

export const hasMaxLength = (max: number, label: string): Validator => (value) => {
    if (value.trim().length > max) {
        return `${label} cannot exceed ${max} characters`;
    }
    return null;
};

export const containsAlphabet = (label: string): Validator => (value) => {
    if (!/[a-zA-Z]/.test(value)) {
        return `${label} must contain at least one alphabet`;
    }
    return null;
};

export const hasValidCharacters = (label: string): Validator => (value) => {
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(value)) {
        return `${label} contains invalid characters`;
    }
    return null;
};

export const noStartEndSpecialChars = (): Validator => (value) => {
    if (/^[\-_]|[\-_]$/.test(value)) {
        return 'Hyphens and underscores cannot be at the start or end of the name';
    }
    return null;
};

export const noConsecutiveSpecialChars = (): Validator => (value) => {
    if (/[\-_]{2,}/.test(value)) {
        return 'Hyphens and underscores cannot be consecutive';
    }
    return null;
};

export function validate(value: string, validators: Validator[]): string | null {
    for (const validator of validators) {
        const error = validator(value);
        if (error) {
            return error;
        }
    }
    return null;
}

/**
 * Validates an entity name (e.g., Exam name, Course name).
 * 
 * @param name The name to validate.
 * @param entityLabel The label of the entity for the error message (default: 'Name').
 * @param maxLength The maximum allowed length (default: 50).
 * @returns An error message string if invalid, or null if valid.
 */
export function validateEntityName(name: string, entityLabel: string = 'Name', maxLength: number = 50): string | null {
    const trimmedName = name ? name.trim() : '';

    return validate(trimmedName, [
        isRequired(entityLabel),
        hasMaxLength(maxLength, entityLabel),
        containsAlphabet(entityLabel),
        hasValidCharacters(entityLabel),
        noStartEndSpecialChars(),
        noConsecutiveSpecialChars(),
    ]);
}

/**
 * Validates that a value is present (not null, undefined, or empty string).
 * 
 * @param value The value to check.
 * @param label The label for the error message.
 * @returns An error message string if invalid, or null if valid.
 */
export function validateRequired(value: any, label: string): string | null {
    if (value === null || value === undefined || (typeof value === 'string' && !value.trim())) {
        return `${label} is required`;
    }
    return null;
}

/**
 * Validates that the start date is before the end date.
 * 
 * @param startDate The start date string.
 * @param endDate The end date string.
 * @param startLabel Label for start date (default: 'Start date').
 * @param endLabel Label for end date (default: 'End date').
 * @returns An error message string if invalid, or null if valid.
 */
export function validateDateRange(
    startDate: string,
    endDate: string
): string | null {
    if (!startDate && !endDate) return null;

    if (!startDate || !endDate) {
        return 'Start Date and End Date must be selected together';
    }

    if (new Date(startDate) > new Date(endDate)) {
        return 'Start Date must be before End Date';
    }
    return null;
}
