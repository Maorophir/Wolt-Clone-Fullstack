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

/**
 * Authorization middleware.
 * Must be used after authenticate middleware.
 */
const authorizeBusiness = (req, res, next) => {
    const user = userModel.getUserById(req.userId);
    if (!user || !user.isBusinessOwner) {
        return res.status(403).json({ error: 'Access denied: Business Owner only' });
    }
    next();
};

/**
 * Authorization middleware for restaurant owners.
 * Must be used after authenticate and authorizeBusiness.
 */
const authorizeRestaurantOwner = (req, res, next) => {
    const restaurantModel = require('../models/restaurantModel');
    const restaurantId = req.params.id;
    const restaurant = restaurantModel.getRestaurantById(restaurantId);

    if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
    }

    if (restaurant.ownerId !== req.userId) {
        return res.status(403).json({ error: 'Access denied: You do not own this restaurant' });
    }
    next();
};

module.exports = { authenticate, authorizeBusiness, authorizeRestaurantOwner };
