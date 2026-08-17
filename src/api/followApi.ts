import axiosInstance from "~/services/axiosClient";

export const followApi = {
    createFollow: (userId: string) => axiosInstance.post(`/follow/create`, { followingId: userId }),
    deleteFollow: (userId: string) => axiosInstance.delete(`/follow/delete`, { data: { followingId: userId } })
}