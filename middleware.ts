import { NextRequest, NextResponse } from 'next/server';
import {
  getNormalizedDashboardPath,
  getUnauthorizedRedirect,
  isRouteAllowed,
  type JwtClaims,
} from '@/lib/route-guard';

const ACCESS_TOKEN_COOKIE_KEY = 'ck_access_token';
const REFRESH_TOKEN_COOKIE_KEY = 'ck_refresh_token';
const AUTH_PATHS = new Set(['/login', '/register']);
const VALID_ROLES = new Set<JwtClaims['role']>(['ADMIN', 'SUPERADMIN', 'TEACHER', 'STUDENT', 'USER']);

function isProtectedDashboardPath(pathname: string): boolean {
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) return true;
  return /^\/[^/]+\/dashboard(?:\/|$)/.test(pathname);
}

function getLoginRedirectResponse(request: NextRequest): NextResponse {
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = '/login';
  loginUrl.search = '';
  loginUrl.searchParams.set('next', `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

function decodeRoleFromToken(token: string | undefined): JwtClaims['role'] | null {
  if (!token) return null;

  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;

    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - (base64.length % 4)) % 4);
    const payload = JSON.parse(atob(base64 + padding)) as Partial<JwtClaims>;
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
  const isProtectedPath = isProtectedDashboardPath(pathname);
  const isAuthPath = AUTH_PATHS.has(pathname);

  if (!isProtectedPath && !isAuthPath) return NextResponse.next();

  const hasAccessToken = Boolean(request.cookies.get(ACCESS_TOKEN_COOKIE_KEY)?.value);
  const hasRefreshToken = Boolean(request.cookies.get(REFRESH_TOKEN_COOKIE_KEY)?.value);
  const isAuthenticated = hasAccessToken || hasRefreshToken;

  if (isProtectedPath && !isAuthenticated) {
    return getLoginRedirectResponse(request);
  }

  if (isProtectedPath) {
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
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = '/dashboard';
    dashboardUrl.search = '';
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/:slug/dashboard',
    '/:slug/dashboard/:path*',
    '/dashboard',
    '/dashboard/:path*',
    '/login',
    '/register',
    '/auth/login',
    '/auth/register',
  ],
};
