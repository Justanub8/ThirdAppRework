import { createMMKV } from 'react-native-mmkv';
import { StateStorage } from 'zustand/middleware';

// Secure encrypted MMKV storage instance with AES encryption
export const storage = createMMKV({
    id: 'auth-storage-secure',
    encryptionKey: 'ThirdAppSecureKey2026!',
});

export const zustandStorage: StateStorage = {
    setItem: (name, value) => {
        storage.set(name, value);
    },
    getItem: (name) => {
        const value = storage.getString(name);
        return value ?? null;
    },
    removeItem: (name) => {
        storage.remove(name);
    },
};