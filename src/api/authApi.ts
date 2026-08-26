import { ILoginPayLoad, IResponseLogin, ISignUpPayload, IResponseSignUp } from "~/interfaces";
import axiosInstance from "~/services/axiosClient";

export const authApi = {
    login: (credentials: ILoginPayLoad) =>
        axiosInstance.post<IResponseLogin>('/auth/login', credentials),
    
    signUp: (payload: ISignUpPayload) => {
        const body = {
            username: payload.username,
            email: payload.email,
            password: payload.password,
            name: payload.name || payload.fullname || payload.username,
            avatarUrl: payload.avatarUrl,
        };
        return axiosInstance.post<IResponseSignUp>('/auth/register', body);
    },
    
    refreshToken: (refreshToken: string) => 
        axiosInstance.post<{ message: string; accessToken: string }>('/auth/refresh-token', { refreshToken }),
    
    getMe: () => 
        axiosInstance.get<{ user: IResponseLogin['user'] }>('/auth/me'),
};