export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_EMAIL: '/verify-email',
  RESEND_VERIFICATION: '/resend-verification',
  DASHBOARD: '/dashboard',
  /** Singular path; slug is applied in `DashboardLayout` for `/dashboard/*` links. */
  ANNOUNCEMENT: '/dashboard/announcement',
  TESTS: '/dashboard/tests',
  ADMIN: {
    USERS: '/dashboard/admin/users',
  },
  TEACHER: {
    CLASSES: '/dashboard/teacher/classes',
  },
  STUDENT: {
    CLASSES: '/dashboard/student/classes',
    MYTEST: '/dashboard/student/mytest',
  },
  SUPERADMIN: {
    ROOT: '/superadmin',
    BUSINESSES: '/superadmin/businesses',
  },
} as const;

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT',
  USER: 'USER',
  SUPERADMIN: 'SUPERADMIN',
} as const;

export const USER_ROLE_FILTER_ALL = 'ALL';

export const USER_ROLE_FILTER_ALL_LABEL = 'All Roles';

/** Display-only role labels - the underlying role value/API contract is unchanged. */
export const USER_ROLE_LABELS: Partial<Record<string, string>> = {
  [USER_ROLES.USER]: 'USER (Guest)',
};

export const UNKNOWN_LABEL = 'Unknown';

export const getUserRoleLabel = (role?: string): string =>
  role ? (USER_ROLE_LABELS[role] ?? role) : UNKNOWN_LABEL;

export const BUSINESS_STATUS = {
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  DELETED: 'DELETED',
} as const;

export type BusinessStatusValue = (typeof BUSINESS_STATUS)[keyof typeof BUSINESS_STATUS];

export const BUSINESS_STATUS_FILTER = {
  ALL: 'ALL',
  ...BUSINESS_STATUS,
} as const;

export type BusinessStatusFilterValue = (typeof BUSINESS_STATUS_FILTER)[keyof typeof BUSINESS_STATUS_FILTER];

/** Super Admin actions offered on a business - PAUSE/DELETE both map to BUSINESS_STATUS values, RESUME maps to ACTIVE. */
export const BUSINESS_STATUS_ACTIONS = {
  PAUSE: 'PAUSE',
  RESUME: 'RESUME',
  DELETE: 'DELETE',
} as const;

export type BusinessStatusAction = (typeof BUSINESS_STATUS_ACTIONS)[keyof typeof BUSINESS_STATUS_ACTIONS];

export const API_CODES = {
  BUSINESS_SUSPENDED: 'ERR_BUSINESS_SUSPENDED',
  EMAIL_NOT_VERIFIED: 'ERR_EMAIL_NOT_VERIFIED',
  VERIFICATION_LINK_INVALID: 'ERR_VERIFICATION_LINK_INVALID',
  VERIFICATION_LINK_EXPIRED: 'ERR_VERIFICATION_LINK_EXPIRED',
} as const;

/** Mirrors the backend: server enforces the cooldown, the UI only reflects it. */
export const EMAIL_VERIFICATION = {
  RESEND_COOLDOWN_SECONDS: 60,
  LINK_EXPIRY_MINUTES: 2,
  EMAIL_QUERY_PARAM: 'email',
  TOKEN_QUERY_PARAM: 'token',
  REASON_QUERY_PARAM: 'reason',
} as const;

/** Why the user was sent to the resend page. */
export const RESEND_REASONS = {
  EXPIRED: 'expired',
  INVALID: 'invalid',
} as const;

export type ResendReason = (typeof RESEND_REASONS)[keyof typeof RESEND_REASONS];

export const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;
