import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '~/store/auth.store';

export type AuthStorage = {
    user: any | null;
    accessToken: string | null;
    refreshToken: string | null;
    saveUser: (payload: { 
        user?: any | null; 
        accessToken: string | null; 
        refreshToken?: string | null;
    }) => void;
    updateUser: (user: any | null) => void;
    logoutLocal: () => void;
}

export const useAuthStore = create<AuthStorage>()(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            saveUser: ({ user, accessToken, refreshToken }) => {
                set((state) => ({
                    user: user !== undefined ? user : state.user,
                    accessToken: accessToken !== undefined ? accessToken : state.accessToken,
                    refreshToken: refreshToken !== undefined ? refreshToken : state.refreshToken,
                }));
            },
            
            updateUser: (user) => {
                set({ user });
            },
            
            logoutLocal: () => {
                set({ user: null, accessToken: null, refreshToken: null });
            },
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => zustandStorage),
        }
    )
);