/**
 * Decode the payload of a JWT (header.payload.signature) WITHOUT any library.
 *
 * The login flow returns only a token; we read `userId` from its payload to
 * fetch the full user (mirrors the web app's useLogin). React Native's Hermes
 * engine provides a global `atob`, but we ship a tiny base64 decoder fallback
 * so this works regardless of the runtime.
 */
const B64_CHARS =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

const base64Decode = (input) => {
    const str = String(input).replace(/=+$/, '');
    let output = '';
    let bc = 0;
    let bs = 0;
    for (let i = 0; i < str.length; i += 1) {
        const idx = B64_CHARS.indexOf(str.charAt(i));
        if (idx === -1) continue;
        bs = bc % 4 ? bs * 64 + idx : idx;
        if (bc % 4) {
            output += String.fromCharCode(255 & (bs >> ((-2 * (bc + 1)) & 6)));
        }
        bc += 1;
    }
    return output;
};

export const decodeJwtPayload = (token) => {
    try {
        const part = token.split('.')[1];
        if (!part) return null;
        const normalized = part.replace(/-/g, '+').replace(/_/g, '/');
        const json =
            typeof atob === 'function' ? atob(normalized) : base64Decode(normalized);
        return JSON.parse(json);
    } catch {
        return null;
    }
};
