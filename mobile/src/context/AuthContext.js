import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/client';
import { getId } from '../utils/id';

/**
 * Authentication state, shared app-wide. Replaces the web app's auth.js module
 * + `window.dispatchEvent('user_updated')` event bus with a proper React
 * context. The JWT lives in SecureStore under 'userToken' — the SAME key the
 * api client (src/api/client.js) reads — so authenticated requests "just work".
 * The user profile is cached in AsyncStorage so a returning user stays logged in.
 */
const AuthContext = createContext(null);
const TOKEN_KEY = 'userToken'; // must match src/api/client.js
const USER_KEY = 'wolt_user';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const [t, rawUser] = await Promise.all([
                    SecureStore.getItemAsync(TOKEN_KEY),
                    AsyncStorage.getItem(USER_KEY),
                ]);
                if (t) setToken(t);
                if (rawUser) setUser(JSON.parse(rawUser));
            } catch {
                /* ignore — treated as logged out */
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const persistUser = async (u) => {
        setUser(u);
        try {
            if (u) await AsyncStorage.setItem(USER_KEY, JSON.stringify(u));
            else await AsyncStorage.removeItem(USER_KEY);
        } catch {
            /* ignore */
        }
    };

    // POST /tokens returns { user, token }. The returned user is the full public
    // profile (incl. addresses), so we use it directly — no extra round-trip.
    const login = async (username, password) => {
        const { data } = await api('/tokens', {
            method: 'POST',
            body: { username, password },
        });
        const newToken = data.token;
        await SecureStore.setItemAsync(TOKEN_KEY, newToken);
        setToken(newToken);
        const profile = data.user || {};
        const fullUser = { ...profile, id: getId(profile) };
        await persistUser(fullUser);
        return fullUser;
    };

    const logout = async () => {
        try {
            await SecureStore.deleteItemAsync(TOKEN_KEY);
        } catch {
            /* ignore */
        }
        setToken(null);
        await persistUser(null);
    };

    const refreshUser = async () => {
        if (!user?.id) return user;
        try {
            const { data } = await api(`/users/${user.id}`);
            const merged = { ...user, ...data, id: getId(data) || user.id };
            await persistUser(merged);
            return merged;
        } catch {
            return user;
        }
    };

    // Merge a local patch into the cached user (profile edits / address sync).
    const updateUser = async (patch) => {
        const next = user ? { ...user, ...patch } : patch;
        await persistUser(next);
        return next;
    };

    const value = {
        user,
        token,
        loading,
        isAuthenticated: Boolean(user && getId(user) && token),
        login,
        logout,
        refreshUser,
        updateUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
};
