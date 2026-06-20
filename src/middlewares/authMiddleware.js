const { verifyToken } = require('../utils/jwt');
const User = require('../models/userModel');
const Restaurant = require('../models/restaurantModel');

/**
 * Authentication middleware.
 * Expects Authorization: Bearer <token>
 */
const authenticate = async (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = verifyToken(token);
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ error: 'Invalid or unknown user' });
        }
        req.userId = decoded.userId;
        req.isAdmin = user.isAdmin === true;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

/**
 * Authorization middleware.
 * Must be used after authenticate middleware.
 */
const authorizeBusiness = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        if (!user || (!user.isBusinessOwner && !user.isAdmin)) {
            return res.status(403).json({ error: 'Access denied: Business Owner only' });
        }
        next();
    } catch (err) {
        return res.status(500).json({ error: 'Server error checking authorization' });
    }
};

/**
 * Authorization middleware for restaurant owners.
 * Must be used after authenticate and authorizeBusiness.
 */
const authorizeRestaurantOwner = async (req, res, next) => {
    try {
        const restaurantId = req.params.id;
        const restaurant = await Restaurant.findById(restaurantId);

        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }

        if (restaurant.ownerId.toString() !== req.userId && !req.isAdmin) {
            return res.status(403).json({ error: 'Access denied: You do not own this restaurant' });
        }
        next();
    } catch (err) {
        return res.status(500).json({ error: 'Server error checking restaurant ownership' });
    }
};

module.exports = { authenticate, authorizeBusiness, authorizeRestaurantOwner };
