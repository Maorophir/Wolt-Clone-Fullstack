/**
 * Shared in-memory storage for the HTTP API.
 * Data is volatile and resets when the process restarts.
 */
const storage = {
    users: new Map(),
    restaurants: new Map(),
    products: new Map(),
    orders: new Map()
};

module.exports = storage;
