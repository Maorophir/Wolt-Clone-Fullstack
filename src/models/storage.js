/**
 * In-Memory Database Storage
 * Note: All data stored here is volatile and will be lost when the server restarts.
 * We use Map objects for O(1) lookup, insertion, and deletion times.
 */

const storage = {
    // Stores all users. Key: userId, Value: user object
    users: new Map(),

    // Stores all restaurants. Key: restaurantId, Value: restaurant object
    restaurants: new Map(),

    // Stores all products. Key: productId, Value: product object
    // Each product should contain a reference to its restaurantId
    products: new Map(),

    // Stores all orders. Key: orderId, Value: order object
    orders: new Map()
};

module.exports = storage;