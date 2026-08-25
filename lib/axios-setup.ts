import axios from 'axios';
import { AuthService } from '@/lib/api';
import { API_CODES, ROUTES } from '@/lib/constants';
import { MESSAGES } from '@/lib/messages';

let isRefreshing = false;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let failedQueue: any[] = [];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const processQueue = (error: any) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });

    failedQueue = [];
};

// ck_access_token/ck_refresh_token are httpOnly - only the server can clear them.
// middleware.ts only checks whether these cookies are *present*, not whether they're
// still valid, so a client-side-only redirect leaves the user "authenticated" as far
// as middleware is concerned: it bounces them straight back from /login to the
// dashboard, which bounces to a 401 again, forever. Calling logout first clears the
// cookies server-side so the redirect actually sticks.
const forceLogoutAndRedirect = async (loginUrl: string) => {
    try {
        await AuthService.postApiAuthLogout();
    } catch {
        // ignore - we redirect regardless of whether this succeeds
    }
    window.location.href = loginUrl;
};

export const setupAxiosInterceptors = () => {
    // Add a response interceptor
    axios.interceptors.response.use(
        (response) => {
            return response;
        },
        async (error) => {
            const originalRequest = error.config;

            // A business the user belongs to has been put on hold/deleted by Super Admin - this
            // will never be fixed by a token refresh, so skip straight to logging the user out
            // with the reason instead of wasting a refresh round-trip that will fail the same way.
            if (
                error.response?.data?.apiCode === API_CODES.BUSINESS_SUSPENDED &&
                !originalRequest?.url?.includes('auth/logout')
            ) {
                if (typeof window !== 'undefined') {
                    // Backend sends only raw `action` + `reason` - the sentence is composed
                    // entirely on this side (see lib/messages.ts).
                    const message = MESSAGES.businessSuspended(error.response.data.action, error.response.data.reason);
                    const loginUrl = new URL(ROUTES.LOGIN, window.location.origin);
                    loginUrl.searchParams.set('reason', message);
                    await forceLogoutAndRedirect(loginUrl.toString());
                }
                return Promise.reject(error);
            }

            // If auth fails and we haven't tried to refresh yet
            if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {

                // If it's a login, refresh, or logout request that failed, don't retry - just fail
                if (
                    originalRequest.url?.includes('auth/login') ||
                    originalRequest.url?.includes('auth/refresh') ||
                    originalRequest.url?.includes('auth/logout')
                ) {
                    return Promise.reject(error);
                }

                if (isRefreshing) {
                    return new Promise(function (resolve, reject) {
                        failedQueue.push({ resolve, reject });
                    }).then(() => {
                        return axios(originalRequest);
                    }).catch(err => {
                        return Promise.reject(err);
                    });
                }

                originalRequest._retry = true;
                isRefreshing = true;

                try {
                    await AuthService.postApiAuthRefresh({} as { refreshToken: string });
                    processQueue(null);
                    return axios(originalRequest);
                } catch (err) {
                    processQueue(err);
                    // If refresh fails, clear the stale session cookies and redirect to login
                    if (typeof window !== 'undefined') {
                        await forceLogoutAndRedirect(ROUTES.LOGIN);
                    }
                    return Promise.reject(err);
                } finally {
                    isRefreshing = false;
                }
            }

            return Promise.reject(error);
        }
    );
};
