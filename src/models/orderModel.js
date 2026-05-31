const { randomUUID } = require('crypto');

/**
 * In-memory order store (volatile: cleared on restart).
 * Follows the array-based pattern used by the other models.
 *
 * Each order is owned by the user that created it (`userId`), which lets the
 * controller scope every read/write to the authenticated user.
 */
let orders = [];

const getOrdersByUserId = (userId) => {
    return orders.filter(order => order.userId === userId);
};

const getOrderById = (id) => {
    return orders.find(order => order.id === id);
};

const createOrder = (orderData) => {
    const newOrder = {
        id: randomUUID(),
        status: 'pending',
        createdAt: new Date().toISOString(),
        ...orderData
    };
    orders.push(newOrder);
    return newOrder;
};

const updateOrder = (id, updateData) => {
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) return null;

    // Identity and ownership are immutable once created.
    const { id: _ignoredId, userId: _ignoredUserId, ...safeUpdate } = updateData;
    orders[index] = { ...orders[index], ...safeUpdate };
    return orders[index];
};

const deleteOrder = (id) => {
    const initialLength = orders.length;
    orders = orders.filter(o => o.id !== id);
    return orders.length < initialLength;
};

module.exports = {
    getOrdersByUserId,
    getOrderById,
    createOrder,
    updateOrder,
    deleteOrder
};
