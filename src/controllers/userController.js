const { createToken } = require('../utils/jwt');
const userModel = require('../models/userModel');

/**
 * Returns a copy of the user safe to send over the API: the password is an
 * internal, exercise-only field and must never leave the server.
 */
const toPublic = (user) => {
    const { password, ...publicUser } = user;
    return publicUser;
};

/**
 * GET /api/users (Test endpoint - see all registered users)
 */
const getAllUsers = (req, res) => {
    const allUsers = userModel.getAllUsers();
    const publicUsers = allUsers.map(toPublic);
    res.status(200).json(publicUsers);
};

/**
 * POST /api/users 
 * Registers a new user. Per the spec the response carries the new resource's
 * location in the Location header with an empty body (201 Created).
 */
const createUser = (req, res) => {
    const { displayName, username, password, profileImage, isBusinessOwner, addresses } = req.body;

    if (!displayName) {
        return res.status(400).json({ message: 'Display name is required' });
    }
    if (!username) {
        return res.status(400).json({ message: 'Username is required' });
    }
    if (!password) {
        return res.status(400).json({ message: 'Password is required' });
    }
    if (password.length < 8 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long and contain both letters and numbers' });
    }

    if (userModel.getUserByUsername(username)) {
        return res.status(409).json({ message: 'Username already taken' });
    }

    // Optional saved delivery addresses; each must carry valid coordinates
    // (powers "nearby" sorting once the user is logged in).
    if (addresses !== undefined) {
        if (!Array.isArray(addresses)) {
            return res.status(400).json({ message: 'addresses must be an array' });
        }
        for (const a of addresses) {
            const lat = Number(a && a.latitude);
            const lng = Number(a && a.longitude);
            if (!Number.isFinite(lat) || !Number.isFinite(lng) ||
                lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                return res.status(400).json({ message: 'Each address needs a valid latitude/longitude' });
            }
        }
    }

    const createdUser = userModel.createUser({ displayName, username, password, profileImage, isBusinessOwner, addresses });

    const token = createToken({ userId: createdUser.id });

    res.status(201)
        .location(`/api/users/${createdUser.id}`)
        .json({ user: toPublic(createdUser), token });
};

/**
 * GET /api/users/:id 
 * Returns the profile details of the requested user (without the password).
 */
const getUserById = (req, res) => {
    const user = userModel.getUserById(req.params.id);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(toPublic(user));
};

/**
 * PATCH /api/users/:id
 * Updates a user's profile.
 */
const updateUser = (req, res) => {
    // Basic authorization check: users can only update their own profile
    if (req.userId !== req.params.id) {
        return res.status(403).json({ error: 'You can only update your own profile' });
    }

    const { displayName, profileImage, addresses } = req.body;
    const updates = {};
    if (displayName !== undefined) updates.displayName = displayName;
    if (profileImage !== undefined) updates.profileImage = profileImage;
    if (addresses !== undefined) {
        if (!Array.isArray(addresses)) {
            return res.status(400).json({ message: 'addresses must be an array' });
        }
        for (const a of addresses) {
            const lat = Number(a && a.latitude);
            const lng = Number(a && a.longitude);
            if (!Number.isFinite(lat) || !Number.isFinite(lng) ||
                lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                return res.status(400).json({ message: 'Each address needs a valid latitude/longitude' });
            }
        }
        updates.addresses = addresses;
    }

    const updatedUser = userModel.updateUser(req.params.id, updates);
    if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(toPublic(updatedUser));
};

/**
 * GET /api/users/:id/restaurants
 * Returns all restaurants owned by the specified user.
 */
const getUserRestaurants = (req, res) => {
    const restaurantModel = require('../models/restaurantModel');
    const allRestaurants = restaurantModel.getAllRestaurants();
    const userRestaurants = allRestaurants.filter(r => r.ownerId === req.params.id);
    res.status(200).json(userRestaurants);
};

module.exports = {
    getAllUsers,
    createUser,
    getUserById,
    updateUser,
    getUserRestaurants
};
