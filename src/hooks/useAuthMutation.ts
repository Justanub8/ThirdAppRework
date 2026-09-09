import { useMutation } from "@tanstack/react-query";
import { Alert } from "react-native";
import { authApi } from "~/api";
import { ILoginPayLoad, ISignUpPayload } from "~/interfaces";
import { useAuthStore } from "./useAuthStore";

export const useAuthMutation = () => {
    const { saveUser } = useAuthStore();

    const signUp = useMutation({
        mutationFn: (payload: ISignUpPayload) => {
            if (!payload.email || !payload.password || !payload.username) {
                throw new Error("Vui lòng điền đầy đủ thông tin");
            }
            return authApi.signUp(payload);
        },
        onSuccess: (res) => {
            const data = res.data;
            if (data && data.accessToken) {
                saveUser({
                    accessToken: data.accessToken,
                    refreshToken: data.refreshToken || null,
                    user: data.user || null,
                });
            }
        },
        onError: (error: any) => {
            const msg = error?.response?.data?.message || error?.message || "Đăng ký không thành công";
            Alert.alert("Lỗi đăng ký", msg);
        },
    });

    const login = useMutation({
        mutationFn: (payload: ILoginPayLoad) => {
            if (!payload.email || !payload.password) {
                throw new Error("Vui lòng điền email và mật khẩu");
            }
            return authApi.login(payload);
        },
        onSuccess: (res) => {
            const data = res.data;
            if (data && data.accessToken) {
                saveUser({
                    accessToken: data.accessToken,
                    refreshToken: data.refreshToken || null,
                    user: data.user || null,
                });
            }
        },
        onError: (error: any) => {
            const msg = error?.response?.data?.message || error?.message || "Đăng nhập không thành công";
            Alert.alert("Lỗi đăng nhập", msg);
        },
    });

    return { signUp, login };
};
