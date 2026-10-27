import { authApi } from '~/api/authApi';
import { useAuthStore } from '~/store/auth.store';
import { queryClient } from './queryClient';

export const logoutUser = async () => {
  try {
    await authApi.logout();
  } catch (error) {
    console.error('Lỗi khi gọi API logout:', error);
  } finally {
    useAuthStore.getState().logoutLocal();
    queryClient.clear();
  }
};
