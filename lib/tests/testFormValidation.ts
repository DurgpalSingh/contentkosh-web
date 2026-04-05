import { EXAM_DURATION_MIN, EXAM_DURATION_MAX } from './testConstants';
import { TEST_KIND, type TestKind } from './testConstants';

export type TestFormErrors = {
  name?: string;
  batchId?: string;
  subjectId?: string;
  deadlineAt?: string;
  durationMinutes?: string;
  defaultMarksPerQuestion?: string;
};

export function validateTestForm(values: {
  name: string;
  batchId?: number;
  subjectId?: number;
  kind: TestKind;
  startAt?: string;
  deadlineAt?: string;
  durationMinutes?: number;
  defaultMarksPerQuestion?: number;
  requireBatch?: boolean;
  requireSubject?: boolean;
}): TestFormErrors {
  const errors: TestFormErrors = {};

  if (!values.name.trim()) {
    errors.name = 'Test name is required';
  }

  if (values.requireBatch && !values.batchId) {
    errors.batchId = 'Please select a batch';
  }

  if (values.requireSubject && !values.subjectId) {
    errors.subjectId = 'Please select a subject';
  }

  if (values.kind === TEST_KIND.EXAM) {
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
