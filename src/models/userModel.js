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
    const newUser = { id: randomUUID(), isBusinessOwner: false, ...userData };
    users.push(newUser);
    return newUser;
};

const getUserById = (id) => {
    return users.find(user => user.id === id);
};

const getUserByUsername = (username) => {
    return users.find(user => user.username === username);
};

const updateUser = (id, updates) => {
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex === -1) return null;
    users[userIndex] = { ...users[userIndex], ...updates };
    return users[userIndex];
};

const getAllUsers = () => {
    return users;
};

module.exports = {
    createUser,
    getUserById,
    getUserByUsername,
    getAllUsers,
    updateUser
};
