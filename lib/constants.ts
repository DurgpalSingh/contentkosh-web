export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  TESTS: '/dashboard/tests',
  ADMIN: {
    USERS: '/dashboard/admin/users',
    ANNOUNCEMENTS: '/dashboard/admin/announcements',
  },
  TEACHER: {
    CLASSES: '/dashboard/teacher/classes',
    ANNOUNCEMENTS: '/dashboard/teacher/announcements',
  },
  STUDENT: {
    CLASSES: '/dashboard/student/classes',
    ANNOUNCEMENTS: '/dashboard/student/announcements',
    MYTEST: '/dashboard/student/mytest',
  },
} as const;

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT',
  USER: 'USER',
} as const;

/**
 * Matches `/[slug]/dashboard/student/mytest/(practice|exam)/attempt/[attemptId]`.
 * Used by dashboard layout to hide chrome on fullscreen student attempts.
 */
export const STUDENT_ATTEMPT_FULLSCREEN_PATHNAME_PATTERN =
  /^\/[^/]+\/dashboard\/student\/mytest\/(practice|exam)\/attempt\/[^/]+/;
