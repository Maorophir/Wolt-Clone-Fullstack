const orderModel = require('../models/orderModel');

/**
 * Orders API (/).
 *
 * Every endpoint here runs behind the auth middleware, so `req.userId` is
 * always the authenticated user. Orders are strictly scoped to their owner:
 * an order belonging to another user is reported as 404 (not found) so we never
 * disclose the existence of someone else's order.
 */

/**
 * Looks up an order and confirms it belongs to the authenticated user.
 * Returns the order, or null if it does not exist or is not owned by them.
 */
const findOwnedOrder = (id, userId) => {
    const order = orderModel.getOrderById(id);
    if (!order || order.userId !== userId) return null;
    return order;
};

// POST /api/orders -> create a new order for the authenticated user.
const createOrder = (req, res) => {
    const { restaurantId, items, deliveryAddress } = req.body;

    if (!restaurantId) {
        return res.status(400).json({ error: 'restaurantId is required' });
    }
    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Order must contain at least one item' });
    }

    const createdOrder = orderModel.createOrder({
        userId: req.userId,
        restaurantId,
        items,
        deliveryAddress
    });

    res.status(201).location(`/api/orders/${createdOrder.id}`).end();
};

// GET /api/orders -> list the authenticated user's orders.
const getOrders = (req, res) => {
    res.status(200).json(orderModel.getOrdersByUserId(req.userId));
};

// GET /api/orders/:id -> a single order owned by the authenticated user.
const getOrderById = (req, res) => {
    const order = findOwnedOrder(req.params.id, req.userId);
    if (!order) {
        return res.status(404).json({ error: 'Order not found' });
    }
    res.status(200).json(order);
};

// PATCH /api/orders/:id -> update an owned order.
const updateOrder = (req, res) => {
    if (!findOwnedOrder(req.params.id, req.userId)) {
        return res.status(404).json({ error: 'Order not found' });
    }
    orderModel.updateOrder(req.params.id, req.body);
    res.status(204).end();
};

// DELETE /api/orders/:id -> delete an owned order.
const deleteOrder = (req, res) => {
    if (!findOwnedOrder(req.params.id, req.userId)) {
        return res.status(404).json({ error: 'Order not found' });
    }
    orderModel.deleteOrder(req.params.id);
    res.status(204).end();
};

module.exports = {
    createOrder,
    getOrders,
    getOrderById,
    updateOrder,
    deleteOrder
};
