const userModel = require('../models/userModel');

/**
 * POST /api/tokens 
 * Verifies a user's credentials (login screen). On success it returns the
 * user's id, which the client then passes back as the auth header on protected
 * requests. This is intentionally minimal for this exercise and will evolve
 * into a real token in a later exercise.
 */
const login = (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = userModel.getUserByUsername(username);

    // Same response for "no such user" and "wrong password" so we don't leak
    // which usernames are registered.
    if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Invalid username or password' });
    }

    res.status(200).json({ userId: user.id });
};

module.exports = {
    login
};
