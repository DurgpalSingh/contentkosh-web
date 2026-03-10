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

export const hasMinLength = (min: number, label: string): Validator => (value) => {
    if (value.trim().length < min) {
        return `${label} must be at least ${min} characters long`;
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
    // Allows letters, numbers, spaces, underscores, and hyphens
    if (!/^[a-zA-Z0-9\s_-]+$/.test(value)) {
        return `${label} can only contain letters, numbers, spaces, hyphens (-), and underscores (_)`;
    }
    return null;
};

export const hasValidQualificationCharacters = (label: string): Validator => (value) => {
    // Allows letters, numbers, spaces, dots, hyphens, and underscores
    if (!/^[a-zA-Z0-9._-\s]+$/.test(value)) {
        return `${label} can only contain letters, numbers, spaces, dots (.), hyphens (-), and underscores (_)`;
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
    ]);
}

/**
 * Validates a teacher qualification.
 *
 * @param qualification The qualification to validate.
 * @param maxLength The maximum allowed length (default: 100).
 * @returns An error message string if invalid, or null if valid.
 */
export function validateQualification(qualification: string, maxLength: number = 100): string | null {
    const trimmedQualification = qualification ? qualification.trim() : '';

    return validate(trimmedQualification, [
        isRequired('Qualification'),
        hasMinLength(3, 'Qualification'),
        hasMaxLength(maxLength, 'Qualification'),
        containsAlphabet('Qualification'),
        hasValidQualificationCharacters('Qualification'),
    ]);
}

/**
 * Validates that a value is present (not null, undefined, or empty string).
 * 
 * @param value The value to check.
 * @param label The label for the error message.
 * @returns An error message string if invalid, or null if valid.
 */
export function validateRequired(value: unknown, label: string): string | null {
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
 * Validates an email address.
 * 
 * @param email The email to validate.
 * @returns An error message string if invalid, or null if valid.
 */
export function validateEmail(email: string): string | null {
    if (!email || !email.trim()) {
        return 'Email is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return 'Please enter a valid email address';
    }

    return null;
}

/**
 * Validates a mobile number.
 * 
 * @param mobile The mobile number to validate.
 * @returns An error message string if invalid, or null if valid.
 */
export function validateMobile(mobile: string | undefined): string | null {
    if (!mobile || !mobile.trim()) {
        return null; // Mobile is optional
    }

    // Basic validation for 10-digit mobile number
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobile.replace(/[- ]/g, ''))) {
        return 'Please enter a valid 10-digit mobile number';
    }

    return null;
}

/**
 * Validates a password.
 * 
 * @param password The password to validate.
 * @returns An error message string if invalid, or null if valid.
 */
export function validatePassword(password: string): string | null {
    if (!password) {
        return 'Password is required';
    }

    if (password.length < 6) {
        return 'Password must be at least 6 characters long';
    }

    return null;
}

/**
 * Validation errors for professional step of teacher profile.
 */
export interface ProfessionalStepErrors {
  qualification?: string;
  experienceYears?: string;
  designation?: string;
}

const MAX_TEACHER_EXPERIENCE_YEARS = 50;

/**
 * Validates professional step fields for teacher profile.
 * 
 * @param qualification The teacher's qualification
 * @param experienceYears The teacher's years of experience
 * @param designation The teacher's designation
 * @returns An object with validation errors, or an empty object if valid
 */
export function validateProfessionalStep(
  qualification: string,
  experienceYears: number | string,
  designation: string
): ProfessionalStepErrors {
  const errors: ProfessionalStepErrors = {};

  const qualificationError = validateQualification(qualification, 100);
  if (qualificationError) {
    errors.qualification = qualificationError;
  }

  if (experienceYears === '' || experienceYears === null) {
    errors.experienceYears = 'Experience is required';
  } else {
    const parsedExperience = typeof experienceYears === 'number' ? experienceYears : Number(experienceYears);

    if (!Number.isFinite(parsedExperience) || !Number.isInteger(parsedExperience)) {
      errors.experienceYears = 'Experience must be a valid whole number';
    } else if (parsedExperience < 0) {
    errors.experienceYears = 'Experience cannot be negative';
    } else if (parsedExperience > MAX_TEACHER_EXPERIENCE_YEARS) {
      errors.experienceYears = `Experience cannot be unrealistic`;
    }
  }

  const designationError = validateEntityName(designation, 'Designation', 100);
  if (designationError) {
    errors.designation = designationError;
  }

  return errors;
}

