import axios from 'axios';
import { OpenAPI } from '@/lib/api';
import { authApi } from '@/lib/auth';
import { AuthService } from '@/lib/api';

let isRefreshing = false;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let failedQueue: any[] = [];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
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

            // If error is 401 and we haven't tried to refresh yet
            if (error.response?.status === 401 && !originalRequest._retry) {

                // If it's a login or refresh request that failed, don't retry - just fail
                if (originalRequest.url?.includes('auth/login') || originalRequest.url?.includes('auth/refresh')) {
                    return Promise.reject(error);
                }

                if (isRefreshing) {
                    return new Promise(function (resolve, reject) {
                        failedQueue.push({ resolve, reject });
                    }).then(token => {
                        originalRequest.headers['Authorization'] = 'Bearer ' + token;
                        return axios(originalRequest);
                    }).catch(err => {
                        return Promise.reject(err);
                    });
                }

                originalRequest._retry = true;
                isRefreshing = true;

                try {
                    const refreshToken = authApi.getRefreshToken();

                    if (!refreshToken) {
                        throw new Error('No refresh token available');
                    }

                    const response = await AuthService.postApiAuthRefresh({ refreshToken });

                    if (response.data?.accessToken) {
                        const newToken = response.data.accessToken;
                        const newRefreshToken = response.data.refreshToken;

                        authApi.setToken(newToken);
                        if (newRefreshToken) {
                            authApi.setRefreshToken(newRefreshToken);
                        }

                        // Update OpenAPI config as well
                        OpenAPI.TOKEN = newToken;

                        // Update authorization header
                        axios.defaults.headers.common['Authorization'] = 'Bearer ' + newToken;
                        originalRequest.headers['Authorization'] = 'Bearer ' + newToken;

                        processQueue(null, newToken);
                        return axios(originalRequest);
                    } else {
                        throw new Error('Refresh failed - no access token returned');
                    }
                } catch (err) {
                    processQueue(err, null);
                    // If refresh fails, logout user
                    authApi.clearTokens();
                    window.location.href = '/auth/login'; // Redirect to login
                    return Promise.reject(err);
                } finally {
                    isRefreshing = false;
                }
            }

            return Promise.reject(error);
        }
    );
};
