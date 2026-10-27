import { createMMKV } from 'react-native-mmkv';
import { StateStorage, persist, createJSONStorage } from 'zustand/middleware';
import { create } from 'zustand';
import { IProfileUser } from '~/interfaces';

export const storage = createMMKV({
  id: 'auth-storage-secure',
  encryptionKey: 'ThirdAppSecureKey2026!',
});

export const zustandStorage: StateStorage = {
  setItem: (name, value) => {
    storage.set(name, value);
  },
  getItem: name => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: name => {
    storage.remove(name);
  },
};

export type AuthStorage = {
  user: IProfileUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  saveUser: (payload: {
    user?: IProfileUser | null;
    accessToken: string | null;
    refreshToken?: string | null;
  }) => void;
  updateUser: (user: IProfileUser | null) => void;
  logoutLocal: () => void;
};

export const useAuthStore = create<AuthStorage>()(
  persist(
    set => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      saveUser: ({ user, accessToken, refreshToken }) => {
        set(state => ({
          user: user !== undefined ? user : state.user,
          accessToken:
            accessToken !== undefined ? accessToken : state.accessToken,
          refreshToken:
            refreshToken !== undefined ? refreshToken : state.refreshToken,
        }));
      },

      updateUser: user => {
        set({ user });
      },

      logoutLocal: () => {
        set({ user: null, accessToken: null, refreshToken: null });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
