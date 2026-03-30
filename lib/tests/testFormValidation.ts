import { EXAM_DURATION_MIN, EXAM_DURATION_MAX } from './testConstants';

export type TestFormErrors = {
  name?: string;
  batchId?: string;
  deadlineAt?: string;
  durationMinutes?: string;
  defaultMarksPerQuestion?: string;
};

export function validateTestForm(values: {
  name: string;
  batchId?: number;
  kind: 'practice' | 'exam';
  startAt?: string;
  deadlineAt?: string;
  durationMinutes?: number;
  defaultMarksPerQuestion?: number;
  requireBatch?: boolean;
}): TestFormErrors {
  const errors: TestFormErrors = {};

  if (!values.name.trim()) {
    errors.name = 'Test name is required';
  }

  if (values.requireBatch && !values.batchId) {
    errors.batchId = 'Please select a batch';
  }

  if (values.kind === 'exam') {
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
