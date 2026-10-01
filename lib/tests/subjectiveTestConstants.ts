import { SubjectiveAvailability, SubjectiveDisplayStatus } from '@/lib/api';

export const SUBJECTIVE_DISPLAY_STATUS_LABEL: Record<SubjectiveDisplayStatus, string> = {
  [SubjectiveDisplayStatus.NOT_STARTED]: 'Not started',
  [SubjectiveDisplayStatus.IN_PROGRESS]: 'In progress',
  [SubjectiveDisplayStatus.SUBMITTED]: 'Submitted',
  [SubjectiveDisplayStatus.CHECKED]: 'Checked',
  [SubjectiveDisplayStatus.EXPIRED]: 'Expired',
};

export const SUBJECTIVE_DISPLAY_STATUS_BADGE: Record<SubjectiveDisplayStatus, string> = {
  [SubjectiveDisplayStatus.NOT_STARTED]: 'bg-gray-100 text-gray-600',
  [SubjectiveDisplayStatus.IN_PROGRESS]: 'bg-blue-50 text-blue-700',
  [SubjectiveDisplayStatus.SUBMITTED]: 'bg-amber-50 text-amber-700',
  [SubjectiveDisplayStatus.CHECKED]: 'bg-green-50 text-green-700',
  [SubjectiveDisplayStatus.EXPIRED]: 'bg-red-50 text-red-700',
};

export const SUBJECTIVE_AVAILABILITY_LABEL: Record<SubjectiveAvailability, string> = {
  [SubjectiveAvailability.UPCOMING]: 'Starts soon',
  [SubjectiveAvailability.OPEN]: 'Live',
  [SubjectiveAvailability.CLOSED]: 'Closed',
};

export const SUBJECTIVE_AVAILABILITY_BADGE: Record<SubjectiveAvailability, string> = {
  [SubjectiveAvailability.UPCOMING]: 'bg-yellow-50 text-yellow-700',
  [SubjectiveAvailability.OPEN]: 'bg-green-50 text-green-700',
  [SubjectiveAvailability.CLOSED]: 'bg-gray-100 text-gray-600',
};

/** Kind badge shared by teacher and student lists. */
export const SUBJECTIVE_KIND_BADGE = 'bg-sky-50 text-sky-800';
