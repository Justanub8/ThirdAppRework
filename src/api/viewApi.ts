import axiosInstance from "~/services/axiosClient";

export interface ViewPayload {
    targetId: string;
    targetType: 'Reel' | 'Story';
}

export const viewApi = {
    createView: (payload: ViewPayload) =>
        axiosInstance.post<{ message: string; view?: any }>('/view/create', payload),

    getViewsByTarget: (targetId: string, targetType: 'Reel' | 'Story') =>
        axiosInstance.get<{ total: number; data: any[] }>(`/view/target?targetId=${targetId}&targetType=${targetType}`),
};
