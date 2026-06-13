/**
 * Auth helper for JWT logic.
 */
const USER_KEY = 'wolt_user';
const TOKEN_KEY = 'wolt_jwt';

export const getCurrentUser = () => {
    try {
        const raw = localStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

export const isAuthenticated = () => Boolean(getCurrentUser()?.id) && Boolean(localStorage.getItem(TOKEN_KEY));

export const setCurrentUser = (user, token) => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    if (token) localStorage.setItem(TOKEN_KEY, token);
    
    // Dispatch event so Navbar updates instantly
    window.dispatchEvent(new Event('user_updated'));
};

export const clearCurrentUser = () => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    window.dispatchEvent(new Event('user_updated'));
};

/** Headers that authenticate a request against the server using JWT. */
export const authHeaders = () => {
    const token = localStorage.getItem(TOKEN_KEY);
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};
