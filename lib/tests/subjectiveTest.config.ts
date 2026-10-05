/** Subjective test upload rules. Mirrors backend `src/config/subjectiveTest.config.ts`. */
export const SUBJECTIVE_TEST_UPLOAD = {
  accept: 'application/pdf,.pdf',
  acceptedLabel: 'PDF',
  maxPdfSizeMb: 20,
} as const;

/** Show the "time almost over" warning on the attempt page below this many seconds. */
export const SUBJECTIVE_TIME_WARNING_SECONDS = 5 * 60;

export const SUBJECTIVE_SUBMISSIONS_PAGE_SIZE = 20;
