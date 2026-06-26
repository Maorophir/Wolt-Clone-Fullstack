import { Platform } from 'react-native';

/**
 * Shared corner-radius scale and a cross-platform elevation helper, so cards and
 * buttons across the app share one consistent, Wolt-like depth language instead
 * of ad-hoc shadow values. iOS uses shadow*, Android uses elevation.
 */
export const radii = { sm: 8, md: 12, lg: 16, xl: 20, pill: 999 };

const LEVELS = {
    1: { ios: { shadowOpacity: 0.06, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } }, elevation: 2 },
    2: { ios: { shadowOpacity: 0.10, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }, elevation: 4 },
    3: { ios: { shadowOpacity: 0.16, shadowRadius: 18, shadowOffset: { width: 0, height: 8 } }, elevation: 8 },
};

export const shadow = (level = 1) => {
    const l = LEVELS[level] || LEVELS[1];
    return Platform.OS === 'android'
        ? { elevation: l.elevation }
        : { shadowColor: '#000', ...l.ios };
};
