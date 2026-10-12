import axiosInstance from '~/services/axiosClient';
import { IView, ViewPayload, IResponseGetViews } from '~/interfaces';

export type { ViewPayload };

export const viewApi = {
  createView: (payload: ViewPayload) =>
    axiosInstance.post<{ message: string; view?: IView }>('/views', payload),

  getViewsByTarget: (targetId: string, targetType: 'Reel' | 'Story') =>
    axiosInstance.get<IResponseGetViews>(
      `/views/target?targetId=${targetId}&targetType=${targetType}`,
    ),
};
