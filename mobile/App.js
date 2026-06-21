import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { LocationProvider } from './src/context/LocationContext';
import RootNavigator from './src/navigation/RootNavigator';

/**
 * Bridges our ThemeContext into React Navigation so the nav chrome (headers,
 * tab bar, screen backgrounds) matches the in-app palette in light/dark.
 */
function NavRoot() {
    const { isDarkMode, colors } = useTheme();
    const base = isDarkMode ? DarkTheme : DefaultTheme;
    const navTheme = {
        ...base,
        colors: {
            ...base.colors,
            background: colors.bg,
            card: colors.navbarBg,
            text: colors.text,
            border: colors.border,
            primary: colors.brand,
            notification: colors.brand,
        },
    };
    return (
        <NavigationContainer theme={navTheme}>
            <StatusBar style={isDarkMode ? 'light' : 'dark'} />
            <RootNavigator />
        </NavigationContainer>
    );
}

/**
 * Provider nesting mirrors the web app's App.js:
 * Theme → Auth → Cart → Location → Navigation. Location consumes Auth, so it
 * sits inside AuthProvider.
 */
export default function App() {
    return (
        <SafeAreaProvider>
            <ThemeProvider>
                <AuthProvider>
                    <CartProvider>
                        <LocationProvider>
                            <NavRoot />
                        </LocationProvider>
                    </CartProvider>
                </AuthProvider>
            </ThemeProvider>
        </SafeAreaProvider>
    );
}
