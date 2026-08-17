import { useAuthStore } from "./useAuthStore";
import { useMutation } from  "@tanstack/react-query"
import { Alert } from "react-native";
import { authApi } from "~/api";
import { AxiosResponse } from "axios";
import { IResponseLogin } from "~/interfaces";

export const useLogin = () => {
    return useMutation({
        mutationFn: authApi.login,
        onSuccess(response: AxiosResponse<IResponseLogin>){
            useAuthStore.getState().saveUser({
                accessToken: response.data.accessToken,
                refreshToken: response.data.refreshToken,
                user: response.data.user || null
            })
        },
        onError(error: any){
            Alert.alert(error.toString())
        }
    })
}