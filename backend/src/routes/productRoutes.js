const express = require('express');

// We use mergeParams to access the :id parameter from the parent restaurant route
const router = express.Router({ mergeParams: true });

const productController = require('../controllers/productController');
const { authenticate, authorizeBusiness, authorizeRestaurantOwner } = require('../middlewares/authMiddleware');

// Map endpoints for /api/restaurants/:id/products
router.get('/', productController.getProducts);
router.post('/', authenticate, authorizeBusiness, authorizeRestaurantOwner, productController.createProduct);

// Map endpoints for /api/restaurants/:id/products/:pId
router.get('/:pId', productController.getProductById);
router.patch('/:pId', authenticate, authorizeBusiness, authorizeRestaurantOwner, productController.updateProduct);
router.delete('/:pId', authenticate, authorizeBusiness, authorizeRestaurantOwner, productController.deleteProduct);

module.exports = router;