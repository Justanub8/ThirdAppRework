import axios, { InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '~/hooks';
import Config from 'react-native-config';

const configAxios = {
    timeout: 30000,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
    baseURL: Config.BASE_API_URL,
};

const axiosInstance = axios.create(configAxios);

// Dedicated instance for refreshing tokens without circular 401 interceptors
const refreshAxiosClient = axios.create({
    baseURL: Config.BASE_API_URL,
    timeout: 15000,
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig<any>) => {
        const accessToken = useAuthStore.getState().accessToken;
        if (config.headers && accessToken) {
            config.headers.Authorization = 'Bearer ' + accessToken;
        }
        return config;
    },
    error => Promise.reject(error),
);

// Mutex lock and failed request queue for handling concurrent 401 requests during token rotation
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else if (token) {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

axiosInstance.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

        if (!originalRequest) {
            return Promise.reject(error);
        }

        const status = error.response?.status;
        const message = error.response?.data?.message;
        const isUnauthorized = status === 401 || message === 'Please authenticate';

        if (!isUnauthorized) {
            return Promise.reject(error);
        }

        const requestUrl = originalRequest.url || '';
        const isAuthBypassUrl =
            requestUrl.includes('/auth/login') ||
            requestUrl.includes('/auth/register') ||
            requestUrl.includes('/auth/refresh-token');

        if (isAuthBypassUrl) {
            if (requestUrl.includes('/auth/refresh-token')) {
                useAuthStore.getState().logoutLocal();
            }
            return Promise.reject(error);
        }

        if (originalRequest._retry) {
            useAuthStore.getState().logoutLocal();
            return Promise.reject(error);
        }

        if (isRefreshing) {
            return new Promise<string>((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            })
                .then(newToken => {
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = 'Bearer ' + newToken;
                    }
                    return axiosInstance(originalRequest);
                })
                .catch(err => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const currentRefreshToken = useAuthStore.getState().refreshToken;

        if (!currentRefreshToken) {
            isRefreshing = false;
            useAuthStore.getState().logoutLocal();
            return Promise.reject(error);
        }

        try {
            const res = await refreshAxiosClient.post<{
                message: string;
                accessToken: string;
                refreshToken?: string;
            }>('/auth/refresh-token', {
                refreshToken: currentRefreshToken,
            });

            const newAccessToken = res.data?.accessToken;
            const newRefreshToken = res.data?.refreshToken;

            if (!newAccessToken) {
                throw new Error('No access token received from refresh-token endpoint');
            }

            useAuthStore.getState().saveUser({
                accessToken: newAccessToken,
                refreshToken: newRefreshToken || currentRefreshToken,
            });

            if (originalRequest.headers) {
                originalRequest.headers.Authorization = 'Bearer ' + newAccessToken;
            }

            processQueue(null, newAccessToken);
            return axiosInstance(originalRequest);
        } catch (refreshErr) {
            processQueue(refreshErr, null);
            useAuthStore.getState().logoutLocal();
            return Promise.reject(refreshErr);
        } finally {
            isRefreshing = false;
        }
    },
);

export default axiosInstance;
 