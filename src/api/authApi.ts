import { ILoginPayLoad, IResponseLogin, ISignUpPayload, IResponseSignUp } from "~/interfaces";
import axiosInstance from "~/services/axiosClient";

export const authApi = {
    login: (credentials: ILoginPayLoad) => axiosInstance.post<IResponseLogin>('api/users/login', credentials),
    signUp: (payload: ISignUpPayload) => axiosInstance.post<IResponseSignUp>('api/users/register', payload),
}