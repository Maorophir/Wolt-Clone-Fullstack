import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { light, dark } from './colors';

/**
 * Dark/light theme, shared app-wide. Ports the web ThemeContext, but instead of
 * toggling a `document.body` class it simply exposes the active color palette
 * (theme/colors.js) so every StyleSheet can theme itself. Persisted to
 * AsyncStorage (async), so we hydrate on mount and only persist once hydrated
 * to avoid clobbering the stored value with the default.
 */
const ThemeContext = createContext(null);
const STORAGE_KEY = 'wolt_theme_is_dark';

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const stored = await AsyncStorage.getItem(STORAGE_KEY);
                if (stored != null) setIsDarkMode(stored === 'true');
            } catch {
                /* storage unavailable — keep light mode */
            } finally {
                setHydrated(true);
            }
        })();
    }, []);

    useEffect(() => {
        if (!hydrated) return;
        AsyncStorage.setItem(STORAGE_KEY, String(isDarkMode)).catch(() => {});
    }, [isDarkMode, hydrated]);

    const toggleTheme = () => setIsDarkMode((prev) => !prev);
    const colors = isDarkMode ? dark : light;

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme, colors }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
    return ctx;
};

/** Convenience hook for components that only need the active palette. */
export const useThemeColors = () => useTheme().colors;
