import { IProfileUser, IUpdateProfilePayload } from '~/interfaces';
import axiosInstance from '~/services/axiosClient';

export interface GetAllUsersResponse {
  users: IProfileUser[];
  data?: IProfileUser[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const userApi = {
  getUser: (id: string) =>
    axiosInstance.get<{ user: IProfileUser }>(`/users/profile/${id}`),

  getMyProfile: () =>
    axiosInstance.get<{ user: IProfileUser }>(`/users/profile`),

  getAllUsers: (page: number = 1, limit: number = 20) =>
    axiosInstance.get<GetAllUsersResponse>(
      `/users?page=${page}&limit=${limit}`,
    ),

  updateProfile: (payload: IUpdateProfilePayload) =>
    axiosInstance.put<{ message: string; user: IProfileUser }>(
      '/users/profile',
      payload,
    ),

  getFollowedUser: (page: number = 1, limit: number = 20) =>
    axiosInstance.get<GetAllUsersResponse>(
      `/users/followed-users?page=${page}&limit=${limit}`,
    ),
};
