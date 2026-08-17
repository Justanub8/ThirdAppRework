import { IReel } from "~/interfaces/reel"
import axiosInstance from "~/services/axiosClient"

export const reelApi = {
    getAllReels: (page: number = 1, limit: number = 10) => 
        axiosInstance.get<{reels: IReel[], hasNextPage: boolean, currentPage: number}>(`/reels/all?page=${page}&limit=${limit}`),
}
