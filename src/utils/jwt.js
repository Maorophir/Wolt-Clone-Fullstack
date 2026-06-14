/**
 * Minimal JWT implementation using Node's built-in crypto module.
 *
 * Algorithm: HS256 (HMAC-SHA256) — the most widely used symmetric JWT algorithm.
 * This is spec-compliant with RFC 7519 and requires no external dependencies.
 *
 * Security note: This is an exercise implementation. The secret is an in-memory
 * constant which is intentionally volatile (resets on restart, matching the
 * in-memory data store). Do not store real credentials in this system.
 */
'use strict';

const crypto = require('node:crypto');

// Secret key used to sign and verify every token.
// Kept in memory — consistent with the exercise's volatile in-memory data store.
const SECRET = 'wolt_clone_jwt_secret_ex4';

// How long (in seconds) a token remains valid after being issued.
const EXPIRY_SECONDS = 60 * 60 * 24; // 24 hours

// Fixed JWT header for HS256 — same for every token we issue.
const HEADER_B64 = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Converts a string to a Base64URL-encoded string (no padding, URL-safe chars).
 * Base64URL replaces '+' with '-', '/' with '_', and strips trailing '='.
 */
function base64UrlEncode(str) {
    return Buffer.from(str, 'utf8')
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

/**
 * Decodes a Base64URL string back to a UTF-8 string.
 * Adds back the stripped '=' padding before decoding.
 */
function base64UrlDecode(b64url) {
    // Restore padding: Base64 strings must have length divisible by 4
    const padded = b64url + '==='.slice((b64url.length % 4) || 4);
    return Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
}

/**
 * Computes the HMAC-SHA256 signature of a string using the shared secret.
 * Returns a Base64URL-encoded signature string.
 */
function sign(data) {
    return crypto
        .createHmac('sha256', SECRET)
        .update(data)
        .digest('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Creates a signed JWT token string containing the given payload.
 *
 * Automatically adds standard claims:
 *   iat  — issued at (Unix timestamp)
 *   exp  — expiry   (Unix timestamp, iat + EXPIRY_SECONDS)
 *
 * @param {object} payload  Application data to embed (e.g. { userId })
 * @returns {string}        A signed JWT: "header.payload.signature"
 */
const createToken = (payload) => {
    const now = Math.floor(Date.now() / 1000);
    const claims = { ...payload, iat: now, exp: now + EXPIRY_SECONDS };
    const payloadB64 = base64UrlEncode(JSON.stringify(claims));
    const signature = sign(`${HEADER_B64}.${payloadB64}`);
    return `${HEADER_B64}.${payloadB64}.${signature}`;
};

/**
 * Verifies a JWT token and returns its decoded payload.
 *
 * Checks performed:
 *   1. Token has exactly three dot-separated segments.
 *   2. HMAC-SHA256 signature matches (constant-time comparison to prevent
 *      timing attacks).
 *   3. Token has not expired (`exp` claim).
 *
 * @param {string} token  The JWT string to verify.
 * @returns {object}      The decoded payload if the token is valid.
 * @throws {Error}        If the token is malformed, has a bad signature, or
 *                        has expired.
 */
const verifyToken = (token) => {
    if (!token || typeof token !== 'string') {
        throw new Error('Token is missing or not a string');
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
        throw new Error('Malformed token: expected three dot-separated segments');
    }

    const [headerB64, payloadB64, receivedSig] = parts;

    // Re-compute the expected signature and compare using constant-time equals
    // to prevent timing side-channel attacks.
    const expectedSig = sign(`${headerB64}.${payloadB64}`);
    const sigA = Buffer.from(receivedSig, 'utf8');
    const sigB = Buffer.from(expectedSig, 'utf8');

    if (sigA.length !== sigB.length || !crypto.timingSafeEqual(sigA, sigB)) {
        throw new Error('Invalid token signature');
    }

    // Decode and parse the payload
    let payload;
    try {
        payload = JSON.parse(base64UrlDecode(payloadB64));
    } catch {
        throw new Error('Malformed token: payload is not valid JSON');
    }

    // Check expiry
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
        throw new Error('Token has expired');
    }

    return payload;
};

module.exports = { createToken, verifyToken };
