export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
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
  },
} as const;

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT',
  USER: 'USER',
} as const;

export const UPLOAD_CONSTANTS = {
  BYTES_IN_MB: 1024 * 1024,
  TYPES: {
    PDF: 'PDF',
    IMAGE: 'IMAGE',
  },
  EXTENSIONS: {
    PDF: '.pdf',
    JPG: '.jpg',
    JPEG: '.jpeg',
    PNG: '.png',
  },
  MAX_SIZE_MB: {
    PDF: 10,
    IMAGE: 5,
  },
  LABELS: {
    NO_EXTENSION: '(no extension)',
  },
  MESSAGES: {
    INVALID_FILE: 'Invalid file',
    FILE_TYPE_NOT_ACCEPTED: (ext: string, allowed: string) =>
      `File type ${ext} is not accepted. Allowed types: ${allowed}.`,
    FILE_SIZE_EXCEEDED: (maxSizeLabel: string, type: string) =>
      `File size cannot exceed ${maxSizeLabel} for ${type} files.`,
  },
} as const;

