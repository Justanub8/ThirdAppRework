import { IProfileUser } from "~/interfaces"
import axiosInstance from "~/services/axiosClient"
export const userApi = {
    getUser: (id: string) => 
        axiosInstance.get<{user: IProfileUser}>(`/api/users/profile/${id}`),
    getMyProfile: () =>
        axiosInstance.get<{user: IProfileUser}>(`/api/users/profile`),
    getAllUsers: (limit: number = 20) =>
        axiosInstance.get<{users: IProfileUser[]}>(`/api/users/all?limit=${limit}`)
}