const { verifyToken } = require('../utils/jwt');
const userModel = require('../models/userModel');

/**
 * Authentication middleware.
 * Expects Authorization: Bearer <token>
 */
const authenticate = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = verifyToken(token);
        if (!userModel.getUserById(decoded.userId)) {
            return res.status(401).json({ error: 'Invalid or unknown user' });
        }
        req.userId = decoded.userId;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

module.exports = authenticate;
