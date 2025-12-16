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
