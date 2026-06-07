/**
 * Minimal auth helper for PRS-160 (cart & checkout).
 *
 * The full authentication flow (login / register screens + JWT) is a separate
 * ticket that isn't merged yet. Until then, this thin shim stores the
 * authenticated user and produces the credential the Ex3 server currently
 * expects on protected requests: the `X-User-Id` header.
 *
 * When the JWT auth ticket lands, replace this module with the shared auth
 * context and switch authHeaders() to an `Authorization: Bearer <jwt>` header.
 */
const USER_KEY = 'wolt_user';

export const getCurrentUser = () => {
    try {
        const raw = localStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

export const isAuthenticated = () => Boolean(getCurrentUser()?.id);

export const setCurrentUser = (user) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearCurrentUser = () => {
    localStorage.removeItem(USER_KEY);
};

/** Headers that authenticate a request against the Ex3 server. */
export const authHeaders = () => {
    const user = getCurrentUser();
    return user?.id ? { 'X-User-Id': user.id } : {};
};
