import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentPosition } from '../utils/geo';
import { getId } from '../utils/id';
import { useAuth } from './AuthContext';
import api from '../api/client';

/**
 * Delivery-location hub, shared app-wide (header pill + Home distance sorting +
 * checkout). Ports the web LocationContext: geolocation via expo-location,
 * Haversine in utils/geo, persistence in AsyncStorage, best-effort sync of the
 * address book to the logged-in user. Consumes AuthContext instead of the web's
 * `window` event bus to react to login/logout.
 */
const LocationContext = createContext(null);
const ADDR_KEY = 'wolt_addresses';
const ACTIVE_KEY = 'wolt_active_location';

const genId = () => `a_${Date.now()}_${Math.random().toString(36).slice(2)}`;

// Normalize a server address ({_id,name,latitude,longitude}) or a locally added
// one into the shape the UI uses.
const normalizeAddr = (a) => ({
    id: getId(a) || genId(),
    label: a.label || a.name || 'Address',
    address: a.address || a.name || '',
    latitude: Number(a.latitude),
    longitude: Number(a.longitude),
});

export const LocationProvider = ({ children }) => {
    const { user, isAuthenticated, updateUser } = useAuth();
    const [addresses, setAddresses] = useState([]);
    const [active, setActive] = useState(null); // { label, lat, lng } | null
    const [status, setStatus] = useState('idle');
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const [rawAddr, rawActive] = await Promise.all([
                    AsyncStorage.getItem(ADDR_KEY),
                    AsyncStorage.getItem(ACTIVE_KEY),
                ]);
                if (rawAddr) setAddresses(JSON.parse(rawAddr));
                if (rawActive) setActive(JSON.parse(rawActive));
            } catch {
                /* ignore */
            } finally {
                setHydrated(true);
            }
        })();
    }, []);

    // Re-seed the book when the signed-in user changes (login seeds their saved
    // addresses; logout clears them). Keyed on user id so local edits — which keep
    // the same id — don't retrigger this.
    useEffect(() => {
        if (!hydrated) return;
        if (user && Array.isArray(user.addresses)) {
            setAddresses(user.addresses.map(normalizeAddr));
        } else if (!user) {
            setAddresses([]);
            setActive(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, hydrated]);

    useEffect(() => {
        if (!hydrated) return;
        AsyncStorage.setItem(ADDR_KEY, JSON.stringify(addresses)).catch(() => {});
    }, [addresses, hydrated]);

    useEffect(() => {
        if (!hydrated) return;
        if (active) AsyncStorage.setItem(ACTIVE_KEY, JSON.stringify(active)).catch(() => {});
        else AsyncStorage.removeItem(ACTIVE_KEY).catch(() => {});
    }, [active, hydrated]);

    const coords = active ? { lat: Number(active.lat), lng: Number(active.lng) } : null;

    // Best-effort persist of the book to the logged-in user (server addressSchema
    // is { name, latitude, longitude }). Local UI shape is kept on the user too.
    const persistToServer = (list) => {
        if (!isAuthenticated || !user?.id) return;
        updateUser({ addresses: list });
        api(`/users/${user.id}`, {
            method: 'PATCH',
            body: {
                addresses: list.map((a) => ({
                    name: a.address || a.label,
                    latitude: a.latitude,
                    longitude: a.longitude,
                })),
            },
        }).catch(() => { /* offline / token issue — local book still works */ });
    };

    const selectAddress = (addr) => {
        setActive({
            label: addr.label || 'Address',
            lat: Number(addr.latitude),
            lng: Number(addr.longitude),
        });
    };

    const addAddress = (addr) => {
        const entry = normalizeAddr({ ...addr, id: addr.id || genId() });
        const next = [...addresses, entry];
        setAddresses(next);
        persistToServer(next);
        return entry;
    };

    const updateAddress = (id, patch) => {
        const next = addresses.map((a) => (a.id === id ? normalizeAddr({ ...a, ...patch }) : a));
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

    const clearActive = () => setActive(null);

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
        clearActive,
    };

    return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};

export const useUserLocation = () => {
    const ctx = useContext(LocationContext);
    if (!ctx) throw new Error('useUserLocation must be used within a LocationProvider');
    return ctx;
};
