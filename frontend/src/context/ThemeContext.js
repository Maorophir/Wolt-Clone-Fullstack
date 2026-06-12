// src/context/ThemeContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);
const STORAGE_KEY = 'wolt_theme_is_dark';

/**
 * Safely reads the theme preference from localStorage.
 * Handles cases where localStorage might be blocked (e.g., private browsing).
 */
const readStoredTheme = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored === 'true'; // Convert string back to boolean
    } catch {
        return false; // Default to light mode (false) if storage is unavailable
    }
};

export const ThemeProvider = ({ children }) => {
    // Initialize state from local storage (persistence)
    const [isDarkMode, setIsDarkMode] = useState(readStoredTheme);

    const toggleTheme = () => {
        setIsDarkMode((prevMode) => !prevMode);
    };

    // Sync with DOM and localStorage whenever the theme changes
    useEffect(() => {
        // 1. Update the DOM class for our CSS variables (main branch logic)
        if (isDarkMode) {
            document.body.classList.add('app-dark');
        } else {
            document.body.classList.remove('app-dark');
        }

        // 2. Persist the choice safely (logic)
        try {
            localStorage.setItem(STORAGE_KEY, String(isDarkMode));
        } catch {
            /* storage unavailable — keep the in-memory theme */
        }
    }, [isDarkMode]);

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

/**
 * Custom hook with safety checks
 */
export const useTheme = () => {
    const ctx = useContext(ThemeContext);
    if (!ctx) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return ctx;
};