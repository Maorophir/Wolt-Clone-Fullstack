// Geolocation helpers — browser Web APIs + plain math only, NO external libraries.

/**
 * Resolve the user's current position as { lat, lng }.
 * Rejects with the native GeolocationPositionError, or Error('UNSUPPORTED')
 * when the browser has no Geolocation API. Only works on https or localhost.
 */
export const getCurrentPosition = (
    options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
) =>
    new Promise((resolve, reject) => {
        if (!('geolocation' in navigator)) {
            reject(new Error('UNSUPPORTED'));
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            (err) => reject(err),
            options
        );
    });

/**
 * Great-circle distance in kilometres between two { lat, lng } points
 * (Haversine formula, Earth radius 6371 km).
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
