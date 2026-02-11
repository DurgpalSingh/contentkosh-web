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
    // TODO : need to Improve this.
    if (!/^(?=.*[A-Za-z]).+$/.test(name)) {
        return `${entityLabel} must contain at least one alphabet character.`;
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
    if (!startDate && !endDate) return null;

    if (!startDate || !endDate) {
        return 'Start Date and End Date must be selected together';
    }

    if (new Date(startDate) > new Date(endDate)) {
        return 'Start Date must be before End Date';
    }
    return null;
}

/**
 * Validates a Course name with specific rules:
 * - Must not be empty.
 * - Must not exceed maxLength.
 * - Must contain at least one alphabet.
 * - Can contain alphabets, numbers, spaces, hyphens, and underscores.
 * - Numbers allowed only when combined with alphabets (implicitly covered if at least one alphabet is required).
 * - Hyphens and underscores allowed only between words/alphanumeric characters.
 * 
 * @param name The course name to validate.
 * @param maxLength The maximum allowed length (default: 100).
 * @returns An error message string if invalid, or null if valid.
 */
export function validateCourseName(name: string, maxLength: number = 100): string | null {
    if (!name || !name.trim()) {
        return 'Course name is required';
    }

    const trimmedName = name.trim();

    if (trimmedName.length > maxLength) {
        return `Course name cannot exceed ${maxLength} characters`;
    }

    // Must contain at least one alphabet
    if (!/[a-zA-Z]/.test(trimmedName)) {
        return 'Course name must contain at least one alphabet';
    }

    // Allowed characters: alphabets, numbers, spaces, hyphens, underscores
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(trimmedName)) {
        return 'Course name contains invalid characters';
    }

    // Hyphens and underscores allowed only between words (alphanumeric characters)
    // This means they cannot be at the start or end, and cannot be adjacent to each other if we want strictly "between" words?
    // The requirement says: "allowed only when used between words". 
    // Examples: "NEET-UG" (ok), "Test_Series" (ok).
    // Start/End check:
    if (/^[\-_]|[\-_]$/.test(trimmedName)) {
        return 'Hyphens and underscores cannot be at the start or end of the name';
    }

    // Check for consecutive special characters (optional but good practice based on "between words")
    // If "Word--Word" is allowed or not? "between words" usually implies single separator.
    // Let's assume single separator for now to be safe, or just ensure they are surrounded by alphanumeric.
    // Actually, simply ensuring they are not at start/end and the string is valid characters might be enough for "between", 
    // but let's strictly check that any - or _ is followed by an alphanumeric (except if it's the last char, which we already banned).

    // A stricter regex for "words separated by - or _ or space":
    // Words are made of alphanumeric.
    // This regex matches a word, followed by optional separators and more words.
    // But simplistic approach: ensure - and _ are not at start/end (already done).
    // Ensure they are not adjacent to each other? "A-_B". Probably invalid.
    if (/[\-_]{2,}/.test(trimmedName)) {
        return 'Hyphens and underscores cannot be consecutive';
    }

    // Also user requirement: "numbers should be allowed only when combined with alphabets, not as a standalone value".
    // This is covered by "Must contain at least one alphabet".
    // If input is "9", it fails no-alphabet check.
    // If input is "9A", it passes no-alphabet check.

    return null;
}
