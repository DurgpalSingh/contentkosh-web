import { EXAM_DURATION_MIN, EXAM_DURATION_MAX } from './testConstants';
import { TEST_KIND, type TestKind } from './testConstants';

export type TestFormErrors = {
  name?: string;
  description?: string;
  batchId?: string;
  subjectId?: string;
  startAt?: string;
  deadlineAt?: string;
  durationMinutes?: string;
  defaultMarksPerQuestion?: string;
};

const ALLOWED_TEST_NAME = /^[A-Za-z0-9\s()[\]_-]+$/;
const ALLOWED_TEST_NAME_WITH_HINDI = /^[A-Za-z\u0900-\u097F0-9\s()[\]_-]+$/;

const hasLetter = (value: string) => /[A-Za-z]/.test(value);
const hasLatinOrHindiLetter = (value: string) => /[A-Za-z\u0900-\u097F]/.test(value);

const getLocalNow = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes());
};

const getTestNameTextRuleError = (name: string, allowHindiName = false): string | undefined => {
  const allowedNamePattern = allowHindiName ? ALLOWED_TEST_NAME_WITH_HINDI : ALLOWED_TEST_NAME;
  if (!allowedNamePattern.test(name)) {
    if (allowHindiName) {
      return 'Only Hindi or English letters, numbers, spaces, brackets (), [], hyphen -, and underscore _ are allowed';
    }
    return 'Only letters, numbers, spaces, brackets (), [], hyphen -, and underscore _ are allowed';
  }
  if (allowHindiName) {
    if (!hasLatinOrHindiLetter(name)) return 'Test name must include at least one letter';
    return undefined;
  }
  if (!hasLetter(name)) return 'Test name must include at least one letter';
  return undefined;
};

const getDescriptionError = (description?: string): string | undefined => {
  if (!description?.trim()) return undefined;
  if (!hasLetter(description)) return 'Description must include at least one letter';
  return undefined;
};

export function validateTestForm(values: {
  name: string;
  description?: string;
  batchId?: number;
  subjectId?: number;
  kind: TestKind;
  startAt?: string;
  deadlineAt?: string;
  durationMinutes?: number;
  defaultMarksPerQuestion?: number;
  requireBatch?: boolean;
  requireSubject?: boolean;
  validateTextRules?: boolean;
  allowHindiName?: boolean;
  disallowPastStart?: boolean;
}): TestFormErrors {
  const errors: TestFormErrors = {};

  if (!values.name.trim()) {
    errors.name = 'Test name is required';
  }

  if (values.validateTextRules && values.name.trim()) {
    const nameRuleError = getTestNameTextRuleError(values.name, values.allowHindiName);
    if (nameRuleError) errors.name = nameRuleError;

    const descriptionError = getDescriptionError(values.description);
    if (descriptionError) errors.description = descriptionError;
  }

  if (values.requireBatch && !values.batchId) {
    errors.batchId = 'Please select a batch';
  }

  if (values.requireSubject && !values.subjectId) {
    errors.subjectId = 'Please select a subject';
  }

  if (values.kind === TEST_KIND.EXAM) {
    if (!values.startAt) {
      errors.startAt = 'Start date is required';
    }

    if (!values.deadlineAt) {
      errors.deadlineAt = 'Deadline is required';
    }

    if (values.startAt) {
      const startTime = new Date(values.startAt);
      if (Number.isNaN(startTime.getTime())) {
        errors.startAt = 'Start date is invalid';
      }
    }

    if (values.deadlineAt) {
      const deadlineTime = new Date(values.deadlineAt);
      if (Number.isNaN(deadlineTime.getTime())) {
        errors.deadlineAt = 'Deadline is invalid';
      }
    }

    if (values.startAt && values.disallowPastStart) {
      const startTime = new Date(values.startAt);
      if (startTime < getLocalNow()) {
        errors.startAt = "Start date-time can't be in past.";
      }
    }

    if (values.startAt && values.deadlineAt) {
      if (new Date(values.deadlineAt) <= new Date(values.startAt)) {
        errors.deadlineAt = 'Deadline must be after start time';
      }
    }

    const dur = values.durationMinutes ?? 0;
    if (dur < EXAM_DURATION_MIN || dur > EXAM_DURATION_MAX) {
      errors.durationMinutes = `Duration must be between ${EXAM_DURATION_MIN} and ${EXAM_DURATION_MAX} minutes`;
    }

    const marks = values.defaultMarksPerQuestion ?? 0;
    if (marks <= 0) {
      errors.defaultMarksPerQuestion = 'Marks per question must be greater than 0';
    }
  }

  return errors;
}
