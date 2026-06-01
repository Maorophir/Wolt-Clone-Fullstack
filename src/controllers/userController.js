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
 * POST /api/users  (PRS-95)
 * Registers a new user. Per the spec the response carries the new resource's
 * location in the Location header with an empty body (201 Created).
 */
const createUser = (req, res) => {
    const { name, email, phone, address, password } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }
    if (!password) {
        return res.status(400).json({ error: 'Password is required' });
    }

    if (userModel.getUserByEmail(email)) {
        return res.status(409).json({ error: 'Email already registered' });
    }

    const createdUser = userModel.createUser({ name, email, phone, address, password });

    res.status(201)
   .location(`/api/users/${createdUser.id}`)
   .json(toPublic(createdUser));
};

/**
 * GET /api/users/:id  (PRS-100)
 * Returns the profile details of the requested user (without the password).
 */
const getUserById = (req, res) => {
    const user = userModel.getUserById(req.params.id);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(toPublic(user));
};

module.exports = {
    createUser,
    getUserById
};
