import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentPosition } from '../utils/geo';
import { getCurrentUser, isAuthenticated, authHeaders } from '../utils/auth';

/**
 * Delivery-location hub, shared app-wide (navbar pill + home distance sorting).
 *
 * Holds the user's saved addresses and the active delivery location. The book
 * is seeded from the address the user set at registration (returned on login),
 * kept in localStorage for the session, and best-effort synced back to the
 * server (PATCH /api/users) now that auth uses a real JWT. Geolocation +
 * Haversine only — no external libraries.
 *
 * Named useUserLocation to avoid clashing with react-router-dom's useLocation.
 */
const LocationContext = createContext(null);

const ADDR_KEY = 'wolt_addresses';
const ACTIVE_KEY = 'wolt_active_location';

const load = (key, fallback) => {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
};

const genId = () =>
    (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : `a_${Date.now()}_${Math.random().toString(36).slice(2)}`;

// Best-effort persist of the address book to the logged-in user (real JWT auth).
const persistToServer = (list) => {
    const user = getCurrentUser();
    if (!user || !user.id) return;
    // Keep the cached user in sync so reloads / re-seeds reflect the latest book.
    try {
        localStorage.setItem('wolt_user', JSON.stringify({ ...user, addresses: list }));
    } catch { /* ignore */ }
    if (!isAuthenticated()) return;
    fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ addresses: list }),
    }).catch(() => { /* offline / token issue — local book still works */ });
};

export const LocationProvider = ({ children }) => {
    const [addresses, setAddresses] = useState(() => {
        const user = getCurrentUser();
        if (user && Array.isArray(user.addresses)) return user.addresses;
        return load(ADDR_KEY, []);
    });
    const [active, setActive] = useState(() => load(ACTIVE_KEY, null)); // { label, lat, lng } | null
    const [status, setStatus] = useState('idle');

    useEffect(() => {
        localStorage.setItem(ADDR_KEY, JSON.stringify(addresses));
    }, [addresses]);

    useEffect(() => {
        if (active) localStorage.setItem(ACTIVE_KEY, JSON.stringify(active));
        else localStorage.removeItem(ACTIVE_KEY);
    }, [active]);

    // Re-seed the book whenever the signed-in user changes (login shows the
    // address they registered with; logout clears it).
    useEffect(() => {
        const onUserChanged = () => {
            const user = getCurrentUser();
            if (user && Array.isArray(user.addresses)) {
                setAddresses(user.addresses);
            } else if (!user) {
                setAddresses([]);
                setActive(null);
            }
        };
        window.addEventListener('user_updated', onUserChanged);
        return () => window.removeEventListener('user_updated', onUserChanged);
    }, []);

    const coords = active ? { lat: Number(active.lat), lng: Number(active.lng) } : null;

    const selectAddress = (addr) => {
        setActive({ label: addr.label || 'Address', lat: Number(addr.latitude), lng: Number(addr.longitude) });
    };

    const addAddress = (addr) => {
        const entry = {
            id: addr.id || genId(),
            label: addr.label || 'Other',
            address: addr.address || '',
            latitude: Number(addr.latitude),
            longitude: Number(addr.longitude),
        };
        const next = [...addresses, entry];
        setAddresses(next);
        persistToServer(next);
        return entry;
    };

    const updateAddress = (id, patch) => {
        const next = addresses.map((a) =>
            a.id === id
                ? {
                    ...a,
                    ...patch,
                    latitude: Number(patch.latitude ?? a.latitude),
                    longitude: Number(patch.longitude ?? a.longitude),
                }
                : a);
        setAddresses(next);
        persistToServer(next);
    };

    const removeAddress = (id) => {
        const next = addresses.filter((a) => a.id !== id);
        setAddresses(next);
        persistToServer(next);
    };

    const useCurrentLocation = async () => {
        setStatus('loading');
        try {
            const c = await getCurrentPosition();
            setActive({ label: 'Current location', lat: c.lat, lng: c.lng });
            setStatus('granted');
            return c;
        } catch (err) {
            setStatus(err && err.code === 1 ? 'denied' : 'unavailable');
            return null;
        }
    };

    const value = {
        addresses,
        active,
        coords,
        status,
        selectAddress,
        addAddress,
        updateAddress,
        removeAddress,
        useCurrentLocation,
    };

    return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};

export const useUserLocation = () => {
    const ctx = useContext(LocationContext);
    if (!ctx) {
        throw new Error('useUserLocation must be used within a LocationProvider');
    }
    return ctx;
};
