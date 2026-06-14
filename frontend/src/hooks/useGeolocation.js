import { useCallback, useState } from 'react';
import { getCurrentPosition } from '../utils/geo';

/**
 * On-demand geolocation. It never prompts on mount — call request() from a user
 * action (e.g. clicking a "Near me" chip), which is better UX and avoids a
 * surprise permission prompt.
 *
 * status : 'idle' | 'loading' | 'granted' | 'denied' | 'unavailable'
 * coords : { lat, lng } | null
 * request(): resolves to the coords on success or null on failure, so the first
 *            click can act on the result without waiting for React state.
 */
export const useGeolocation = () => {
    const [status, setStatus] = useState('idle');
    const [coords, setCoords] = useState(null);
    const [error, setError] = useState('');

    const request = useCallback(async () => {
        setStatus('loading');
        setError('');
        try {
            const c = await getCurrentPosition();
            setCoords(c);
            setStatus('granted');
            return c;
        } catch (err) {
            // GeolocationPositionError codes: 1 = denied, 2 = unavailable, 3 = timeout.
            if (err && err.code === 1) {
                setStatus('denied');
                setError('Location access was blocked.');
            } else {
                setStatus('unavailable');
                setError('Could not determine your location.');
            }
            return null;
        }
    }, []);

    return { status, coords, error, request };
};
