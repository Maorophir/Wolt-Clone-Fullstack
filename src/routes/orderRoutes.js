const express = require('express');

const router = express.Router();

const orderController = require('../controllers/orderController');
const authenticate = require('../middlewares/authMiddleware');

// All order endpoints require an authenticated user .
router.use(authenticate);

// /api/orders
router.post('/', orderController.createOrder);
router.get('/', orderController.getOrders);

// /api/orders/:id
router.get('/:id', orderController.getOrderById);
router.patch('/:id', orderController.updateOrder);
router.delete('/:id', orderController.deleteOrder);

module.exports = router;
