export interface JwtClaims {
  id: number;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'SUPERADMIN' | 'USER';
  businessId?: number;
  exp?: number;
}

export interface RoleRouteRule {
  prefix: string;
  allowedRoles: JwtClaims['role'][];
}

const ADMIN_ROLES: JwtClaims['role'][] = ['ADMIN', 'SUPERADMIN'];

const roleRouteRules: RoleRouteRule[] = [
  { prefix: '/dashboard/admin', allowedRoles: ['ADMIN', 'SUPERADMIN'] },
  { prefix: '/dashboard/exams', allowedRoles: ['ADMIN', 'SUPERADMIN'] },
  { prefix: '/dashboard/courses', allowedRoles: ['ADMIN', 'SUPERADMIN'] },
  { prefix: '/dashboard/students', allowedRoles: ['ADMIN', 'SUPERADMIN'] },
  { prefix: '/dashboard/batches', allowedRoles: ['ADMIN', 'SUPERADMIN', 'TEACHER'] },
  { prefix: '/dashboard/contents', allowedRoles: ['ADMIN', 'SUPERADMIN', 'TEACHER', 'STUDENT'] },
  { prefix: '/dashboard/tests', allowedRoles: ['ADMIN', 'SUPERADMIN', 'TEACHER'] },
  { prefix: '/dashboard/student/mytest', allowedRoles: ['STUDENT'] },
];

function normalizePath(pathname: string): string {
  if (pathname === '/dashboard') return pathname;
  if (pathname.startsWith('/dashboard/')) return pathname.replace(/\/+$/, '') || '/dashboard';

  const segments = pathname.split('/').filter(Boolean);
  if (segments.length >= 2 && segments[1] === 'dashboard') {
    const normalized = `/${segments.slice(1).join('/')}`;
    return normalized.replace(/\/+$/, '') || '/dashboard';
  }

  return pathname.replace(/\/+$/, '') || '/';
}

export function getDashboardBasePath(pathname: string): string | null {
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) return '/dashboard';

  const segments = pathname.split('/').filter(Boolean);
  if (segments.length >= 2 && segments[1] === 'dashboard') return `/${segments[0]}/dashboard`;

  return null;
}

export function isRouteAllowed(role: JwtClaims['role'], normalizedPath: string): boolean {
  if (ADMIN_ROLES.includes(role)) return true;
  if (normalizedPath === '/dashboard') return true;

  const matchedRule = roleRouteRules.find((rule) =>
    normalizedPath === rule.prefix || normalizedPath.startsWith(`${rule.prefix}/`)
  );

  if (!matchedRule) return false;
  return matchedRule.allowedRoles.includes(role);
}

export function getUnauthorizedRedirect(pathname: string): string {
  const dashboardBasePath = getDashboardBasePath(pathname);
  if (!dashboardBasePath) return '/dashboard';
  return dashboardBasePath;
}

export function getNormalizedDashboardPath(pathname: string): string | null {
  const dashboardBasePath = getDashboardBasePath(pathname);
  if (!dashboardBasePath) return null;
  return normalizePath(pathname);
}
