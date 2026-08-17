import { ILoginPayLoad, IResponseLogin } from "~/interfaces";
import axiosInstance from "~/services/axiosClient";


export const authApi = {
    login: (credentials: ILoginPayLoad) => axiosInstance.post<IResponseLogin>('api/users/login', credentials),
    
}