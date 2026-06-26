const Order = require('../models/orderModel');
const { parseAddressData } = require('../utils/addressUtils');

const createOrder = async (req, res) => {
    try {
        const { restaurantId, items, deliveryAddress } = req.body;

        if (!restaurantId) {
            return res.status(400).json({ error: 'restaurantId is required' });
        }
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Order must contain at least one item' });
        }

        let addressData;
        try {
            addressData = parseAddressData(deliveryAddress);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }

        // Calculate the total price based on the items
        const totalPrice = items.reduce((acc, item) => acc + ((item.price || 0) * (item.quantity || 1)), 0);

        const newOrderData = {
            userId: req.userId,
            restaurantId,
            items,
            deliveryAddress: addressData,
            totalPrice
        };

        const createdOrder = await Order.create(newOrderData);

        res.status(201).location(`/api/orders/${createdOrder._id}`).end();
    } catch (error) {
        res.status(500).json({ error: 'Server error creating order', details: error.message });
    }
};

const getOrders = async (req, res) => {
    try {
        const query = req.isAdmin ? {} : { userId: req.userId };
        const orders = await Order.find(query);
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Server error fetching orders' });
    }
};

const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order || (order.userId.toString() !== req.userId && !req.isAdmin)) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ error: 'Server error fetching order' });
    }
};

const updateOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order || (order.userId.toString() !== req.userId && !req.isAdmin)) {
            return res.status(404).json({ error: 'Order not found' });
        }
        await Order.findByIdAndUpdate(req.params.id, req.body);
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ error: 'Server error updating order' });
    }
};

const deleteOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order || (order.userId.toString() !== req.userId && !req.isAdmin)) {
            return res.status(404).json({ error: 'Order not found' });
        }
        await Order.findByIdAndDelete(req.params.id);
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ error: 'Server error deleting order' });
    }
};

module.exports = {
    createOrder,
    getOrders,
    getOrderById,
    updateOrder,
    deleteOrder
};
