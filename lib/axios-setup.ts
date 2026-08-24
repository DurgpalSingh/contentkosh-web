import axios from 'axios';
import { AuthService } from '@/lib/api';
import { API_CODES, ROUTES } from '@/lib/constants';

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

export const setupAxiosInterceptors = () => {
    // Add a response interceptor
    axios.interceptors.response.use(
        (response) => {
            return response;
        },
        async (error) => {
            const originalRequest = error.config;

            // A business the user belongs to has been paused/deleted by Super Admin - this
            // will never be fixed by a token refresh, so skip straight to logging the user out
            // with the reason instead of wasting a refresh round-trip that will fail the same way.
            if (error.response?.data?.apiCode === API_CODES.BUSINESS_SUSPENDED) {
                if (typeof window !== 'undefined') {
                    const message = error.response.data.message || 'This institute is not currently active.';
                    const loginUrl = new URL(ROUTES.LOGIN, window.location.origin);
                    loginUrl.searchParams.set('reason', message);
                    window.location.href = loginUrl.toString();
                }
                return Promise.reject(error);
            }

            // If auth fails and we haven't tried to refresh yet
            if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {

                // If it's a login or refresh request that failed, don't retry - just fail
                if (originalRequest.url?.includes('auth/login') || originalRequest.url?.includes('auth/refresh')) {
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
                    // If refresh fails, redirect user to login
                    window.location.href = ROUTES.LOGIN;
                    return Promise.reject(err);
                } finally {
                    isRefreshing = false;
                }
            }

            return Promise.reject(error);
        }
    );
};
