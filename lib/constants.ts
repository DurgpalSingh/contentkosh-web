export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  AI: '/dashboard/ai',
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
} as const;

export const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;
