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
    const { displayName, username, password, profileImage } = req.body;

    if (!displayName) {
        return res.status(400).json({ message: 'Display name is required' });
    }
    if (!username) {
        return res.status(400).json({ message: 'Username is required' });
    }
    if (!password) {
        return res.status(400).json({ message: 'Password is required' });
    }

    if (userModel.getUserByUsername(username)) {
        return res.status(409).json({ message: 'Username already taken' });
    }

    const createdUser = userModel.createUser({ displayName, username, password, profileImage });

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

    const { displayName, profileImage } = req.body;
    const updates = {};
    if (displayName !== undefined) updates.displayName = displayName;
    if (profileImage !== undefined) updates.profileImage = profileImage;

    const updatedUser = userModel.updateUser(req.params.id, updates);
    if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(toPublic(updatedUser));
};

module.exports = {
    getAllUsers,
    createUser,
    getUserById,
    updateUser
};
