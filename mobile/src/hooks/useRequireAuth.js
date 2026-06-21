import { useCallback } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

/**
 * Guards a screen that requires login — the RN equivalent of the web
 * <ProtectedRoute>. When auth state is resolved and the user is not
 * authenticated, it redirects to Login (on focus, so it also fires if the user
 * logs out while the screen is open). Returns { isAuthenticated, loading } so the
 * screen can render a placeholder instead of protected content.
 */
export const useRequireAuth = () => {
    const { isAuthenticated, loading } = useAuth();
    const navigation = useNavigation();

    useFocusEffect(
        useCallback(() => {
            if (!loading && !isAuthenticated) {
                navigation.navigate('Login');
            }
        }, [loading, isAuthenticated, navigation])
    );

    return { isAuthenticated, loading };
};
