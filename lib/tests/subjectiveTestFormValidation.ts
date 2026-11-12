export type SubjectiveFieldErrors = {
  paperType?: string;
  totalMarks?: string;
  questionPaper?: string;
};

/** Subjective-only fields; name/batch/schedule are validated by `validateTestForm`. */
export function validateSubjectiveFields(values: {
  paperType: string;
  totalMarks: number;
  hasQuestionPaper: boolean;
  requireQuestionPaper?: boolean;
}): SubjectiveFieldErrors {
  const errors: SubjectiveFieldErrors = {};
  if (!values.paperType.trim()) errors.paperType = 'Paper type is required';
  if (!(values.totalMarks > 0)) errors.totalMarks = 'Total marks must be greater than 0';
  if (values.requireQuestionPaper && !values.hasQuestionPaper) {
    errors.questionPaper = 'Upload the question paper';
  }
  return errors;
}

/** Marks entered while grading must be 0..totalMarks. */
export function validateGradeMarks(marks: number, totalMarks: number): string | undefined {
  if (Number.isNaN(marks)) return 'Enter the marks awarded';
  if (marks < 0) return 'Marks cannot be negative';
  if (marks > totalMarks) return `Marks cannot be more than ${totalMarks}`;
  return undefined;
}
