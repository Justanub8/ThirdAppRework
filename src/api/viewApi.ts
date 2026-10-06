import axiosInstance from "~/services/axiosClient";
import { IView, ViewPayload, IResponseGetViews } from "~/interfaces";

export type { ViewPayload };

export const viewApi = {
    createView: (payload: ViewPayload) =>
        axiosInstance.post<{ message: string; view?: IView }>('/view/create', payload),

    getViewsByTarget: (targetId: string, targetType: 'Reel' | 'Story') =>
        axiosInstance.get<IResponseGetViews>(`/view/target?targetId=${targetId}&targetType=${targetType}`),
};
