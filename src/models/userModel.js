const { randomUUID } = require('crypto');

/**
 * In-memory user store (volatile: cleared on restart).
 * Mirrors the array-based pattern used by restaurantModel / productModel.
 *
 * A user record holds the fields a registration screen collects. The
 * `password` is an exercise-only value used solely to verify logins; it is
 * never exposed by the API (see userController.toPublic) and must never hold a
 * real secret.
 */
let users = [];

const createUser = (userData) => {
    const newUser = { id: randomUUID(), ...userData };
    users.push(newUser);
    return newUser;
};

const getUserById = (id) => {
    return users.find(user => user.id === id);
};

const getUserByEmail = (email) => {
    return users.find(user => user.email === email);
};

module.exports = {
    createUser,
    getUserById,
    getUserByEmail
};
