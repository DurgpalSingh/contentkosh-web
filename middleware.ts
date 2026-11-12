import { NextRequest, NextResponse } from 'next/server';
import { decodeJwt } from 'jose';
import {
  getNormalizedDashboardPath,
  getUnauthorizedRedirect,
  isRouteAllowed,
  type JwtClaims,
} from '@/lib/route-guard';
import { ROUTES, USER_ROLES } from '@/lib/constants';

const ACCESS_TOKEN_COOKIE_KEY = 'ck_access_token';
const REFRESH_TOKEN_COOKIE_KEY = 'ck_refresh_token';
const AUTH_PATHS = new Set<string>([ROUTES.LOGIN, ROUTES.REGISTER]);
const VALID_ROLES = new Set<JwtClaims['role']>([
  USER_ROLES.ADMIN,
  USER_ROLES.SUPERADMIN,
  USER_ROLES.TEACHER,
  USER_ROLES.STUDENT,
  USER_ROLES.USER,
]);

function isProtectedDashboardPath(pathname: string): boolean {
  if (pathname === ROUTES.DASHBOARD || pathname.startsWith(`${ROUTES.DASHBOARD}/`)) return true;
  return /^\/[^/]+\/dashboard(?:\/|$)/.test(pathname);
}

function isProtectedSuperAdminPath(pathname: string): boolean {
  return pathname === ROUTES.SUPERADMIN.ROOT || pathname.startsWith(`${ROUTES.SUPERADMIN.ROOT}/`);
}

function getLoginRedirectResponse(request: NextRequest): NextResponse {
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = ROUTES.LOGIN;
  loginUrl.search = '';
  loginUrl.searchParams.set('next', `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

function decodeRoleFromToken(token: string | undefined): JwtClaims['role'] | null {
  if (!token) return null;

  try {
    const payload = decodeJwt(token) as Partial<JwtClaims>;
    const role = payload.role?.toString().toUpperCase() as JwtClaims['role'] | undefined;

    if (!role || !VALID_ROLES.has(role)) return null;
    return role;
  } catch {
    return null;
  }
}

function getUserRoleFromCookies(request: NextRequest): JwtClaims['role'] | null {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE_KEY)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE_KEY)?.value;

  return decodeRoleFromToken(accessToken) ?? decodeRoleFromToken(refreshToken);
}

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const isSuperAdminPath = isProtectedSuperAdminPath(pathname);
  const isProtectedPath = isProtectedDashboardPath(pathname) || isSuperAdminPath;
  const isAuthPath = AUTH_PATHS.has(pathname);

  if (!isProtectedPath && !isAuthPath) return NextResponse.next();

  const hasAccessToken = Boolean(request.cookies.get(ACCESS_TOKEN_COOKIE_KEY)?.value);
  const hasRefreshToken = Boolean(request.cookies.get(REFRESH_TOKEN_COOKIE_KEY)?.value);
  const isAuthenticated = hasAccessToken || hasRefreshToken;

  if (isProtectedPath && !isAuthenticated) {
    return getLoginRedirectResponse(request);
  }

  if (isSuperAdminPath) {
    const userRole = getUserRoleFromCookies(request);
    if (userRole !== USER_ROLES.SUPERADMIN) {
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = ROUTES.DASHBOARD;
      dashboardUrl.search = '';
      return NextResponse.redirect(dashboardUrl);
    }
  } else if (isProtectedPath) {
    const normalizedDashboardPath = getNormalizedDashboardPath(pathname);
    const userRole = getUserRoleFromCookies(request);

    if (normalizedDashboardPath && userRole && !isRouteAllowed(userRole, normalizedDashboardPath)) {
      const unauthorizedUrl = request.nextUrl.clone();
      unauthorizedUrl.pathname = getUnauthorizedRedirect(pathname);
      unauthorizedUrl.search = '';
      return NextResponse.redirect(unauthorizedUrl);
    }
  }

  if (isAuthPath && isAuthenticated) {
    const userRole = getUserRoleFromCookies(request);
    const landingUrl = request.nextUrl.clone();
    landingUrl.pathname = userRole === USER_ROLES.SUPERADMIN ? ROUTES.SUPERADMIN.ROOT : ROUTES.DASHBOARD;
    landingUrl.search = '';
    return NextResponse.redirect(landingUrl);
  }

  return NextResponse.next();
}

// Next.js statically analyzes `matcher` at build time and requires literal strings here -
// it cannot resolve references to constants (e.g. ROUTES.DASHBOARD), so these are kept in
// sync with lib/constants.ts by hand rather than imported.
export const config = {
  matcher: [
    '/:slug/dashboard',
    '/:slug/dashboard/:path*',
    '/dashboard',
    '/dashboard/:path*',
    '/superadmin',
    '/superadmin/:path*',
    '/login',
    '/register',
    '/auth/login',
    '/auth/register',
  ],
};
