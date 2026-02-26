import { NextRequest, NextResponse } from 'next/server';

const ACCESS_TOKEN_COOKIE_KEY = 'ck_access_token';
const REFRESH_TOKEN_COOKIE_KEY = 'ck_refresh_token';
const AUTH_PATHS = new Set(['/login', '/register', '/auth/login', '/auth/register']);

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
