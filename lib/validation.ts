/**
 * Validates an entity name (e.g., Exam name, Course name).
 * 
 * @param name The name to validate.
 * @param entityLabel The label of the entity for the error message (default: 'Name').
 * @param maxLength The maximum allowed length (default: 50).
 * @returns An error message string if invalid, or null if valid.
 */
export function validateEntityName(name: string, entityLabel: string = 'Name', maxLength: number = 50): string | null {
    if (!name || !name.trim()) {
        return `${entityLabel} is required`;
    }

    if (name.trim().length > maxLength) {
        return `${entityLabel} cannot exceed ${maxLength} characters`;
    }

    return null;
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
    if (!startDate && !endDate) return null; // Neither selected → valid

    // One selected → invalid
    if (!startDate || !endDate) {
        return 'Start Date and End Date must be selected together';
    }

    const normalize = (date: string) => {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d;
    };

    const today = normalize(new Date().toISOString());
    const start = normalize(startDate);
    const end = normalize(endDate);

    if (start < today) {
        return 'Start Date cannot be in the past';
    }

    if (end < start) {
        return 'Start Date must be before End Date';
    }
    return null;
}
