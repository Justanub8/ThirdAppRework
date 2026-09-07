import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import { createMMKV } from 'react-native-mmkv';
import { COLORS } from '~/constants';

export type ThemeMode = 'light' | 'dark' | 'system';
export type Theme = typeof COLORS.light & typeof COLORS.common;

const defaultTheme: Theme = { ...COLORS.common, ...COLORS.light };

const storage = createMMKV({ id: 'app-theme' });
const THEME_MODE_KEY = 'theme_mode';

const ThemeContext = createContext<{
  theme: Theme;
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
}>({
  theme: defaultTheme,
  mode: 'system',
  setMode: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const saved = storage.getString(THEME_MODE_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved;
    }
    return 'system';
  });

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    storage.set(THEME_MODE_KEY, newMode);
  }, []);

  const resolvedScheme = mode === 'system' ? (systemScheme ?? 'light') : mode;
  const activeSchemeColors = resolvedScheme === 'dark' ? COLORS.dark : COLORS.light;
  const theme = useMemo<Theme>(() => ({
    ...COLORS.common,
    ...activeSchemeColors,
  }), [activeSchemeColors]);

  return (
    <ThemeContext.Provider value={{ theme, mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}