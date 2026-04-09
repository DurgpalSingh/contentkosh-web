export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  TESTS: '/dashboard/tests',
  ANNOUNCEMENTS: '/dashboard/announcements',
  ADMIN: {
    USERS: '/dashboard/admin/users',
    ANNOUNCEMENTS: '/dashboard/announcements',
  },
  TEACHER: {
    CLASSES: '/dashboard/teacher/classes',
    ANNOUNCEMENTS: '/dashboard/announcements',
  },
  STUDENT: {
    CLASSES: '/dashboard/student/classes',
    ANNOUNCEMENTS: '/dashboard/announcements',
    MYTEST: '/dashboard/student/mytest',
  },
} as const;

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT',
  USER: 'USER',
} as const;

