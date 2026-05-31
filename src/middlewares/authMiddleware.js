const userModel = require('../models/userModel');

/**
 * Authentication middleware (PRS-106).
 *
 * Protected routes (e.g. Orders) require a logged-in user. The client sends the
 * authenticated user's id in the `X-User-Id` HTTP header (obtained from the
 * login response, POST /api/tokens). This middleware extracts that id, verifies
 * the user exists, and exposes it to downstream handlers as `req.userId`.
 *
 * Kept as a standalone, single-responsibility unit so any route can opt into
 * authentication without duplicating the check (loose coupling / DRY).
 */
const AUTH_HEADER = 'X-User-Id';

const authenticate = (req, res, next) => {
    const userId = req.header(AUTH_HEADER);

    if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    if (!userModel.getUserById(userId)) {
        return res.status(401).json({ error: 'Invalid or unknown user' });
    }

    req.userId = userId;
    next();
};

module.exports = authenticate;
