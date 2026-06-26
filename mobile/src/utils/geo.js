// Geolocation helpers — expo-location + plain math only, NO web APIs.
// Ported from the web app's utils/geo.js (navigator.geolocation -> expo-location).
import * as Location from 'expo-location';

/**
 * Resolve the user's current position as { lat, lng } using expo-location.
 * Rejects with an Error whose `code === 1` when permission is denied (matching
 * the web GeolocationPositionError.PERMISSION_DENIED contract the callers use).
 */
export const getCurrentPosition = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
        const err = new Error('PERMISSION_DENIED');
        err.code = 1;
        throw err;
    }
    const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
    });
    return { lat: pos.coords.latitude, lng: pos.coords.longitude };
};

/**
 * Great-circle distance in kilometres between two { lat, lng } points
 * (Haversine formula, Earth radius 6371 km). Identical to the web app.
 */
export const haversineKm = (a, b) => {
    const R = 6371;
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const h =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
};

/** Human-friendly distance label, e.g. "350 m" or "2.4 km". */
export const formatDistance = (km) =>
    km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
