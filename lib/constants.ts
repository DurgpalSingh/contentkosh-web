export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
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
} as const;

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT',
  USER: 'USER',
} as const;


export const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;
