import { SubjectiveAvailability, SubjectiveDisplayStatus } from '@/lib/api';

/** Student-facing labels. */
export const SUBJECTIVE_DISPLAY_STATUS_LABEL: Record<SubjectiveDisplayStatus, string> = {
  [SubjectiveDisplayStatus.NOT_STARTED]: 'Not started',
  [SubjectiveDisplayStatus.IN_PROGRESS]: 'In progress',
  [SubjectiveDisplayStatus.SUBMITTED]: 'Submitted',
  [SubjectiveDisplayStatus.CHECKED]: 'Checked',
  [SubjectiveDisplayStatus.EXPIRED]: 'Expired',
};

/** Staff-facing labels: a submitted sheet is "Pending" checking. */
export const SUBJECTIVE_STAFF_STATUS_LABEL: Record<SubjectiveDisplayStatus, string> = {
  ...SUBJECTIVE_DISPLAY_STATUS_LABEL,
  [SubjectiveDisplayStatus.SUBMITTED]: 'Pending',
};

export const SUBJECTIVE_DISPLAY_STATUS_BADGE: Record<SubjectiveDisplayStatus, string> = {
  [SubjectiveDisplayStatus.NOT_STARTED]: 'bg-gray-50 text-gray-600 border-gray-200',
  [SubjectiveDisplayStatus.IN_PROGRESS]: 'bg-blue-50 text-blue-700 border-blue-200',
  [SubjectiveDisplayStatus.SUBMITTED]: 'bg-amber-50 text-amber-600 border-amber-200',
  [SubjectiveDisplayStatus.CHECKED]: 'bg-green-50 text-green-600 border-green-200',
  [SubjectiveDisplayStatus.EXPIRED]: 'bg-red-50 text-red-600 border-red-200',
};

export const SUBJECTIVE_AVAILABILITY_LABEL: Record<SubjectiveAvailability, string> = {
  [SubjectiveAvailability.UPCOMING]: 'Starts soon',
  [SubjectiveAvailability.OPEN]: 'Live',
  [SubjectiveAvailability.CLOSED]: 'Closed',
};

export const SUBJECTIVE_AVAILABILITY_BADGE: Record<SubjectiveAvailability, string> = {
  [SubjectiveAvailability.UPCOMING]: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  [SubjectiveAvailability.OPEN]: 'bg-green-50 text-green-600 border-green-200',
  [SubjectiveAvailability.CLOSED]: 'bg-gray-50 text-gray-600 border-gray-200',
};

/** Neutral pill (paper type, draft). */
export const SUBJECTIVE_NEUTRAL_BADGE = 'bg-gray-100 text-gray-800 border-gray-200';

/** Kind badge shared by teacher and student lists. */
export const SUBJECTIVE_KIND_BADGE = 'bg-sky-50 text-sky-800';

/**
 * Window state for staff views (student APIs return `availability` from the server).
 * Mirrors backend `deriveAvailability`.
 */
export function getSubjectiveAvailability(
  startAt: string,
  deadlineAt: string,
  now: Date = new Date(),
): SubjectiveAvailability {
  if (now < new Date(startAt)) return SubjectiveAvailability.UPCOMING;
  if (now > new Date(deadlineAt)) return SubjectiveAvailability.CLOSED;
  return SubjectiveAvailability.OPEN;
}
