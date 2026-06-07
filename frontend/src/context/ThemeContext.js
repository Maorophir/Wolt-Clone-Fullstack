import React, { createContext, useContext, useEffect, useState } from 'react';

/**
 * PRS-158 — App-wide light/dark theme.
 *
 * Sets a `data-theme` attribute on the document root; every page's CSS reacts to
 * `[data-theme="dark"]`, so toggling here re-themes the whole app (home, menu,
 * cart, orders) consistently. The choice is persisted to localStorage.
 *
 * localStorage access is guarded so the app still mounts where storage is
 * unavailable (e.g. private mode), matching the defensive pattern used by the
 * cart and auth modules.
 */
const ThemeContext = createContext(null);
const STORAGE_KEY = 'wolt_theme';

const readStoredTheme = () => {
    try {
        return localStorage.getItem(STORAGE_KEY) || 'light';
    } catch {
        return 'light';
    }
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(readStoredTheme);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        try {
            localStorage.setItem(STORAGE_KEY, theme);
        } catch {
            /* storage unavailable — keep the in-memory theme */
        }
    }, [theme]);

    const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const ctx = useContext(ThemeContext);
    if (!ctx) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return ctx;
};
