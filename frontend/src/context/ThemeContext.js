// src/context/ThemeContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the context
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    const toggleTheme = () => {
        setIsDarkMode((prevMode) => !prevMode);
    };

    // Automatically update the body tag whenever the theme state changes
    useEffect(() => {
        if (isDarkMode) {
            document.body.classList.add('app-dark');
        } else {
            document.body.classList.remove('app-dark');
        }
    }, [isDarkMode]);

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            {/* The wrapper div is no longer needed since the body tag handles the theme class */}
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);